import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AlertBanner from '../components/AlertBanner';
import BarChart from '../components/BarChart';
import Button from '../components/Button';
import FairPriceBadge from '../components/FairPriceBadge';
import FormField from '../components/FormField';
import InfoCard, { MetaRow } from '../components/InfoCard';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import { Colors, Spacing } from '../constants/theme';
import { useFairPriceCheck, useMarketPrice, useMarketPriceHistory } from '../hooks/useMarketplace';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { formatInr, formatIsoDate } from '../utils/format';

/**
 * Fallback rows (shown when the backend is unreachable) plus the market key
 * each crop's price feed is published under — see backend
 * app/services/marketplace/market_price_service.py (DEFAULT_PRICES).
 */
const PRICES = [
  { crop: 'Paddy', market: '₹2,300', msp: '₹2,283', centre: 'Kottayam Procurement Centre', unit: 'Quintal', updated: 'Today, 09:30', region: 'Kottayam', state: 'Kerala' },
  { crop: 'Wheat', market: '₹2,275', msp: '₹2,275', centre: 'Ludhiana Grain Market Centre', unit: 'Quintal', updated: 'Today, 09:20', region: 'Mysuru', state: 'Karnataka' },
  { crop: 'Maize', market: '₹2,400', msp: '₹2,100', centre: 'Coimbatore Procurement Centre', unit: 'Quintal', updated: 'Today, 09:10', region: 'Coimbatore', state: 'Tamil Nadu' },
  { crop: 'Coconut', market: '₹11,000', msp: 'Not applicable', centre: 'Alappuzha Procurement Centre', unit: 'Quintal', updated: 'Today, 08:50', region: 'Kottayam', state: 'Kerala' },
];

export default function PricesScreen() {
  const { t, fs } = useI18n();
  const [crop, setCrop] = useState('Paddy');
  const [offerPrice, setOfferPrice] = useState('');
  const [lowOffer, setLowOffer] = useState<string | null>(null);

  const selected = PRICES.find((item) => item.crop === crop) ?? PRICES[0];
  const scope = { crop: selected.crop, region: selected.region, state: selected.state };
  // Live feed for the selected crop; `null` keeps the hook idle on the "All" view.
  const { summary, loading, live } = useMarketPrice(crop === 'All' ? null : scope);
  const history = useMarketPriceHistory(crop === 'All' ? null : scope, { days: 30, points: 14 });
  const fair = useFairPriceCheck(scope);

  const shown = crop === 'All' ? PRICES : [selected];
  const hasLive = live && summary !== null && crop !== 'All';
  const offered = Number(offerPrice);
  const canCheck = offered > 0 && !fair.checking;

  // Today's modal price versus the 30-day average, in one sentence.
  const trend = (() => {
    if (!hasLive || !summary) return null;
    const avg = Number(summary.price_30d_avg ?? 0);
    const modal = Number(summary.modal_price ?? 0);
    if (!(avg > 0)) return null;
    const pct = ((modal - avg) / avg) * 100;
    if (pct >= 1) return t('prices.trendUp', { pct: pct.toFixed(1) });
    if (pct <= -1) return t('prices.trendDown', { pct: Math.abs(pct).toFixed(1) });
    return t('prices.trendFlat');
  })();

  const runCheck = async () => {
    setLowOffer(null);
    const indicator = await fair.check(offered);
    // Below-market offers raise the low-offer alert with the counter price the
    // backend suggests (market average) — same -10% threshold as the API.
    if (indicator && indicator.status === 'below_market') {
      setLowOffer(t('prices.counterAsk', { price: formatInr(indicator.market_avg_price) }));
    }
  };

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.prices') }]}>
      <SectionHeading title={t('prices.title')} subtitle={t('prices.subtitle')} />

      {hasLive ? (
        <AlertBanner
          tone="success"
          title={t('prices.live')}
          message={`${t('prices.source')}: ${selected.region}, ${selected.state} · ${formatIsoDate(summary?.price_date)}`}
        />
      ) : (
        <AlertBanner tone="warning" title={t('common.mockData')} message={t('prices.disclaimer')} />
      )}

      <InfoCard title={t('prices.filters')}>
        <View style={styles.chips}>
          {['All', ...PRICES.map((item) => item.crop)].map((item) => (
            <Button key={item} small label={item} variant={crop === item ? 'primary' : 'outline-secondary'} onPress={() => setCrop(item)} />
          ))}
        </View>
      </InfoCard>

      <View style={styles.list}>
        {shown.map((item) => {
          const isLiveRow = item.crop === selected.crop && hasLive;
          return (
            <InfoCard key={item.crop} accent={Colors.green} title={item.crop}>
              <Text style={[styles.price, { fontSize: fs(30) }]}>
                {isLiveRow ? `₹${formatInr(summary?.modal_price)}` : item.market}
              </Text>
              <Text style={styles.unit}>{t('prices.perQuintal')}</Text>
              {loading && !isLiveRow ? (
                <Text style={[styles.hint, { fontSize: fs(12) }]}>{t('common.loading')}</Text>
              ) : null}
              {isLiveRow ? (
                <>
                  <MetaRow label={t('prices.range')} value={`₹${formatInr(summary?.min_price)} – ₹${formatInr(summary?.max_price)}`} />
                  <MetaRow label={t('prices.avg30')} value={`₹${formatInr(summary?.price_30d_avg)}`} />
                  <MetaRow label={t('prices.updated')} value={formatIsoDate(summary?.price_date)} />
                </>
              ) : (
                <>
                  <MetaRow label={t('prices.msp')} value={item.msp} />
                  <MetaRow label={t('prices.centre')} value={item.centre} />
                  <MetaRow label={t('prices.updated')} value={item.updated} />
                </>
              )}
            </InfoCard>
          );
        })}
      </View>

      {crop !== 'All' ? (
        <InfoCard title={t('prices.historyTitle')} accent={Colors.info}>
          {history.series.length > 0 ? (
            <>
              <Text style={[styles.hint, { fontSize: fs(12) }]}>{t('prices.historyHint')}</Text>
              <BarChart title={t('prices.historyTitle')} data={history.series} />
            </>
          ) : (
            <Text style={[styles.hint, { fontSize: fs(12) }]}>
              {history.loading ? t('common.loading') : t('prices.historyEmpty')}
            </Text>
          )}
          {trend ? <AlertBanner tone="info" title={t('prices.avg30')} message={trend} /> : null}
        </InfoCard>
      ) : null}

      {crop !== 'All' ? (
        <InfoCard title={t('prices.checkTitle')} accent={Colors.saffron}>
          <Text style={[styles.hint, { fontSize: fs(13) }]}>{t('prices.checkHint')}</Text>
          <FormField
            label={t('prices.checkLabel')}
            value={offerPrice}
            onChangeText={setOfferPrice}
            keyboardType="numeric"
            maxLength={8}
            placeholder={hasLive ? formatInr(summary?.modal_price) : '1875'}
            hint={t('prices.checkExample')}
          />
          <Button
            label={t('prices.checkAction')}
            onPress={() => void runCheck()}
            disabled={!canCheck}
            loading={fair.checking}
          />
          {fair.error ? <Text style={[styles.error, { fontSize: fs(13) }]}>{t('prices.checkError')}</Text> : null}
          <View style={styles.badgeWrap}>
            {fair.indicator ? <FairPriceBadge indicator={fair.indicator} showPrices showMessage /> : null}
            {lowOffer ? <AlertBanner tone="error" title={t('prices.lowOffer')} message={lowOffer} /> : null}
          </View>
        </InfoCard>
      ) : null}

      <Button label={t('prices.viewMarketplace')} variant="secondary" onPress={() => router.push(path.marketplace)} />
      <Button label={t('prices.findCentre')} onPress={() => router.push(path.centres)} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  list: { gap: 0 },
  price: { color: Colors.primary, fontWeight: '800' },
  unit: { color: Colors.textSecondary, marginBottom: Spacing.md },
  hint: { color: Colors.textSecondary, marginBottom: Spacing.md },
  error: { color: Colors.danger, fontWeight: '600', marginTop: Spacing.sm },
  badgeWrap: { gap: Spacing.md, marginTop: Spacing.md },
});

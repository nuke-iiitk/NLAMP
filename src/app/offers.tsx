import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AlertBanner from '../components/AlertBanner';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import FormField from '../components/FormField';
import InfoCard, { MetaRow } from '../components/InfoCard';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useOfferInbox } from '../hooks/useMarketplace';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { api } from '../services/api';
import type { ApiOffer } from '../services/api';
import { useStore } from '../store/AppStore';
import { formatDeviation, formatInr, formatIsoDate, formatKg, formatRate } from '../utils/format';

/** Status views; `key` is passed straight to the backend `status` filter. */
const FILTERS: {
  key: string;
  label: 'offers.pending' | 'offers.accepted' | 'offers.rejected' | 'offers.countered' | 'offers.all';
}[] = [
  { key: 'PENDING', label: 'offers.pending' },
  { key: 'ACCEPTED', label: 'offers.accepted' },
  { key: 'REJECTED', label: 'offers.rejected' },
  { key: 'COUNTERED', label: 'offers.countered' },
  { key: '', label: 'offers.all' },
];

const STATUS_TONE: Record<string, string> = {
  PENDING: Colors.saffronDark,
  ACCEPTED: Colors.green,
  REJECTED: Colors.danger,
  COUNTERED: Colors.info,
  CANCELLED: Colors.textMuted,
  EXPIRED: Colors.textMuted,
};

/** Below-market threshold used by the backend low-offer alert (-10%). */
const LOW_OFFER_PCT = -10;

export default function OffersScreen() {
  const { t, fs } = useI18n();
  const { farmer } = useStore();

  const [status, setStatus] = useState('PENDING');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [counterFor, setCounterFor] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('');

  // `farmer.id` is the backend farmer id/code; the inbox also returns offers
  // made against pooled lots this farmer has joined.
  const inbox = useOfferInbox({ farmerId: farmer?.id, status: status || undefined });

  const respond = async (offer: ApiOffer, next: string) => {
    setBusyId(offer.id);
    setError(null);
    setNotice(null);
    const response = await api.updateOffer(offer.id, { status: next });
    setBusyId(null);
    if (!response.ok) {
      setError(t('offers.updateError'));
      return;
    }
    setNotice(t('offers.updated'));
    inbox.reload();
  };

  const sendCounter = async (offer: ApiOffer) => {
    const price = Number(counterPrice);
    if (!(price > 0) || !offer.farmer_id) return;
    setBusyId(offer.id);
    setError(null);
    setNotice(null);
    const created = await api.createOffer({
      requirement_id: offer.requirement_id,
      farmer_id: offer.farmer_id,
      parent_offer_id: offer.id,
      price_per_quintal: price,
      quantity_kg: Number(offer.quantity_kg),
    });
    if (!created.ok) {
      setBusyId(null);
      setError(t('offers.counterError'));
      return;
    }
    // The parent offer is answered by a counter, so it leaves the pending inbox.
    await api.updateOffer(offer.id, { status: 'COUNTERED' });
    setBusyId(null);
    setCounterFor(null);
    setCounterPrice('');
    setNotice(t('offers.updated'));
    inbox.reload();
  };

  if (!farmer?.id) {
    return (
      <ScreenShell breadcrumbs={[{ label: t('nav.offers') }]}>
        <SectionHeading title={t('offers.title')} subtitle={t('offers.subtitle')} />
        <AlertBanner tone="info" title={t('marketplace.signInHint')} message={t('offers.signInHint')} />
        <Button label={t('nav.login')} onPress={() => router.push(path.login)} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.offers') }]}>
      <SectionHeading title={t('offers.title')} subtitle={t('offers.subtitle')} />
      {!inbox.live && !inbox.loading ? (
        <AlertBanner tone="warning" title={t('common.mockData')} message={t('offers.offline')} />
      ) : null}

      <InfoCard title={t('pools.filters')}>
        <View style={styles.chips}>
          {FILTERS.map((filter) => (
            <Button
              key={filter.label}
              small
              label={t(filter.label)}
              active={status === filter.key}
              variant={status === filter.key ? 'primary' : 'outline-secondary'}
              onPress={() => setStatus(filter.key)}
            />
          ))}
        </View>
      </InfoCard>

      {notice ? <AlertBanner tone="success" title={t('offers.updated')} message={notice} /> : null}
      {error ? <AlertBanner tone="error" title={t('offers.updateError')} message={error} /> : null}

      {inbox.loading ? (
        <Text style={[styles.hint, { fontSize: fs(13) }]}>{t('common.loading')}</Text>
      ) : null}
      {!inbox.loading && inbox.items.length === 0 ? (
        <EmptyState title={t('offers.empty')} message={t('offers.signInHint')} />
      ) : null}

      {inbox.items.map((offer) => {
        const deviation = Number(offer.deviation_pct ?? 0);
        const low = offer.market_avg_price !== null && deviation <= LOW_OFFER_PCT;
        return (
          <InfoCard
            key={offer.id}
            accent={low ? Colors.danger : Colors.green}
            title={`${formatRate(offer.price_per_quintal)} · ${
              offer.pooled_lot_id ? t('nav.pools') : t('offers.buyer')
            }`}
          >
            <Text
              style={[
                styles.status,
                { fontSize: fs(12), color: STATUS_TONE[offer.status] ?? Colors.textMuted },
              ]}
            >
              {offer.status}
            </Text>
            <MetaRow label={t('offers.quantity')} value={formatKg(offer.quantity_kg)} />
            <MetaRow
              label={t('offers.marketAvg')}
              value={offer.market_avg_price ? formatRate(offer.market_avg_price) : '—'}
            />
            <MetaRow label={t('offers.deviation')} value={formatDeviation(offer.deviation_pct)} />
            <MetaRow label={t('offers.buyer')} value={offer.buyer_id.slice(0, 8)} />
            <MetaRow
              label={t('offers.received')}
              value={formatIsoDate(offer.created_at.slice(0, 10))}
            />
            {offer.is_counter ? (
              <Text style={[styles.hint, { fontSize: fs(12) }]}>{t('offers.countered')}</Text>
            ) : null}
            {low && offer.market_avg_price ? (
              <AlertBanner
                tone="error"
                title={t('prices.lowOffer')}
                message={t('prices.counterAsk', { price: formatInr(offer.market_avg_price) })}
              />
            ) : null}

            {offer.status === 'PENDING' ? (
              <View style={styles.actions}>
                <Button
                  small
                  variant="success"
                  label={t('offers.accept')}
                  loading={busyId === offer.id}
                  onPress={() => void respond(offer, 'ACCEPTED')}
                />
                <Button
                  small
                  variant="danger"
                  label={t('offers.reject')}
                  disabled={busyId === offer.id}
                  onPress={() => void respond(offer, 'REJECTED')}
                />
                <Button
                  small
                  variant="outline-primary"
                  label={t('offers.counter')}
                  disabled={busyId === offer.id}
                  onPress={() => {
                    setCounterFor(counterFor === offer.id ? null : offer.id);
                    setCounterPrice(offer.market_avg_price ?? offer.price_per_quintal);
                  }}
                />
              </View>
            ) : null}

            {counterFor === offer.id ? (
              <View style={styles.counterBox}>
                <FormField
                  label={t('offers.counterLabel')}
                  value={counterPrice}
                  onChangeText={setCounterPrice}
                  keyboardType="numeric"
                  maxLength={8}
                  placeholder={offer.market_avg_price ?? offer.price_per_quintal}
                />
                <Button
                  small
                  label={t('offers.counterAction')}
                  loading={busyId === offer.id}
                  onPress={() => void sendCounter(offer)}
                />
              </View>
            ) : null}
          </InfoCard>
        );
      })}

      <Button
        label={t('prices.viewMarketplace')}
        variant="secondary"
        onPress={() => router.push(path.marketplace)}
      />
      <Button
        label={t('marketplace.viewPools')}
        variant="outline-primary"
        onPress={() => router.push(path.pools)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  hint: { color: Colors.textSecondary, marginBottom: Spacing.md },
  status: { fontWeight: '800', letterSpacing: 0.4, marginBottom: Spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  counterBox: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
  },
});

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AlertBanner from '../components/AlertBanner';
import Button from '../components/Button';
import FairPriceBadge from '../components/FairPriceBadge';
import FormField from '../components/FormField';
import InfoCard, { MetaRow } from '../components/InfoCard';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import { Colors, Spacing } from '../constants/theme';
import { useFarmerMatches, useMarketPrice } from '../hooks/useMarketplace';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { api } from '../services/api';
import type { ApiPayoutLine, ApiPooledLot } from '../services/api';
import { useStore } from '../store/AppStore';
import { formatInr, formatIsoDate, formatKg, formatRate } from '../utils/format';

/** 50 quintals — the backend's bulk-order threshold for pooled lots. */
const BULK_THRESHOLD_KG = 5000;
/** Fallback listing so the screen still demonstrates the engine in demo mode. */
const DEMO_LISTING = { crop: 'Paddy', quantityKg: '500', district: 'Kottayam', state: 'Kerala' };

export default function MarketplaceScreen() {
  const { t, fs } = useI18n();
  const { farmer } = useStore();

  const [crop, setCrop] = useState(farmer?.crop || DEMO_LISTING.crop);
  const [quantityKg, setQuantityKg] = useState(farmer?.quantityKg || DEMO_LISTING.quantityKg);
  const [district, setDistrict] = useState(farmer?.district || DEMO_LISTING.district);
  const [listingState, setListingState] = useState(farmer?.state || DEMO_LISTING.state);

  const [lot, setLot] = useState<ApiPooledLot | null>(null);
  const [poolBusy, setPoolBusy] = useState(false);
  const [poolError, setPoolError] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<ApiPayoutLine[] | null>(null);

  // `farmer.id` is the backend farmer_code, which the matching endpoint accepts.
  const matches = useFarmerMatches(
    farmer?.id
      ? { farmerId: farmer.id, crop, quantityKg, state: listingState, district, limit: 5 }
      : null
  );
  const price = useMarketPrice({ crop, region: district, state: listingState });

  const myMembership = useMemo(
    () => lot?.members.find((member) => member.farmer_id === farmer?.id) ?? null,
    [lot, farmer?.id]
  );

  const findPool = async () => {
    setPoolBusy(true);
    setPoolError(null);
    setPayouts(null);
    const response = await api.autoCreatePooledLot({
      crop,
      state: listingState,
      district,
      bulkThresholdKg: BULK_THRESHOLD_KG,
    });
    setPoolBusy(false);
    if (response.ok) {
      setLot(response.data);
      return;
    }
    setLot(null);
    setPoolError(t('marketplace.poolingError'));
  };

  const confirmMine = async () => {
    if (!lot || !farmer?.id) return;
    const response = await api.confirmPooledLotParticipation(lot.id, farmer.id);
    if (!response.ok) return;
    const refreshed = await api.getPooledLot(lot.id);
    if (refreshed.ok) setLot(refreshed.data);
  };

  const loadPayouts = async () => {
    if (!lot) return;
    const response = await api.pooledLotPayout(lot.id);
    if (response.ok) setPayouts(response.data.payouts);
  };

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.marketplace') }]}>
      <SectionHeading title={t('marketplace.title')} subtitle={t('marketplace.subtitle')} />

      {!farmer?.id ? (
        <AlertBanner tone="info" title={t('nav.login')} message={t('marketplace.signInHint')} />
      ) : !matches.live && !matches.loading ? (
        <AlertBanner tone="warning" title={t('common.mockData')} message={t('marketplace.offline')} />
      ) : null}

      <InfoCard title={t('marketplace.yourListing')}>
        <FormField label={t('marketplace.crop')} value={crop} onChangeText={setCrop} />
        <FormField
          label={t('marketplace.quantity')}
          value={quantityKg}
          onChangeText={setQuantityKg}
          keyboardType="numeric"
          maxLength={7}
        />
        <FormField label={t('marketplace.district')} value={district} onChangeText={setDistrict} />
        <FormField label={t('marketplace.state')} value={listingState} onChangeText={setListingState} />
        {price.summary ? (
          <MetaRow label={t('fairPrice.marketAverage')} value={formatRate(price.summary.modal_price)} />
        ) : null}
        <Button
          label={t('marketplace.refresh')}
          variant="secondary"
          onPress={matches.reload}
          loading={matches.loading}
        />
      </InfoCard>

      <InfoCard title={t('marketplace.matchesTitle')} accent={Colors.green}>
        <Text style={[styles.hint, { fontSize: fs(13) }]}>{t('marketplace.matchesHint')}</Text>
        {matches.matches.length === 0 ? (
          <Text style={[styles.empty, { fontSize: fs(14) }]}>
            {matches.loading ? t('common.loading') : t('marketplace.noMatches')}
          </Text>
        ) : (
          matches.matches.map((item) => (
            <View key={item.requirement.id} style={styles.block}>
              <Text style={[styles.blockTitle, { fontSize: fs(16) }]}>
                {`${item.requirement.crop} · ${formatRate(item.requirement.offered_price_per_quintal)}`}
              </Text>
              <FairPriceBadge indicator={item.fair_price} small showPrices />
              <MetaRow
                label={t('marketplace.quantityRange')}
                value={`${formatKg(item.requirement.min_quantity_kg)} – ${formatKg(item.requirement.max_quantity_kg)}`}
              />
              <MetaRow
                label={t('marketplace.location')}
                value={`${item.requirement.district ? `${item.requirement.district}, ` : ''}${item.requirement.state}`}
              />
              <MetaRow
                label={t('marketplace.matchScore')}
                value={`${Math.round(item.match_score.total_score * 100)}%`}
              />
              <Text style={[styles.scores, { fontSize: fs(12) }]}>
                {`${t('marketplace.scorePrice')} ${Math.round(item.match_score.price_score * 100)}% · ${t('marketplace.scoreDistance')} ${Math.round(item.match_score.distance_score * 100)}% · ${t('marketplace.scoreQuantity')} ${Math.round(item.match_score.quantity_score * 100)}% · ${t('marketplace.scoreReliability')} ${Math.round(item.match_score.reliability_score * 100)}%`}
              </Text>
            </View>
          ))
        )}
      </InfoCard>

      <InfoCard title={t('marketplace.poolingTitle')} accent={Colors.saffron}>
        <Text style={[styles.hint, { fontSize: fs(13) }]}>
          {t('marketplace.poolingHint', {
            quantity: formatInr(quantityKg || 0),
            threshold: formatInr(BULK_THRESHOLD_KG),
          })}
        </Text>
        <Button
          label={t('marketplace.poolingAction')}
          onPress={() => void findPool()}
          loading={poolBusy}
        />
        {poolError ? (
          <AlertBanner tone="error" title={t('marketplace.poolingTitle')} message={poolError} />
        ) : null}

        {lot ? (
          <View style={styles.block}>
            <Text style={[styles.blockTitle, { fontSize: fs(16) }]}>
              {t('marketplace.poolingCreated', {
                code: lot.lot_code,
                members: lot.members.length,
                total: formatInr(lot.total_quantity_kg),
              })}
            </Text>
            <MetaRow label={t('marketplace.status')} value={lot.status} />
            <MetaRow label={t('marketplace.totalQuantity')} value={formatKg(lot.total_quantity_kg)} />
            <MetaRow
              label={t('marketplace.suggestedRate')}
              value={lot.suggested_price_per_quintal ? formatRate(lot.suggested_price_per_quintal) : '—'}
            />
            <MetaRow label={t('marketplace.expiresOn')} value={formatIsoDate(lot.expires_at)} />
            <Text style={[styles.blockTitle, { fontSize: fs(14) }]}>
              {`${t('marketplace.members')} (${lot.members.length})`}
            </Text>
            {lot.members.map((member) => (
              <Text key={member.id} style={[styles.scores, { fontSize: fs(12) }]}>
                {`${member.is_confirmed ? '✓ ' : ''}${member.farmer_id.slice(0, 8)} · ${formatKg(member.quantity_kg)} · ${t('marketplace.share')} ${((Number(member.quantity_kg) / Number(lot.total_quantity_kg || 1)) * 100).toFixed(1)}%`}
              </Text>
            ))}
            {myMembership && !myMembership.is_confirmed ? (
              <Button
                label={t('marketplace.confirmMine')}
                variant="secondary"
                onPress={() => void confirmMine()}
              />
            ) : null}
            <Text style={[styles.blockTitle, { fontSize: fs(14) }]}>{t('marketplace.payoutTitle')}</Text>
            {lot.matched_requirement_id ? (
              <>
                <Button
                  label={t('marketplace.payoutAction')}
                  variant="outline-primary"
                  onPress={() => void loadPayouts()}
                />
                {(payouts ?? []).map((line) => (
                  <Text key={line.farmer_id} style={[styles.scores, { fontSize: fs(12) }]}>
                    {`${line.farmer_id.slice(0, 8)} · ₹${formatInr(line.amount)} · ${line.share_pct}%`}
                  </Text>
                ))}
              </>
            ) : (
              <Text style={[styles.hint, { fontSize: fs(12) }]}>{t('marketplace.payoutPending')}</Text>
            )}
          </View>
        ) : null}
      </InfoCard>

      <Button label={t('prices.findCentre')} variant="secondary" onPress={() => router.push(path.centres)} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hint: { color: Colors.textSecondary, marginBottom: Spacing.md },
  empty: { color: Colors.textMuted, fontStyle: 'italic' },
  block: { gap: Spacing.sm, marginBottom: Spacing.lg },
  blockTitle: { color: Colors.text, fontWeight: '800' },
  scores: { color: Colors.textMuted, marginBottom: Spacing.sm },
});

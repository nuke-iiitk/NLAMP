import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AlertBanner from '../components/AlertBanner';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import FormField from '../components/FormField';
import InfoCard, { MetaRow } from '../components/InfoCard';
import ProgressTrack from '../components/ProgressTrack';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useOpenPools } from '../hooks/useMarketplace';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { api } from '../services/api';
import type { ApiPayoutLine, ApiPooledLot } from '../services/api';
import { useStore } from '../store/AppStore';
import { formatInr, formatIsoDate, formatKg, formatRate } from '../utils/format';

/** Crops with a market price feed — keeps this filter aligned with /prices. */
const CROPS = ['Paddy', 'Wheat', 'Maize', 'Coconut'];
/** Backend bulk-order threshold for pooled lots (50 quintals). */
const BULK_THRESHOLD_KG = 5000;
/** Pool statuses a farmer can filter on (`''` = every status). */
const STATUS_FILTERS: string[] = ['FORMING', 'READY', 'MATCHED', ''];

const STATUS_TONE: Record<string, string> = {
  FORMING: Colors.saffronDark,
  READY: Colors.green,
  MATCHED: Colors.info,
  COMPLETED: Colors.textMuted,
  CANCELLED: Colors.danger,
};

export default function PoolsScreen() {
  const { t, fs } = useI18n();
  const { farmer } = useStore();

  const [crop, setCrop] = useState(farmer?.crop || CROPS[0]);
  const [status, setStatus] = useState('FORMING');
  const [mineOnly, setMineOnly] = useState(false);
  const [quantity, setQuantity] = useState(farmer?.quantityKg || '500');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<{ lotId: string; lines: ApiPayoutLine[] } | null>(null);

  const pools = useOpenPools({
    crop,
    status: status || undefined,
    farmerId: mineOnly ? farmer?.id : undefined,
  });

  /** Join a lot and confirm in one step, so the farmer's share is locked in. */
  const join = async (lot: ApiPooledLot) => {
    if (!farmer?.id) return;
    setBusyId(lot.id);
    setError(null);
    setNotice(null);
    const added = await api.addFarmerToPooledLot(lot.id, {
      farmer_id: farmer.id,
      quantity_kg: Number(quantity) || 0,
    });
    if (!added.ok) {
      setBusyId(null);
      setError(t('pools.joinError'));
      return;
    }
    await api.confirmPooledLotParticipation(lot.id, farmer.id);
    setBusyId(null);
    setNotice(t('pools.joinSuccess', { code: lot.lot_code }));
    pools.reload();
  };

  const confirmMine = async (lot: ApiPooledLot) => {
    if (!farmer?.id) return;
    setBusyId(lot.id);
    await api.confirmPooledLotParticipation(lot.id, farmer.id);
    setBusyId(null);
    pools.reload();
  };

  const loadPayouts = async (lot: ApiPooledLot) => {
    const response = await api.pooledLotPayout(lot.id);
    if (response.ok) setPayouts({ lotId: lot.id, lines: response.data.payouts });
  };

  if (!farmer?.id) {
    return (
      <ScreenShell breadcrumbs={[{ label: t('nav.pools') }]}>
        <SectionHeading title={t('pools.title')} subtitle={t('pools.subtitle')} />
        <AlertBanner tone="info" title={t('marketplace.signInHint')} message={t('pools.signInHint')} />
        <Button label={t('nav.login')} onPress={() => router.push(path.login)} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.pools') }]}>
      <SectionHeading title={t('pools.title')} subtitle={t('pools.subtitle')} />
      {!pools.live && !pools.loading ? (
        <AlertBanner tone="warning" title={t('common.mockData')} message={t('pools.offline')} />
      ) : null}
      <Text style={[styles.hint, { fontSize: fs(13) }]}>
        {t('pools.bulkHint', { threshold: formatKg(BULK_THRESHOLD_KG) })}
      </Text>

      <InfoCard title={t('pools.filters')}>
        <View style={styles.chips}>
          {CROPS.map((item) => (
            <Button
              key={item}
              small
              label={item}
              active={crop === item}
              variant={crop === item ? 'primary' : 'outline-secondary'}
              onPress={() => setCrop(item)}
            />
          ))}
        </View>
        <View style={styles.chips}>
          {STATUS_FILTERS.map((item) => (
            <Button
              key={item || 'all'}
              small
              label={item || t('pools.all')}
              active={status === item}
              variant={status === item ? 'primary' : 'outline-secondary'}
              onPress={() => setStatus(item)}
            />
          ))}
          <Button
            small
            label={t('pools.mine')}
            active={mineOnly}
            variant={mineOnly ? 'primary' : 'outline-secondary'}
            onPress={() => setMineOnly((current) => !current)}
          />
        </View>
        <FormField
          label={t('pools.yourQuantity')}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          maxLength={7}
        />
      </InfoCard>

      {notice ? <AlertBanner tone="success" title={t('nav.pools')} message={notice} /> : null}
      {error ? <AlertBanner tone="error" title={t('pools.join')} message={error} /> : null}
      {pools.loading ? (
        <Text style={[styles.hint, { fontSize: fs(13) }]}>{t('common.loading')}</Text>
      ) : null}
      {!pools.loading && pools.items.length === 0 ? (
        <EmptyState title={t('pools.empty')} message={t('pools.subtitle')} />
      ) : null}

      {pools.items.map((lot) => {
        const total = Number(lot.total_quantity_kg) || 0;
        const target = Number(lot.target_quantity_kg) || BULK_THRESHOLD_KG;
        const my = lot.members.find((member) => member.farmer_id === farmer.id) ?? null;
        const share = total > 0 ? (Number(my?.quantity_kg ?? 0) / total) * 100 : 0;
        return (
          <InfoCard
            key={lot.id}
            accent={STATUS_TONE[lot.status] ?? Colors.green}
            title={`${lot.crop} · ${lot.lot_code}`}
          >
            <Text
              style={[
                styles.status,
                { fontSize: fs(12), color: STATUS_TONE[lot.status] ?? Colors.textMuted },
              ]}
            >
              {lot.status}
            </Text>
            <ProgressTrack progress={target > 0 ? total / target : 0} />
            <Text style={[styles.hint, { fontSize: fs(12) }]}>
              {t('pools.progress', { total: formatKg(total), target: formatKg(target) })}
            </Text>
            <MetaRow label={t('marketplace.members')} value={String(lot.members.length)} />
            <MetaRow
              label={t('marketplace.suggestedRate')}
              value={
                lot.suggested_price_per_quintal ? formatRate(lot.suggested_price_per_quintal) : '—'
              }
            />
            <MetaRow label={t('marketplace.expiresOn')} value={formatIsoDate(lot.expires_at)} />

            {my ? (
              <>
                <MetaRow
                  label={t('marketplace.share')}
                  value={`${formatKg(my.quantity_kg)} · ${share.toFixed(1)}%`}
                />
                {my.is_confirmed ? (
                  <Text style={[styles.hint, { fontSize: fs(12) }]}>{t('pools.joined')}</Text>
                ) : (
                  <Button
                    small
                    variant="secondary"
                    label={t('marketplace.confirmMine')}
                    loading={busyId === lot.id}
                    onPress={() => void confirmMine(lot)}
                  />
                )}
              </>
            ) : (
              <Button
                small
                label={t('pools.join')}
                loading={busyId === lot.id}
                onPress={() => void join(lot)}
              />
            )}

            {lot.matched_requirement_id ? (
              <>
                <Button
                  small
                  variant="outline-primary"
                  label={t('marketplace.payoutAction')}
                  onPress={() => void loadPayouts(lot)}
                />
                {payouts?.lotId === lot.id
                  ? payouts.lines.map((line) => (
                      <Text key={line.farmer_id} style={[styles.hint, { fontSize: fs(12) }]}>
                        {`${line.farmer_id.slice(0, 8)} · ₹${formatInr(line.amount)} · ${line.share_pct}%`}
                      </Text>
                    ))
                  : null}
              </>
            ) : (
              <Text style={[styles.hint, { fontSize: fs(12) }]}>
                {t('marketplace.payoutPending')}
              </Text>
            )}
          </InfoCard>
        );
      })}

      <Button
        label={t('prices.viewMarketplace')}
        variant="secondary"
        onPress={() => router.push(path.marketplace)}
      />
      <Button
        label={t('marketplace.viewOffers')}
        variant="outline-primary"
        onPress={() => router.push(path.offers)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  hint: { color: Colors.textSecondary, marginBottom: Spacing.md },
  status: { fontWeight: '800', letterSpacing: 0.4, marginBottom: Spacing.sm },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  box: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
  },
});

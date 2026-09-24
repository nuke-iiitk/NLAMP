import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import AlertBanner from '../components/AlertBanner';
import DemoBadge from '../components/DemoBadge';
import EmptyState from '../components/EmptyState';
import InfoCard from '../components/InfoCard';
import ProgressTrack from '../components/ProgressTrack';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatusBadge from '../components/StatusBadge';
import TokenDisplay from '../components/TokenDisplay';
import TokenPdfButton from '../components/TokenPdfButton';
import { Colors, Radius, Spacing } from '../constants/theme';
import { formatDateLong, slotRange } from '../data/mockData';
import { qrCells } from '../data/procurementPass';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { useStore } from '../store/AppStore';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

/** Seconds elapsed since the given epoch-millis timestamp. */
function secondsSince(ts: number): number {
  return Math.max(0, Math.round((Date.now() - ts) / 1000));
}

/**
 * "Updated Ns ago" line — runs its own 10-second timer so the refresh label
 * stays current without re-rendering the whole queue screen every second.
 */
function UpdatedAgo({ since }: { since: number }) {
  const { t, fs } = useI18n();
  const [seconds, setSeconds] = useState(() => secondsSince(since));
  useEffect(() => {
    const update = () => setSeconds(secondsSince(since));
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, [since]);
  return (
    <Text style={[styles.updatedText, { fontSize: fs(11) }]} accessibilityLiveRegion="polite">
      <AppIcon name={APP_ICONS.pulse} size={11} color={Colors.green} /> {t('queue.updated', { n: seconds })}
    </Text>
  );
}

export default function QueueScreen() {
  const { t, fs } = useI18n();
  const { farmer, activeBookingFor, queues, queueSnapshot, centres, pass, setPassStatus, setReadiness } = useStore();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  const booking = farmer ? activeBookingFor(farmer.id) : undefined;
  const snapshot = booking ? queueSnapshot(booking.centreId, booking.token) : undefined;
  const queue = booking ? queues[booking.centreId] : undefined;

  if (!booking || !snapshot || !queue) {
    return (
      <ScreenShell breadcrumbs={[{ label: t('nav.queue') }]}>
        <SectionHeading title={t('queue.title')} />
        <EmptyState
          icon={APP_ICONS.ticket}
          title={t('queue.noActive')}
          message={t('queue.noActiveBody')}
          action={
            <Button label={t('dash.bookNow')} onPress={() => router.push(path.booking as never)} />
          }
        />
      </ScreenShell>
    );
  }

  const done = booking.status === 'Completed';
  const passCells = qrCells(pass?.token ?? booking.token);
  const readinessItems = [
    ['produce', t('pass.produce')],
    ['documents', t('pass.documents')],
    ['token', t('pass.token')],
    ['travel', t('pass.travel')],
  ] as const;
  const yourTurn = snapshot.farmersAhead === 0 && snapshot.processing?.token === booking.token;
  const totalProgress = snapshot.completedCount + snapshot.farmersAhead + (snapshot.processing ? 1 : 0);
  const progress = totalProgress > 0 ? snapshot.completedCount / totalProgress : 0;

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.queue') }]}>
      <SectionHeading
        title={t('queue.title')}
        subtitle={`${booking.centreName} · ${formatDateLong(booking.date)} · ${slotRange(booking.slotStart, booking.slotEnd)}`}
        right={<DemoBadge />}
      />

      <TokenDisplay
        token={booking.token}
        label={t('queue.yourToken')}
        subtitle={done ? t('queue.done') : yourTurn ? t('queue.yourTurn') : t('queue.notice')}
      />

      <TokenPdfButton booking={booking} farmer={farmer} centre={centres.find((c) => c.id === booking.centreId)} />

      {pass ? (
        <InfoCard title={t('pass.title')} accent={Colors.saffron}>
          <Text style={[styles.passDemo, { fontSize: fs(11) }]}>{t('pass.demo')}</Text>
          <Text style={[styles.passToken, { fontSize: fs(24) }]}>{pass.token}</Text>
          <Text style={[styles.passAddress, { fontSize: fs(12) }]}>{pass.centreName} · {pass.centreAddress}</Text>
          <View style={styles.qrRow}>
            <View style={styles.qr} accessibilityLabel={`QR visual for ${pass.token}`}>
              {passCells.map((filled, index) => <View key={index} style={[styles.qrCell, filled && styles.qrFilled]} />)}
            </View>
            <View style={styles.passDetails}>
              <Text style={styles.passMeta}>{t('pass.arrival')}: {pass.arrivalStart}–{pass.arrivalEnd}</Text>
              <Text style={styles.passMeta}>{t('pass.leave')}: {pass.leaveAt}</Text>
              <Text style={styles.passMeta}>{t('pass.position')}: {snapshot.farmersAhead} · {t('pass.wait')}: ~{snapshot.estimatedWaitMinutes + pass.operations.delayMinutes} min</Text>
              <Text style={styles.passMeta}>{t('pass.capacity')}: {Math.max(0, pass.capacityRemaining - pass.operations.capacityReduction)}</Text>
              <Text style={styles.nextAction}>{t('pass.next')}: {pass.nextAction}</Text>
            </View>
          </View>
          {pass.operations.closed ? <AlertBanner tone="warning" title={t('pass.closed')} message={pass.nextAction} /> : null}
          <Text style={[styles.passTitle, { fontSize: fs(16) }]}>{t('pass.journey')}</Text>
          {readinessItems.map(([key, label], index) => {
            const current = key === 'produce' ? 0 : key === 'documents' ? 1 : key === 'token' ? 2 : 3;
            const doneStep = pass.status === 'Completed' ? 4 : pass.status === 'Checked In' ? 3 : pass.status === 'On the Way' ? 2 : 1;
            return <View key={key} style={styles.checkRow}><Text style={styles.check}>{current + 1 <= doneStep ? '✓' : '○'} {label}</Text>{key !== 'token' ? <Button small variant="ghost" label={pass.readiness[key] ? '✓' : 'Mark'} onPress={() => setReadiness(key, !pass.readiness[key])} /> : null}</View>;
          })}
          <View style={styles.actions}><Button small label={t('pass.ready')} onPress={() => setPassStatus('Confirmed')} /><Button small variant="outline-primary" label={t('pass.onway')} onPress={() => setPassStatus('On the Way')} /><Button small variant="outline-secondary" label={t('pass.late')} onPress={() => setPassStatus('Delayed')} /></View>
          <Text style={[styles.passTitle, { fontSize: fs(16) }]}>{t('pass.history')}</Text>
          {pass.updates.slice(-5).reverse().map((update) => <Text key={update.id} style={styles.update}>{new Date(update.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {update.message}</Text>)}
        </InfoCard>
      ) : null}

      {/* Serving & wait */}
      <View style={[styles.statsRow, !wide && styles.statsColumn]}>
        <InfoCard title={t('queue.currentServing')}>
          <Text style={[styles.currentToken, { fontSize: fs(34) }]}>
            {snapshot.currentlyServing ?? '—'}
          </Text>
          {snapshot.processing ? (
            <Text style={[styles.servingName, { fontSize: fs(13) }]}>
              {snapshot.processing.farmerName} · {snapshot.processing.produce}
            </Text>
          ) : null}
        </InfoCard>

        <InfoCard title={t('queue.ahead')}>
          <Text style={[styles.currentToken, { fontSize: fs(34) }]}>
            {done ? 0 : snapshot.farmersAhead}
          </Text>
          <Text style={[styles.servingName, { fontSize: fs(13) }]}>
            {done ? t('queue.done') : t('queue.aheadValue', { n: snapshot.farmersAhead })}
          </Text>
        </InfoCard>

        <InfoCard title={t('queue.estWait')}>
          <Text style={[styles.currentToken, { fontSize: fs(34) }]}>
            {done ? '—' : `~${snapshot.estimatedWaitMinutes}`}
          </Text>
          <Text style={[styles.servingName, { fontSize: fs(13) }]}>{t('common.minutes')}</Text>
        </InfoCard>
      </View>

      {done ? (
        <AlertBanner tone="success" title={t('status.stage5')} message={t('queue.done')} />
      ) : yourTurn ? (
        <AlertBanner
          tone="success"
          title={t('status.Your Turn')}
          message={t('queue.yourTurn')}
          icon={APP_ICONS.megaphone}
        />
      ) : (
        <AlertBanner tone="neutral" message={t('queue.notice')} />
      )}

      {/* Progress */}
      <View style={styles.progressCard}>
        <Text style={[styles.progressLabel, { fontSize: fs(13) }]}>{t('dash.queueProgress')}</Text>
        <ProgressTrack progress={progress} />
        <UpdatedAgo since={booking.createdAt} />
      </View>

{/* Upcoming tokens */}
      <View style={styles.statsRow2}>
        <InfoCard title={t('queue.recent')} padded={false}>
          <View style={styles.tokenList}>
            {queue.entries
              .filter((e) => e.status === 'Completed')
              .slice(-6)
              .map((e) => (
                <View key={e.token} style={styles.tokenRow}>
                  <Text style={[styles.tokenRowText, { fontSize: fs(13) }]}>{e.token}</Text>
                  <StatusBadge status={e.status} small />
                </View>
              ))}
          </View>
        </InfoCard>

        <InfoCard title={t('queue.upcoming')} padded={false}>
          <View style={styles.tokenList}>
            {queue.entries
              .filter((e) => e.status !== 'Completed')
              .slice(0, 8)
              .map((e) => {
                const isYou = e.token === booking.token;
                return (
                  <View key={e.token} style={[styles.tokenRow, isYou && styles.youRow]}>
                    <Text style={[styles.tokenRowText, { fontSize: fs(13) }, isYou && styles.youText]}>
                      {e.token}
                      {isYou ? ` · ${t('queue.you')}` : ''}
                    </Text>
                    <StatusBadge status={e.status} small />
                  </View>
                );
              })}
          </View>
        </InfoCard>
      </View>

      <Button label={t('dash.viewQueue')} onPress={() => router.back()} small />
      <View style={styles.spacer} />
      <Button label={t('book.backDash')} onPress={() => router.push(path.dashboard as never)} small />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statsColumn: {
    flexDirection: 'column',
  },
  statsRow2: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  currentToken: {
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  servingName: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  progressLabel: {
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  updatedText: {
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  tokenList: {
    padding: 0,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tokenRowText: {
    color: Colors.text,
    fontWeight: '700',
  },
  youRow: {
    backgroundColor: Colors.greenLight,
  },
  youText: {
    color: Colors.greenDark,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  passDemo: { color: Colors.textMuted, marginBottom: Spacing.sm },
  passToken: { color: Colors.primary, fontWeight: '800', marginBottom: 2 },
  passAddress: { color: Colors.textSecondary, marginBottom: Spacing.md },
  qrRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  qr: { width: 92, height: 92, flexDirection: 'row', flexWrap: 'wrap', borderWidth: 2, borderColor: Colors.primary, padding: 3 },
  qrCell: { width: 6, height: 6, backgroundColor: Colors.white },
  qrFilled: { backgroundColor: Colors.primary },
  passDetails: { flex: 1 },
  passMeta: { color: Colors.text, fontSize: 12, marginBottom: 3 },
  nextAction: { color: Colors.primaryDark, fontSize: 12, fontWeight: '700', marginTop: 4 },
  passTitle: { color: Colors.primaryDark, fontWeight: '800', marginTop: Spacing.md, marginBottom: Spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  check: { color: Colors.text, fontSize: 13, flex: 1 },
  update: { color: Colors.textSecondary, fontSize: 11, marginBottom: 3 },

  spacer: {
    height: Spacing.sm,
  },
});
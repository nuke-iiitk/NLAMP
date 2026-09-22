import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import InfoCard, { MetaRow } from '../components/InfoCard';
import Link from '../components/Link';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatusBadge from '../components/StatusBadge';
import { Colors, Spacing } from '../constants/theme';
import { formatDateLong, slotRange, type Booking, type BookingStatus } from '../data/mockData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { canDownloadPdf, downloadTokenPdf } from '../services/pdfService';
import { useStore } from '../store/AppStore';
import { APP_ICONS } from '../components/AppIcon';

const FILTERS: ('All' | BookingStatus)[] = ['All', 'Upcoming', 'Waiting', 'Processing', 'Completed', 'Cancelled'];

export default function BookingsScreen() {
  const { t, fs } = useI18n();
  const { farmer, bookings, cancelBooking, centres } = useStore();
  const [filter, setFilter] = useState<'All' | BookingStatus>('All');

  const mine = useMemo(() => {
    if (!farmer) return [];
    const own = bookings.filter((b) => b.farmerId === farmer.id);
    return filter === 'All' ? own : own.filter((b) => b.status === filter);
  }, [bookings, farmer, filter]);

  function handleCancel(booking: Booking) {
    Alert.alert(t('bookings.cancelAsk'), t('bookings.cancelBody'), [
      { text: t('common.no'), style: 'cancel' },
      {
        text: t('bookings.cancel'),
        style: 'destructive',
        onPress: () => cancelBooking(booking.id),
      },
    ]);
  }

  function handleTokenPdf(booking: Booking) {
    if (!canDownloadPdf()) {
      Alert.alert(t('token.pdfBtn'), t('token.unavailable'));
      return;
    }
    downloadTokenPdf({
      booking,
      farmer,
      centre: centres.find((c) => c.id === booking.centreId),
    }).then((result) => {
      if (result.ok) {
        Alert.alert(t('book.confirmed'), t('token.downloaded'));
      } else {
        Alert.alert(t('token.pdfBtn'), t('token.downloadError'));
      }
    });
  }

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.bookings') }]} wide>
      <SectionHeading title={t('bookings.title')} subtitle={t('bookings.subtitle')} />

      {/* Status filter */}
      <View style={styles.filterRow}>
        {FILTERS.map((status) => {
          const active = filter === status;
          return (
            <Button
              key={status}
              label={status === 'All' ? t('bookings.filterAll') : t(`status.${status}` as never)}
              onPress={() => setFilter(status)}
              variant={active ? 'primary' : 'outline-secondary'}
              small
            />
          );
        })}
      </View>

{mine.length === 0 ? (
        <EmptyState
          icon={APP_ICONS.list}
          title={t('bookings.empty')}
          message={t('bookings.emptyBody')}
          action={
                        <Button variant="outline-primary" label={t('dash.bookNow')} onPress={() => router.push(path.booking as never)} />
          }
        />
      ) : (
        <DataTable<Booking>
          columns={[
            {
              key: 'date',
              header: t('bookings.date'),
              render: (b) => (
                <Text style={[styles.cellMain, { fontSize: fs(13) }]}>{formatDateLong(b.date)}</Text>
              ),
            },
            {
              key: 'centre',
              header: t('bookings.centre'),
              render: (b) => (
                <Text style={[styles.cellMain, { fontSize: fs(13) }]} numberOfLines={2}>
                  {b.centreName}
                </Text>
              ),
            },
            {
              key: 'token',
              header: t('bookings.token'),
              render: (b) => <Text style={[styles.cellToken, { fontSize: fs(13) }]}>{b.token}</Text>,
            },
            {
              key: 'produce',
              header: t('bookings.produce'),
              render: (b) => (
                <Text style={[styles.cellMain, { fontSize: fs(13) }]}>
                  {b.produce} · {b.quantityKg} kg
                </Text>
              ),
            },
            {
              key: 'slot',
              header: t('dash.time'),
              render: (b) => (
                <Text style={[styles.cellMain, { fontSize: fs(12) }]}>
                  {slotRange(b.slotStart, b.slotEnd)}
                </Text>
              ),
            },
            {
              key: 'status',
              header: t('bookings.status'),
              render: (b) => <StatusBadge status={b.status} small />,
            },
            {
              key: 'actions',
              header: t('bookings.actions'),
              render: (b) => (
                <View style={styles.actionsRow}>
                  {b.status === 'Upcoming' || b.status === 'Waiting' ? (
                    <Button variant="link" label={t('bookings.cancel')} onPress={() => handleCancel(b)} small />
                  ) : null}
                  <Link href={b.status === 'Completed' ? path.bookings : path.queue} label={t('bookings.view')} variant="muted" />
                </View>
              ),
            },
            {
              key: 'pdf',
              header: t('token.pdfShort'),
              render: (b) => (
                <Button variant="link" label={t('token.pdfShort')} onPress={() => handleTokenPdf(b)} small />
              ),
            },
          ]}
          rows={mine}
          rowKey={(b) => b.id}
          emptyLabel={t('bookings.empty')}
        />
      )}

      {mine.length > 0 ? (
        <View style={styles.detail}>
          <SectionHeading title={t('bookings.subtitle')} />
          <InfoCard title={mine[0].token}>
            <StatusBadge status={mine[0].status} />
            <View style={styles.spacer} />
            <MetaRow label={t('dash.centre')} value={mine[0].centreName} />
            <MetaRow label={t('dash.date')} value={formatDateLong(mine[0].date)} />
            <MetaRow label={t('dash.time')} value={slotRange(mine[0].slotStart, mine[0].slotEnd)} />
            <MetaRow label={t('dash.token')} value={mine[0].token} />
            <MetaRow label={t('dash.produce')} value={`${mine[0].produce} · ${mine[0].quantityKg} kg`} />
          </InfoCard>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  filterText: {
    color: Colors.text,
    fontWeight: '700',
  },
  filterTextActive: {
    color: Colors.white,
  },
  cellMain: {
    color: Colors.text,
    fontWeight: '600',
  },
  cellToken: {
    color: Colors.primary,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelLink: {
    color: Colors.danger,
    fontWeight: '700',
  },
  viewLink: {
    color: Colors.info,
    fontWeight: '700',
  },
  pdfLink: {
    color: Colors.danger,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  detail: {
    marginTop: Spacing.lg,
  },
  spacer: {
    height: Spacing.md,
  },
});
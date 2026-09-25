import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import InfoCard, { MetaRow } from '../components/InfoCard';
import Link from '../components/Link';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatusBadge from '../components/StatusBadge';
import { Colors, Spacing } from '../constants/theme';
import { ALL_PROJECTS, type LandProject } from '../data/landAcquisitionData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS } from '../components/AppIcon';

const FILTERS = ['All', 'Active', 'Delayed', 'Completed', 'Pending Approval'] as const;

/**
 * My Projects / Submitted Proposals — reuses the old "My Bookings" layout,
 * now tracking land acquisition proposals submitted by this nodal office.
 */
export default function BookingsScreen() {
  const { t, fs } = useI18n();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const mine: LandProject[] = useMemo(() => {
    const own = ALL_PROJECTS.slice(0, 3);
    return filter === 'All' ? own : own.filter((b) => b.status === filter);
  }, [filter]);

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.bookings') }]} wide>
      <SectionHeading title="My Submitted Land Proposals" subtitle="Proposals filed by this nodal office across the 9-stage RFCTLARR lifecycle." />

      <View style={styles.filterRow}>
        {FILTERS.map((status) => {
          const active = filter === status;
          return <Button key={status} label={status === 'All' ? 'All Proposals' : status} onPress={() => setFilter(status)} variant={active ? 'primary' : 'outline-secondary'} small />;
        })}
      </View>

      {mine.length === 0 ? (
        <EmptyState icon={APP_ICONS.list} title="No proposals found" message="No proposals match this status filter." action={<Button variant="outline-primary" label={t('dash.bookNow')} onPress={() => router.push(path.booking as never)} />} />
      ) : (
        <DataTable<LandProject>
          columns={[
            { key: 'code', header: 'Project Code', render: (b) => <Text style={[styles.cellToken, { fontSize: fs(13) }]}>{b.code}</Text> },
            { key: 'name', header: 'Project Corridor', render: (b) => <Text style={[styles.cellMain, { fontSize: fs(13) }]} numberOfLines={2}>{b.name}</Text> },
            { key: 'land', header: 'Land Proposed', render: (b) => <Text style={[styles.cellMain, { fontSize: fs(13) }]}>{b.landProposedHa} ha</Text> },
            { key: 'stage', header: 'Current Stage', render: (b) => <Text style={[styles.cellMain, { fontSize: fs(12) }]}>{b.currentStage}</Text> },
            { key: 'status', header: 'Status', render: (b) => <StatusBadge status={b.status === 'Delayed' ? 'Cancelled' : b.status === 'Completed' ? 'Completed' : 'Upcoming'} translatedLabel={b.status} small /> },
            { key: 'actions', header: 'Actions', render: (b) => <View style={styles.actionsRow}><Link href={path.projects} label="Open" variant="muted" /></View> },
          ]}
          rows={mine}
          rowKey={(b) => b.id}
          emptyLabel="No proposals"
        />
      )}

      {mine.length > 0 ? (
        <View style={styles.detail}>
          <SectionHeading title="Lead Proposal Detail" />
          <InfoCard title={mine[0].code}>
            <StatusBadge status="Upcoming" translatedLabel={mine[0].status} />
            <View style={styles.spacer} />
            <MetaRow label={t('dash.centre')} value={mine[0].agency} />
            <MetaRow label={t('dash.date')} value={mine[0].targetDate} />
            <MetaRow label={t('dash.time')} value={mine[0].currentStage} />
            <MetaRow label={t('dash.token')} value={mine[0].code} />
            <MetaRow label={t('dash.produce')} value={`${mine[0].landProposedHa} ha proposed`} />
          </InfoCard>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  cellMain: { color: Colors.text, fontWeight: '600' },
  cellToken: { color: Colors.primary, fontWeight: '800' },
  actionsRow: { flexDirection: 'row' },
  detail: { marginTop: Spacing.lg },
  spacer: { height: Spacing.sm },
});

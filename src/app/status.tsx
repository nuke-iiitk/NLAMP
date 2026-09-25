import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import DataTable from '../components/DataTable';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { Colors, Radius, Spacing } from '../constants/theme';
import { ALL_PROJECTS, MOCK_PARCELS, type LandProject } from '../data/landAcquisitionData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

export default function PossessionTrackerScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  const [query, setQuery] = useState('');

  const totalLandProposed = ALL_PROJECTS.reduce((a, p) => a + p.landProposedHa, 0);
  const totalLandAcquired = ALL_PROJECTS.reduce((a, p) => a + p.landAcquiredHa, 0);
  const nationalPossessionPercent = Math.round((totalLandAcquired / totalLandProposed) * 100);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_PROJECTS.filter((p) => {
      if (q) {
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query]);

  const columns = [
    {
      key: 'proj',
      header: 'Project Corridor',
      render: (p: LandProject) => (
        <View>
          <Text style={[styles.projName, { fontSize: fs(13) }]}>{p.name}</Text>
          <Text style={[styles.subText, { fontSize: fs(11) }]}>{p.code} · {p.agency}</Text>
        </View>
      ),
    },
    {
      key: 'loc',
      header: 'Location',
      width: 140,
      render: (p: LandProject) => (
        <Text style={[styles.cellText, { fontSize: fs(12) }]}>{p.district}, {p.state}</Text>
      ),
    },
    {
      key: 'proposed',
      header: 'Proposed',
      width: 95,
      render: (p: LandProject) => (
        <Text style={[styles.cellBold, { fontSize: fs(12) }]}>{p.landProposedHa} ha</Text>
      ),
    },
    {
      key: 'acquired',
      header: 'Possession Taken',
      width: 120,
      render: (p: LandProject) => (
        <Text style={[styles.cellBold, { color: Colors.green, fontSize: fs(12) }]}>
          {p.landAcquiredHa} ha ({p.possessionPercent}%)
        </Text>
      ),
    },
    {
      key: 'pending',
      header: 'Pending Area',
      width: 105,
      render: (p: LandProject) => (
        <Text style={[styles.cellBold, { color: Colors.saffronDark, fontSize: fs(12) }]}>
          {(p.landProposedHa - p.landAcquiredHa).toFixed(1)} ha
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Possession Status',
      width: 120,
      render: (p: LandProject) => (
        <StatusBadge
          status={p.possessionPercent === 100 ? 'Completed' : p.possessionPercent > 60 ? 'Processing' : 'Waiting'}
          translatedLabel={p.possessionPercent === 100 ? 'Full Possession' : `${p.possessionPercent}% Taken`}
          small
        />
      ),
    },
  ];

  return (
    <ScreenShell wide breadcrumbs={[{ label: 'Home', href: path.home }, { label: 'Possession Tracker' }]}>
      <SectionHeading
        title="Physical Possession & Handover Tracking"
        subtitle="Verification under Sections 38 & 40 of RFCTLARR Act 2013: Taking physical encumbrance-free possession of land upon compensation disbursement."
      />

      <View style={styles.kpiRow}>
        <StatCard label="Total Land Requisitioned" value={`${Math.round(totalLandProposed)} ha`} tone="navy" />
        <StatCard label="Physical Possession Taken" value={`${Math.round(totalLandAcquired)} ha`} tone="green" />
        <StatCard label="National Possession Rate" value={`${nationalPossessionPercent}%`} tone="saffron" />
        <StatCard label="Corridors Completed" value={ALL_PROJECTS.filter((p) => p.possessionPercent === 100).length} tone="green" />
      </View>

      <View style={styles.filterCard}>
        <View style={styles.searchRow}>
          <AppIcon name={APP_ICONS.search} size={16} color={Colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { fontSize: fs(13) }]}
            placeholder="Search possession status by project corridor name, state or district..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.id}
        emptyLabel="No possession records match the search."
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  filterCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    color: Colors.text,
  },
  projName: {
    color: Colors.primary,
    fontWeight: '700',
  },
  subText: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  cellText: {
    color: Colors.text,
  },
  cellBold: {
    fontWeight: '800',
    color: Colors.text,
  },
});

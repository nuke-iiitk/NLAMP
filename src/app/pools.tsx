import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import DataTable from '../components/DataTable';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { Colors, Radius, Spacing } from '../constants/theme';
import { MOCK_COMPENSATION, type CompensationRecord } from '../data/landAcquisitionData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

export default function AwardsScreen() {
  const { t, fs } = useI18n();
  const [query, setQuery] = useState('');

  const totalAwardsDeclared = 18;
  const totalValueLakhs = 475.9;
  const solatiumValueLakhs = 237.95;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_COMPENSATION.filter((c) => {
      if (q) {
        return (
          c.awardNo.toLowerCase().includes(q) ||
          c.beneficiaryName.toLowerCase().includes(q) ||
          c.projectName.toLowerCase().includes(q) ||
          c.surveyNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query]);

  const columns = [
    {
      key: 'award',
      header: 'Award Number',
      width: 170,
      render: (c: CompensationRecord) => (
        <View>
          <Text style={[styles.awardText, { fontSize: fs(12) }]}>{c.awardNo}</Text>
          <Text style={[styles.subText, { fontSize: fs(10) }]}>RFCTLARR Sec 23, 26-30</Text>
        </View>
      ),
    },
    {
      key: 'project',
      header: 'Project & District',
      render: (c: CompensationRecord) => (
        <View>
          <Text style={[styles.projTitle, { fontSize: fs(12) }]}>{c.projectName}</Text>
          <Text style={[styles.subText, { fontSize: fs(11) }]}>{c.village}, {c.district}, {c.state}</Text>
        </View>
      ),
    },
    {
      key: 'survey',
      header: 'Khasra / Survey',
      width: 110,
      render: (c: CompensationRecord) => (
        <Text style={[styles.cellBold, { fontSize: fs(12) }]}>{c.surveyNumber}</Text>
      ),
    },
    {
      key: 'beneficiary',
      header: 'Titleholder',
      render: (c: CompensationRecord) => (
        <Text style={[styles.cellText, { fontSize: fs(12) }]}>{c.beneficiaryName}</Text>
      ),
    },
    {
      key: 'market',
      header: 'Assessed Base',
      width: 100,
      render: (c: CompensationRecord) => (
        <Text style={[styles.cellText, { fontSize: fs(12) }]}>₹{c.assessedAmountLakhs} L</Text>
      ),
    },
    {
      key: 'solatium',
      header: '100% Solatium',
      width: 100,
      render: (c: CompensationRecord) => (
        <Text style={[styles.cellText, { fontSize: fs(12) }]}>₹{c.solatiumLakhs} L</Text>
      ),
    },
    {
      key: 'total',
      header: 'Total Award',
      width: 105,
      render: (c: CompensationRecord) => (
        <Text style={[styles.cellBold, { color: Colors.primaryDark, fontSize: fs(12) }]}>
          ₹{c.totalApprovedLakhs} L
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Award Status',
      width: 110,
      render: (c: CompensationRecord) => (
        <StatusBadge status="Completed" translatedLabel="Declared" small />
      ),
    },
  ];

  return (
    <ScreenShell wide breadcrumbs={[{ label: 'Home', href: path.home }, { label: 'Statutory Awards' }]}>
      <SectionHeading
        title="Land Acquisition Awards (Sections 23, 26–30 RFCTLARR Act 2013)"
        subtitle="Final determination of land value, market rate multiplier, solatium (100%), interest and assets attached to land."
      />

      <View style={styles.kpiRow}>
        <StatCard label="Total Awards Declared" value={totalAwardsDeclared} tone="navy" />
        <StatCard label="Total Sanctioned Value" value={`₹${totalValueLakhs} L`} tone="green" />
        <StatCard label="100% Solatium Sanctioned" value={`₹${solatiumValueLakhs} L`} tone="saffron" />
      </View>

      <View style={styles.filterCard}>
        <View style={styles.searchRow}>
          <AppIcon name={APP_ICONS.search} size={16} color={Colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { fontSize: fs(13) }]}
            placeholder="Search award declaration by number, titleholder, project or survey number..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(c) => c.id}
        emptyLabel="No award declarations match the query."
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
  awardText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  projTitle: {
    fontWeight: '700',
    color: Colors.text,
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

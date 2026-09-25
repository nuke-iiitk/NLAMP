import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import BarChart from '../components/BarChart';
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

export default function CompensationDashboardScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // KPI Calculations
  const assessedTotal = 237.95; // In Lakhs
  const approvedTotal = 475.9; // Includes 100% solatium
  const disbursedTotal = 334.9;
  const pendingTotal = 141.0;
  const beneficiariesCount = 1420;

  // Chart datasets
  const stateWiseCompensation = [
    { label: 'Kerala', value: 84 },
    { label: 'Maha', value: 142 },
    { label: 'Raj', value: 94 },
    { label: 'Telang', value: 126 },
    { label: 'Punjab', value: 110 },
  ];

  const monthlyDisbursement = [
    { label: 'Oct', value: 24 },
    { label: 'Nov', value: 38 },
    { label: 'Dec', value: 45 },
    { label: 'Jan', value: 68 },
    { label: 'Feb', value: 89 },
    { label: 'Mar', value: 112 },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_COMPENSATION.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (q) {
        const mName = c.beneficiaryName.toLowerCase().includes(q);
        const mAward = c.awardNo.toLowerCase().includes(q);
        const mProj = c.projectName.toLowerCase().includes(q);
        const mSurvey = c.surveyNumber.toLowerCase().includes(q);
        if (!mName && !mAward && !mProj && !mSurvey) return false;
      }
      return true;
    });
  }, [query, statusFilter]);

  const columns = [
    {
      key: 'award',
      header: 'Award No.',
      width: 150,
      render: (c: CompensationRecord) => (
        <View>
          <Text style={[styles.awardNo, { fontSize: fs(12) }]}>{c.awardNo}</Text>
          <Text style={[styles.subText, { fontSize: fs(10) }]}>{c.projectName}</Text>
        </View>
      ),
    },
    {
      key: 'beneficiary',
      header: 'Beneficiary & Survey No',
      render: (c: CompensationRecord) => (
        <View>
          <Text style={[styles.beneficiaryName, { fontSize: fs(13) }]}>{c.beneficiaryName}</Text>
          <Text style={[styles.subText, { fontSize: fs(11) }]}>
            Survey: {c.surveyNumber} · Aadhaar: {c.aadhaarMasked}
          </Text>
        </View>
      ),
    },
    {
      key: 'assessed',
      header: 'Base Value',
      width: 95,
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
      key: 'approved',
      header: 'Total Approved',
      width: 105,
      render: (c: CompensationRecord) => (
        <Text style={[styles.cellBold, { fontSize: fs(12) }]}>₹{c.totalApprovedLakhs} L</Text>
      ),
    },
    {
      key: 'disbursed',
      header: 'DBT Disbursed',
      width: 105,
      render: (c: CompensationRecord) => (
        <Text style={[styles.cellBold, { color: Colors.green, fontSize: fs(12) }]}>
          ₹{c.disbursedAmountLakhs} L
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'DBT Status',
      width: 110,
      render: (c: CompensationRecord) => (
        <StatusBadge
          status={c.status === 'Disbursed' ? 'Completed' : c.status === 'Approved' ? 'Processing' : 'Waiting'}
          translatedLabel={c.status}
          small
        />
      ),
    },
  ];

  return (
    <ScreenShell wide breadcrumbs={[{ label: 'Home', href: path.home }, { label: 'Compensation Dashboard' }]}>
      <SectionHeading
        title="Direct Benefit Compensation & Solatium Auditing"
        subtitle="Schedule I & II RFCTLARR 2013: Market multiplier valuation, 100% solatium, 12% additional interest and PFMS/DBT transfer."
      />

      {/* KPI Cards: Assessed | Approved | Disbursed | Pending | Beneficiaries */}
      <View style={styles.kpiRow}>
        <StatCard label="Compensation Assessed" value={`₹${assessedTotal} L`} tone="navy" sub="Base Market Value" />
        <StatCard label="Compensation Approved" value={`₹${approvedTotal} L`} tone="saffron" sub="With 100% Solatium" />
        <StatCard label="Compensation Disbursed" value={`₹${disbursedTotal} L`} tone="green" sub="DBT Bank Credits" />
        <StatCard label="Compensation Pending" value={`₹${pendingTotal} L`} tone="red" sub="Treasury Underway" />
        <StatCard label="Total Beneficiaries" value={beneficiariesCount} tone="grey" sub="Registered Titleholders" />
      </View>

      {/* Charts Grid */}
      <View style={[styles.chartsRow, wide && styles.chartsRowWide]}>
        <View style={styles.chartCol}>
          <BarChart
            title="State-wise Compensation Outlay (₹ Crores)"
            data={stateWiseCompensation}
            suffix=" Cr"
          />
        </View>
        <View style={styles.chartCol}>
          <BarChart
            title="Monthly DBT Disbursals (₹ Crores)"
            data={monthlyDisbursement}
            color={Colors.green}
            suffix=" Cr"
          />
        </View>
      </View>

      {/* Search & Status Filters */}
      <View style={styles.filterCard}>
        <View style={styles.searchRow}>
          <AppIcon name={APP_ICONS.search} size={16} color={Colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { fontSize: fs(13) }]}
            placeholder="Search by titleholder name, survey number, award reference or project..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.chipRow}>
          <Text style={[styles.filterLabel, { fontSize: fs(11) }]}>Status:</Text>
          {['All', 'Disbursed', 'Approved', 'Under Scrutiny'].map((st) => (
            <Pressable
              key={st}
              onPress={() => setStatusFilter(st)}
              style={[styles.chip, statusFilter === st && styles.chipActive]}
            >
              <Text style={[styles.chipText, statusFilter === st && styles.chipTextActive, { fontSize: fs(11) }]}>
                {st}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Compensation Records Table */}
      <SectionHeading title="Disbursement Audit Trail" />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(c) => c.id}
        emptyLabel="No compensation records match your query."
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
  chartsRow: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  chartsRowWide: {
    flexDirection: 'row',
  },
  chartCol: {
    flex: 1,
  },
  filterCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
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
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterLabel: {
    color: Colors.textMuted,
    fontWeight: '700',
    marginRight: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  chipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  chipText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.white,
  },
  awardNo: {
    color: Colors.primary,
    fontWeight: '700',
  },
  beneficiaryName: {
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

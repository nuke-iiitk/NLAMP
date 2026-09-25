import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import BarChart from '../components/BarChart';
import DataTable from '../components/DataTable';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SearchableSelect from '../components/SearchableSelect';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { Colors, Radius, Spacing } from '../constants/theme';
import { ALL_PROJECTS, type LandProject } from '../data/landAcquisitionData';
import { getStateOptions, getDistrictOptions } from '../data/indiaLocations';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

export default function ReportsAndAnalyticsScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  // Filters: State | District | Project | Date Range
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('FY 2025-26');

  const stateOptions = useMemo(() => getStateOptions(), []);
  const districtOptions = useMemo(
    () => (selectedState ? getDistrictOptions(selectedState) : []),
    [selectedState]
  );

  // Charts
  const nationalAcquisitionData = [
    { label: 'Q1', value: 340 },
    { label: 'Q2', value: 480 },
    { label: 'Q3', value: 620 },
    { label: 'Q4', value: 710 },
  ];

  const stateComparisonData = [
    { label: 'Kerala', value: 182 },
    { label: 'Maha', value: 360 },
    { label: 'Raj', value: 680 },
    { label: 'Telang', value: 235 },
    { label: 'Punjab', value: 290 },
  ];

  const delayReasonData = [
    { label: 'Litigation', value: 8 },
    { label: 'Forest Clr', value: 6 },
    { label: 'Survey Disp', value: 5 },
    { label: 'Valuation', value: 4 },
    { label: 'Utility Rel', value: 3 },
  ];

  const adherenceData = [
    { label: 'Sec 4 SIA', value: 92 },
    { label: 'Sec 11 Notif', value: 88 },
    { label: 'Sec 19 Decl', value: 81 },
    { label: 'Sec 23 Award', value: 74 },
    { label: 'Possession', value: 68 },
  ];

  // Reports Table
  const reportRows = [
    { id: 'RPT-01', name: 'National Land Acquisition Annual Report', category: 'Executive Summary', frequency: 'Annual', date: '31 Jan 2026', status: 'Published' },
    { id: 'RPT-02', name: 'State-wise & District Corridor Land Performance', category: 'State Report', frequency: 'Monthly', date: '15 Feb 2026', status: 'Published' },
    { id: 'RPT-03', name: 'Compensation Disbursal & Solatium Audit Register', category: 'Financial Audit', frequency: 'Fortnightly', date: '20 Feb 2026', status: 'Published' },
    { id: 'RPT-04', name: 'Possession & Physical Corridor Handover Register', category: 'Possession', frequency: 'Weekly', date: '24 Feb 2026', status: 'Published' },
    { id: 'RPT-05', name: 'R&R Family Rehabilitation & Resettlement Tracker', category: 'R&R Compliance', frequency: 'Monthly', date: '10 Feb 2026', status: 'Published' },
    { id: 'RPT-06', name: 'Statutory Delay Analysis & Section 25 Lapses Risk', category: 'Risk Matrix', frequency: 'Daily Real-Time', date: 'Today', status: 'Active' },
  ];

  const columns = [
    {
      key: 'name',
      header: 'Report Title',
      render: (r: typeof reportRows[0]) => (
        <View>
          <Text style={[styles.reportName, { fontSize: fs(13) }]}>{r.name}</Text>
          <Text style={[styles.reportId, { fontSize: fs(11) }]}>{r.id} · {r.frequency}</Text>
        </View>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      width: 140,
      render: (r: typeof reportRows[0]) => (
        <Text style={[styles.cellText, { fontSize: fs(12) }]}>{r.category}</Text>
      ),
    },
    {
      key: 'date',
      header: 'Date Generated',
      width: 120,
      render: (r: typeof reportRows[0]) => (
        <Text style={[styles.cellText, { fontSize: fs(11) }]}>{r.date}</Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 110,
      render: (r: typeof reportRows[0]) => (
        <StatusBadge status="Completed" translatedLabel={r.status} small />
      ),
    },
    {
      key: 'action',
      header: 'Export',
      width: 110,
      render: (r: typeof reportRows[0]) => (
        <Button variant="outline-primary" label="Download PDF" onPress={() => undefined} small />
      ),
    },
  ];

  return (
    <ScreenShell wide breadcrumbs={[{ label: 'Home', href: path.home }, { label: 'Reports & Analytics' }]}>
      <SectionHeading
        title="National Reports, Analytics & Delay Analysis"
        subtitle="Decision support metrics: Timeline adherence, delay bottlenecks, corridor acquisition progress and treasury disbursements."
      />

      {/* Filter Bar: State | District | Project | Date Range */}
      <View style={styles.filterCard}>
        <Text style={[styles.filterTitle, { fontSize: fs(13) }]}>Analytics & Reporting Scope Filters</Text>
        <View style={[styles.selectRow, !wide && styles.selectRowStack]}>
          <View style={{ flex: 1 }}>
            <SearchableSelect
              label="Filter by State"
              value={selectedState}
              placeholder="All India"
              options={stateOptions}
              onSelect={(val) => {
                setSelectedState(val || null);
                setSelectedDistrict(null);
              }}
              onClear={() => {
                setSelectedState(null);
                setSelectedDistrict(null);
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SearchableSelect
              label="Filter by District"
              value={selectedDistrict}
              placeholder="All Districts"
              options={districtOptions}
              disabled={!selectedState}
              onSelect={(val) => setSelectedDistrict(val || null)}
              onClear={() => setSelectedDistrict(null)}
            />
          </View>
          <View style={styles.dateRangeCol}>
            <Text style={[styles.filterLabel, { fontSize: fs(11) }]}>Date Range:</Text>
            <View style={styles.rangeChips}>
              {['FY 2025-26', 'FY 2024-25', 'All Time'].map((dr) => (
                <Pressable
                  key={dr}
                  onPress={() => setDateRange(dr)}
                  style={[styles.rangeChip, dateRange === dr && styles.rangeChipActive]}
                >
                  <Text style={[styles.rangeChipText, dateRange === dr && styles.rangeChipTextActive, { fontSize: fs(11) }]}>
                    {dr}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Analytics Charts Grid */}
      <View style={[styles.chartsRow, wide && styles.chartsRowWide]}>
        <View style={styles.chartCol}>
          <BarChart
            title="Quarterly Land Acquisition (ha)"
            data={nationalAcquisitionData}
            suffix=" ha"
          />
        </View>
        <View style={styles.chartCol}>
          <BarChart
            title="State-wise Corridor Acquisition (ha)"
            data={stateComparisonData}
            color={Colors.saffronDark}
            suffix=" ha"
          />
        </View>
      </View>

      <View style={[styles.chartsRow, wide && styles.chartsRowWide]}>
        <View style={styles.chartCol}>
          <BarChart
            title="Delay Analysis (Number of Affected Projects by Cause)"
            data={delayReasonData}
            color={Colors.danger}
          />
        </View>
        <View style={styles.chartCol}>
          <BarChart
            title="Statutory Timeline Adherence Rate (%)"
            data={adherenceData}
            color={Colors.green}
            suffix="%"
          />
        </View>
      </View>

      {/* Reports Listing Table */}
      <SectionHeading title="Statutory Audit Reports Register" />
      <DataTable
        columns={columns}
        rows={reportRows}
        rowKey={(r) => r.id}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  filterCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  filterTitle: {
    color: Colors.primaryDark,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  selectRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  selectRowStack: {
    flexDirection: 'column',
    gap: 0,
  },
  dateRangeCol: {
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  filterLabel: {
    color: Colors.textMuted,
    fontWeight: '700',
    marginBottom: 6,
  },
  rangeChips: {
    flexDirection: 'row',
    gap: 6,
  },
  rangeChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  rangeChipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  rangeChipText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  rangeChipTextActive: {
    color: Colors.white,
  },
  chartsRow: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  chartsRowWide: {
    flexDirection: 'row',
  },
  chartCol: {
    flex: 1,
  },
  reportName: {
    color: Colors.primary,
    fontWeight: '700',
  },
  reportId: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  cellText: {
    color: Colors.text,
  },
});

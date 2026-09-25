import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import DataTable from '../components/DataTable';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { Colors, Radius, Spacing } from '../constants/theme';
import { MOCK_RR, type RRRecord } from '../data/landAcquisitionData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

export default function RRScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  const [categoryFilter, setCategoryFilter] = useState('All');

  // R&R Metrics
  const affectedFamilies = 4980;
  const displacedFamilies = 1175;
  const rehabCompleted = 780;
  const rehabPending = 395;
  const resettleCompleted = 710;
  const resettlePending = 465;

  const filtered = useMemo(() => {
    return MOCK_RR.filter((r) => {
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
      return true;
    });
  }, [categoryFilter]);

  const columns = [
    {
      key: 'family',
      header: 'Head of Family',
      render: (r: RRRecord) => (
        <View>
          <Text style={[styles.headName, { fontSize: fs(13) }]}>{r.familyHead}</Text>
          <Text style={[styles.subText, { fontSize: fs(11) }]}>
            {r.village}, {r.district} · {r.membersCount} Members ({r.category})
          </Text>
        </View>
      ),
    },
    {
      key: 'project',
      header: 'Project Corridor',
      render: (r: RRRecord) => (
        <Text style={[styles.projName, { fontSize: fs(12) }]}>{r.projectName}</Text>
      ),
    },
    {
      key: 'housing',
      header: 'House Allotment',
      width: 130,
      render: (r: RRRecord) => (
        <StatusBadge
          status={r.entitlementHouseAllotted ? 'Completed' : 'Waiting'}
          translatedLabel={r.entitlementHouseAllotted ? 'House Handed Over' : 'Pending Allocation'}
          small
        />
      ),
    },
    {
      key: 'grant',
      header: 'R&R Grant',
      width: 100,
      render: (r: RRRecord) => (
        <Text style={[styles.cellBold, { color: Colors.green, fontSize: fs(12) }]}>
          ₹{r.grantDisbursedLakhs} L
        </Text>
      ),
    },
    {
      key: 'employment',
      header: 'Livelihood Grant',
      width: 120,
      render: (r: RRRecord) => (
        <Text style={[styles.cellText, { fontSize: fs(11) }]}>{r.employmentStatus}</Text>
      ),
    },
    {
      key: 'rehab',
      header: 'Rehabilitation',
      width: 110,
      render: (r: RRRecord) => (
        <StatusBadge
          status={r.rehabilitationStatus === 'Completed' ? 'Completed' : 'Waiting'}
          translatedLabel={r.rehabilitationStatus}
          small
        />
      ),
    },
    {
      key: 'resettle',
      header: 'Resettlement',
      width: 110,
      render: (r: RRRecord) => (
        <StatusBadge
          status={r.resettlementStatus === 'Shifted' ? 'Completed' : 'Upcoming'}
          translatedLabel={r.resettlementStatus}
          small
        />
      ),
    },
  ];

  return (
    <ScreenShell wide breadcrumbs={[{ label: 'Home', href: path.home }, { label: 'Rehabilitation & Resettlement' }]}>
      <SectionHeading
        title="Rehabilitation & Resettlement (R&R) Monitoring"
        subtitle="Mandatory entitlements under Schedule II & III of RFCTLARR Act 2013: Constructed houses, subsistence grants, job quotas and infrastructural amenities."
      />

      {/* Mandatory KPIs */}
      <View style={styles.kpiRow}>
        <StatCard label="Affected Families" value={affectedFamilies.toLocaleString()} tone="navy" sub="SIA Survey Enumerated" />
        <StatCard label="Displaced Families" value={displacedFamilies.toLocaleString()} tone="saffron" sub="Eligible for Relocation" />
        <StatCard label="Rehabilitation Completed" value={rehabCompleted} tone="green" sub="Livelihood Disbursed" />
        <StatCard label="Rehabilitation Pending" value={rehabPending} tone="red" sub="Skill/Grant Underway" />
      </View>

      <View style={styles.kpiRow}>
        <StatCard label="Resettlement Completed" value={resettleCompleted} tone="green" sub="Colonies Occupied" />
        <StatCard label="Resettlement Pending" value={resettlePending} tone="red" sub="Plots/Houses Assigned" />
      </View>

      {/* R&R Progress Trackers */}
      <View style={styles.progressCard}>
        <Text style={[styles.cardTitle, { fontSize: fs(14) }]}>National R&R Execution Progress</Text>
        <View style={styles.progressBarWrap}>
          <View style={styles.progHeader}>
            <Text style={[styles.progLabel, { fontSize: fs(12) }]}>Overall Rehabilitation Progress: {Math.round((rehabCompleted / (rehabCompleted + rehabPending)) * 100)}%</Text>
            <Text style={[styles.progMeta, { fontSize: fs(12) }]}>{rehabCompleted} of {rehabCompleted + rehabPending} Families</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round((rehabCompleted / (rehabCompleted + rehabPending)) * 100)}%`, backgroundColor: Colors.green }]} />
          </View>
        </View>

        <View style={styles.progressBarWrap}>
          <View style={styles.progHeader}>
            <Text style={[styles.progLabel, { fontSize: fs(12) }]}>Overall Resettlement Colony Handover: {Math.round((resettleCompleted / (resettleCompleted + resettlePending)) * 100)}%</Text>
            <Text style={[styles.progMeta, { fontSize: fs(12) }]}>{resettleCompleted} of {resettleCompleted + resettlePending} Relocated</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round((resettleCompleted / (resettleCompleted + resettlePending)) * 100)}%`, backgroundColor: Colors.saffronDark }]} />
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { fontSize: fs(11) }]}>Filter Category:</Text>
        {['All', 'SC', 'ST', 'OBC', 'General'].map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setCategoryFilter(cat)}
            style={[styles.chip, categoryFilter === cat && styles.chipActive]}
          >
            <Text style={[styles.chipText, categoryFilter === cat && styles.chipTextActive, { fontSize: fs(11) }]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Beneficiary Table */}
      <SectionHeading title="Displaced & Affected Family Registry" />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        emptyLabel="No R&R records found."
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontWeight: '800',
    color: Colors.primaryDark,
    marginBottom: Spacing.sm,
  },
  progressBarWrap: {
    marginTop: Spacing.sm,
  },
  progHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progLabel: {
    fontWeight: '700',
    color: Colors.text,
  },
  progMeta: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  track: {
    height: 10,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  filterLabel: {
    color: Colors.textMuted,
    fontWeight: '700',
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
  headName: {
    fontWeight: '700',
    color: Colors.text,
  },
  subText: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  projName: {
    color: Colors.primary,
    fontWeight: '600',
  },
  cellBold: {
    fontWeight: '800',
  },
  cellText: {
    color: Colors.text,
  },
});

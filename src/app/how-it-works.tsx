import { router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import Button from '../components/Button';
import DataTable from '../components/DataTable';
import InfoCard from '../components/InfoCard';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { Colors, Radius, Spacing } from '../constants/theme';
import { WORKFLOW_STAGES, type WorkflowStageStats } from '../data/landAcquisitionData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

export default function AcquisitionWorkflowScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  const totalCases = WORKFLOW_STAGES.reduce((a, s) => a + s.totalCases, 0);
  const totalCompleted = WORKFLOW_STAGES.reduce((a, s) => a + s.completed, 0);
  const totalPending = WORKFLOW_STAGES.reduce((a, s) => a + s.pending, 0);
  const totalDelayed = WORKFLOW_STAGES.reduce((a, s) => a + s.delayed, 0);

  // Table columns for the 9 stages
  const columns = [
    {
      key: 'stage',
      header: 'Statutory Stage',
      render: (s: WorkflowStageStats) => (
        <View>
          <Text style={[styles.stageName, { fontSize: fs(13) }]}>{s.stage}: {s.label}</Text>
          <Text style={[styles.stageSec, { fontSize: fs(11) }]}>RFCTLARR 2013 Provision: {s.rfctlarrSec}</Text>
        </View>
      ),
    },
    {
      key: 'total',
      header: 'Total Cases',
      width: 100,
      render: (s: WorkflowStageStats) => (
        <Text style={[styles.cellBold, { fontSize: fs(13) }]}>{s.totalCases}</Text>
      ),
    },
    {
      key: 'completed',
      header: 'Completed',
      width: 100,
      render: (s: WorkflowStageStats) => (
        <Text style={[styles.cellBold, { color: Colors.green, fontSize: fs(13) }]}>{s.completed}</Text>
      ),
    },
    {
      key: 'pending',
      header: 'Pending',
      width: 90,
      render: (s: WorkflowStageStats) => (
        <Text style={[styles.cellBold, { color: Colors.saffronDark, fontSize: fs(13) }]}>{s.pending}</Text>
      ),
    },
    {
      key: 'delayed',
      header: 'Delayed',
      width: 90,
      render: (s: WorkflowStageStats) => (
        <Text style={[styles.cellBold, { color: Colors.danger, fontSize: fs(13) }]}>{s.delayed}</Text>
      ),
    },
    {
      key: 'status',
      header: 'Compliance',
      width: 110,
      render: (s: WorkflowStageStats) => (
        <StatusBadge
          status={s.delayed > 2 ? 'Cancelled' : s.pending > 6 ? 'Waiting' : 'Completed'}
          translatedLabel={s.delayed > 2 ? 'High Delay' : s.pending > 6 ? 'On Track' : 'Normal'}
          small
        />
      ),
    },
  ];

  return (
    <ScreenShell wide breadcrumbs={[{ label: 'Home', href: path.home }, { label: 'Acquisition Workflow' }]}>
      <SectionHeading
        title="RFCTLARR Act 2013 Statutory Acquisition Workflow"
        subtitle="End-to-End stage progression: Number of cases, completed, pending, and delayed bottlenecks."
      />

      {/* Aggregate KPI Strip */}
      <View style={styles.kpiRow}>
        <StatCard label="Total Corridor Cases" value={totalCases} tone="navy" />
        <StatCard label="Milestones Completed" value={totalCompleted} tone="green" />
        <StatCard label="In-Process / Pending" value={totalPending} tone="saffron" />
        <StatCard label="Delayed / Critical" value={totalDelayed} tone="red" />
      </View>

      {/* Visual 9-Stage Flow Diagram (Vertical Cascade using existing Card styling) */}
      <SectionHeading title="Statutory Nine-Stage Progression Chain" />
      <View style={styles.workflowChain}>
        {WORKFLOW_STAGES.map((ws, i) => (
          <View key={ws.stage} style={styles.workflowNodeWrap}>
            <View style={styles.workflowCard}>
              <View style={styles.nodeLeft}>
                <View style={styles.nodeNumberBadge}>
                  <Text style={styles.nodeNumberText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nodeStage, { fontSize: fs(14) }]}>
                    {ws.stage} — {ws.label}
                  </Text>
                  <Text style={[styles.nodeSec, { fontSize: fs(11) }]}>
                    Statutory Rule: {ws.rfctlarrSec}
                  </Text>
                </View>
              </View>

              <View style={styles.nodeStats}>
                <View style={styles.statPill}>
                  <Text style={[styles.pillNum, { color: Colors.primaryDark, fontSize: fs(13) }]}>{ws.totalCases}</Text>
                  <Text style={[styles.pillLbl, { fontSize: fs(10) }]}>Total</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={[styles.pillNum, { color: Colors.green, fontSize: fs(13) }]}>{ws.completed}</Text>
                  <Text style={[styles.pillLbl, { fontSize: fs(10) }]}>Done</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={[styles.pillNum, { color: Colors.saffronDark, fontSize: fs(13) }]}>{ws.pending}</Text>
                  <Text style={[styles.pillLbl, { fontSize: fs(10) }]}>Pending</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={[styles.pillNum, { color: Colors.danger, fontSize: fs(13) }]}>{ws.delayed}</Text>
                  <Text style={[styles.pillLbl, { fontSize: fs(10) }]}>Delayed</Text>
                </View>
              </View>
            </View>

            {i < WORKFLOW_STAGES.length - 1 ? (
              <View style={styles.arrowDown}>
                <AppIcon name={APP_ICONS.arrowForward} size={16} color={Colors.primary} />
              </View>
            ) : null}
          </View>
        ))}
      </View>

      {/* Stage Breakdown Table */}
      <View style={{ marginTop: Spacing.xl }}>
        <SectionHeading title="Statutory Stage Compliance Summary Table" />
        <DataTable
          columns={columns}
          rows={WORKFLOW_STAGES}
          rowKey={(s) => s.stage}
        />
      </View>

      <View style={styles.ctaRow}>
        <Button
          label="Submit Land Requirement Proposal"
          onPress={() => router.push(path.proposal as never)}
        />
        <Button
          variant="outline-primary"
          label="Inspect GIS Cadastre"
          onPress={() => router.push(path.gis as never)}
        />
      </View>
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
  workflowChain: {
    gap: 8,
    marginTop: Spacing.sm,
  },
  workflowNodeWrap: {
    alignItems: 'center',
  },
  workflowCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryDark,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  nodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
    minWidth: 260,
  },
  nodeNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeNumberText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  nodeStage: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  nodeSec: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  nodeStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  statPill: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
    minWidth: 54,
  },
  pillNum: {
    fontWeight: '800',
  },
  pillLbl: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  arrowDown: {
    paddingVertical: 4,
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
  },
  stageName: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  stageSec: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  cellBold: {
    fontWeight: '800',
    color: Colors.text,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    flexWrap: 'wrap',
  },
});

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import AlertBanner from '../components/AlertBanner';
import InfoCard, { MetaRow } from '../components/InfoCard';
import Button from '../components/Button';
import Link from '../components/Link';
import QuickActions from '../components/QuickActions';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import BarChart from '../components/BarChart';
import { Colors, Radius, Spacing } from '../constants/theme';
import {
  ALL_PROJECTS,
  MOCK_ALERTS,
  getNationalSummary,
  type LandProject,
  type UserRole,
} from '../data/landAcquisitionData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

const ROLES: UserRole[] = [
  'Central Ministry',
  'State Government',
  'District Authority',
  'Project Implementing Agency',
  'Policy Maker',
];

export default function DashboardScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const [activeRole, setActiveRole] = useState<UserRole>('Central Ministry');
  const [selectedState, setSelectedState] = useState<string>('Kerala');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('PRJ-2026-001');

  // National summary KPIs strictly based on the 8 mandatory KPIs
  const kpis = useMemo(() => {
    return getNationalSummary(activeRole, activeRole === 'State Government' ? selectedState : undefined);
  }, [activeRole, selectedState]);

  const activeProject = useMemo(() => {
    return ALL_PROJECTS.find((p) => p.id === selectedProjectId) ?? ALL_PROJECTS[0];
  }, [selectedProjectId]);

  // Chart datasets maintaining existing BarChart styling
  const acquisitionProgressMonthly = [
    { label: 'Oct', value: 82 },
    { label: 'Nov', value: 95 },
    { label: 'Dec', value: 114 },
    { label: 'Jan', value: 138 },
    { label: 'Feb', value: 165 },
    { label: 'Mar', value: 192 },
  ];

  const stateWiseAcquisition = [
    { label: 'Kerala', value: 182 },
    { label: 'Maha', value: 360 },
    { label: 'Raj', value: 680 },
    { label: 'Telang', value: 235 },
    { label: 'Kar', value: 48 },
    { label: 'Punjab', value: 290 },
  ];

  const projectStatusData = [
    { label: 'Active', value: 5 },
    { label: 'Delayed', value: 2 },
    { label: 'Closure', value: 1 },
    { label: 'Approval', value: 1 },
  ];

  const recentAlerts = MOCK_ALERTS.slice(0, 3);

  return (
    <ScreenShell wide breadcrumbs={[{ label: 'National Dashboard' }]}>
      {/* Role-Based Frontend Selector Bar */}
      <View style={styles.roleBar}>
        <View style={styles.roleLabelWrap}>
          <AppIcon name={APP_ICONS.shieldCheckmark} size={16} color={Colors.primaryDark} />
          <Text style={[styles.roleLabel, { fontSize: fs(12) }]}>Active Scope / Role Switcher:</Text>
        </View>
        <View style={styles.roleChips}>
          {ROLES.map((r) => {
            const active = activeRole === r;
            return (
              <Pressable
                key={r}
                onPress={() => setActiveRole(r)}
                style={[styles.roleChip, active && styles.roleChipActive]}
              >
                <Text style={[styles.roleChipText, active && styles.roleChipTextActive, { fontSize: fs(12) }]}>
                  {r}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Welcome panel — Government institutional header card style */}
      <View style={styles.welcomePanel}>
        <View style={styles.welcomeLeft}>
          <Text style={[styles.welcomeLabel, { fontSize: fs(12) }]}>
            NATIONAL LAND ACQUISITION & MANAGEMENT SYSTEM · RFCTLARR ACT 2013
          </Text>
          <Text style={[styles.welcomeName, { fontSize: fs(24) }]}>
            National Land Monitoring & Decision Support
          </Text>
          <Text style={[styles.welcomeSub, { fontSize: fs(13) }]}>
            Scope: {activeRole} {activeRole === 'State Government' ? `· State: ${selectedState}` : ''} ·
            Integrated with PM GatiShakti National Master Plan
          </Text>
        </View>
        <View style={styles.welcomeActions}>
          <Button
            variant="primary"
            label="Submit Land Proposal"
            onPress={() => router.push(path.proposal as never)}
            small
          />
          <Button
            variant="outline-primary"
            label="National GIS Map"
            onPress={() => router.push(path.gis as never)}
            small
          />
        </View>
      </View>

      {/* Mandatory 8 KPIs Grid (Exact Requirements) */}
      <View style={styles.kpiGrid}>
        <StatCard
          label="Total Projects"
          value={kpis.totalProjects}
          tone="navy"
          sub="Monitored Corridors"
        />
        <StatCard
          label="Land Proposed"
          value={`${kpis.landProposed} ha`}
          tone="saffron"
          sub="Requested Area"
        />
        <StatCard
          label="Land Acquired"
          value={`${kpis.landAcquired} ha`}
          tone="green"
          sub="Award Disbursed"
        />
        <StatCard
          label="Area Notified"
          value={`${kpis.areaNotified} ha`}
          tone="navy"
          sub="Sec 11/19 Gazette"
        />
      </View>

      <View style={styles.kpiGrid}>
        <StatCard
          label="Compensation Disbursed"
          value={`₹${kpis.compensationDisbursed} Cr`}
          tone="green"
          sub="100% Solatium Incl."
        />
        <StatCard
          label="Affected Families"
          value={kpis.affectedFamilies.toLocaleString()}
          tone="grey"
          sub="Entitled for R&R"
        />
        <StatCard
          label="Possession Completed"
          value={kpis.possessionCompleted}
          tone="saffron"
          sub="Physical Handover"
        />
        <StatCard
          label="R&R Progress"
          value={kpis.rrProgress}
          tone="green"
          sub="Resettlement Executed"
        />
      </View>

      {/* Main Grid: Active Project Spotlight + Timelines + Quick Actions */}
      <View style={[styles.grid, wide && styles.gridRow]}>
        <View style={[styles.col, wide && styles.colWide]}>
          {/* Active Project Overview Card */}
          <InfoCard title={`Lead Project Spotlight: ${activeProject.name}`}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { fontSize: fs(12) }]}>Current Stage:</Text>
              <StatusBadge status={activeProject.currentStage === 'Possession' ? 'Processing' : 'Upcoming'} translatedLabel={activeProject.currentStage} />
              <View style={{ marginLeft: 'auto' }}>
                <StatusBadge
                  status={activeProject.status === 'Delayed' ? 'Cancelled' : 'Completed'}
                  translatedLabel={activeProject.status}
                  small
                />
              </View>
            </View>
            <MetaRow label="Project Code / ID" value={`${activeProject.code} (${activeProject.id})`} />
            <MetaRow label="Implementing Agency" value={activeProject.agency} />
            <MetaRow label="Location" value={`${activeProject.tehsil}, ${activeProject.district}, ${activeProject.state}`} />
            <MetaRow label="Land Proposed / Acquired" value={`${activeProject.landProposedHa} ha / ${activeProject.landAcquiredHa} ha (${Math.round((activeProject.landAcquiredHa / activeProject.landProposedHa) * 100)}%)`} />
            <MetaRow label="Compensation Disbursed" value={`₹${activeProject.compensationDisbursedCr} Cr of ₹${activeProject.compensationBudgetCr} Cr`} />
            <MetaRow label="Target Commissioning" value={activeProject.targetDate} />

            <View style={styles.spacerSm}>
              <View style={styles.projectBtnRow}>
                <Button
                  label="View Project In GIS Map"
                  onPress={() => router.push(path.gis as never)}
                  small
                />
                <Button
                  variant="outline-primary"
                  label="All National Projects"
                  onPress={() => router.push(path.projects as never)}
                  small
                />
              </View>
            </View>
          </InfoCard>

          {/* Acquisition Workflow Stage Track (RFCTLARR 9 stages) */}
          <InfoCard title="RFCTLARR 2013 Nine Statutory Milestone Stages">
            <View style={styles.stageTrackWrap}>
              {[
                { stage: 'Proposal', done: true },
                { stage: 'Scrutiny', done: true },
                { stage: 'Approval', done: true },
                { stage: 'Notification', done: true },
                { stage: 'Award', done: true },
                { stage: 'Compensation', done: true },
                { stage: 'Possession', current: true },
                { stage: 'R&R', done: false },
                { stage: 'Closure', done: false },
              ].map((s, idx) => (
                <View key={s.stage} style={styles.stageTrackStep}>
                  <View style={[styles.stageBadge, s.done && styles.stageBadgeDone, s.current && styles.stageBadgeCurrent]}>
                    <Text style={[styles.stageBadgeText, (s.done || s.current) && styles.stageBadgeTextLight]}>
                      {s.done ? '✓' : idx + 1}
                    </Text>
                  </View>
                  <Text style={[styles.stageLabel, s.current && styles.stageLabelCurrent, { fontSize: fs(10) }]} numberOfLines={1}>
                    {s.stage}
                  </Text>
                </View>
              ))}
            </View>
          </InfoCard>

          {/* Reuse existing BarChart components for Domain Charts */}
          <View style={[styles.chartGrid, wide && styles.chartGridRow]}>
            <View style={styles.col}>
              <BarChart
                title="Land Acquisition Progress (ha by Month)"
                data={acquisitionProgressMonthly}
                suffix=" ha"
              />
            </View>
            <View style={styles.col}>
              <BarChart
                title="State-wise Land Acquisition (ha)"
                data={stateWiseAcquisition}
                color={Colors.saffronDark}
                suffix=" ha"
              />
            </View>
          </View>
        </View>

        {/* Right Column: Quick Actions + Statutory Alerts */}
        <View style={styles.col}>
          <SectionHeading title="Decision Support Actions" />
          <QuickActions />

          <SectionHeading
            title="Statutory Alerts & Notices"
            right={<Link variant="body" href={path.alerts} label={t('common.viewAll')} />}
          />
          <InfoCard padded={false}>
            {recentAlerts.map((alt) => (
              <Link key={alt.id} href={path.alerts} variant="body">
                <View style={styles.notificationRow}>
                  <View style={styles.notifIcon}>
                    {alt.type === 'Critical' ? (
                      <AppIcon name={APP_ICONS.alertCircle} size={18} color={Colors.danger} />
                    ) : alt.type === 'Warning' ? (
                      <AppIcon name={APP_ICONS.warning} size={18} color={Colors.warning} />
                    ) : alt.type === 'Success' ? (
                      <AppIcon name={APP_ICONS.checkmarkCircle} size={18} color={Colors.green} />
                    ) : (
                      <AppIcon name={APP_ICONS.infoCircle} size={18} color={Colors.primary} />
                    )}
                  </View>
                  <View style={styles.notifBody}>
                    <Text style={[styles.notifTitle, { fontSize: fs(13) }]}>
                      {alt.title}
                    </Text>
                    <Text style={[styles.notifMeta, { fontSize: fs(11) }]} numberOfLines={2}>
                      {alt.message}
                    </Text>
                  </View>
                  <StatusBadge
                    status={alt.type === 'Critical' ? 'Cancelled' : alt.type === 'Warning' ? 'Waiting' : 'Completed'}
                    translatedLabel={alt.type}
                    small
                  />
                </View>
              </Link>
            ))}
          </InfoCard>

          <View style={{ marginTop: Spacing.md }}>
            <BarChart
              title="National Project Status Distribution"
              data={projectStatusData}
              color={Colors.green}
            />
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  roleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
    gap: 8,
  },
  roleLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleLabel: {
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  roleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  roleChipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  roleChipText: {
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  roleChipTextActive: {
    color: Colors.white,
  },
  welcomePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderLeftWidth: 4,
    borderLeftColor: Colors.saffron,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  welcomeLeft: {
    flex: 1,
    minWidth: 260,
  },
  welcomeLabel: {
    color: Colors.textMuted,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  welcomeName: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  welcomeSub: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
  welcomeActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  grid: {
    gap: Spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  col: {
    flex: 1,
  },
  colWide: {
    flex: 1.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statusLabel: {
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  spacerSm: {
    marginTop: Spacing.md,
  },
  projectBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  stageTrackWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    gap: 4,
    flexWrap: 'wrap',
  },
  stageTrackStep: {
    alignItems: 'center',
    flex: 1,
    minWidth: 46,
  },
  stageBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stageBadgeDone: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  stageBadgeCurrent: {
    backgroundColor: Colors.saffron,
    borderColor: Colors.saffronDark,
  },
  stageBadgeText: {
    color: Colors.textMuted,
    fontWeight: '800',
    fontSize: 10,
  },
  stageBadgeTextLight: {
    color: Colors.white,
  },
  stageLabel: {
    color: Colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  stageLabelCurrent: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  chartGrid: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  chartGridRow: {
    flexDirection: 'row',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  notifIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBody: {
    flex: 1,
  },
  notifTitle: {
    fontWeight: '700',
    color: Colors.text,
  },
  notifMeta: {
    color: Colors.textMuted,
    marginTop: 2,
  },
});

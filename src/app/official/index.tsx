import { router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import AlertBanner from '../../components/AlertBanner';
import DemoBadge from '../../components/DemoBadge';
import InfoCard, { MetaRow } from '../../components/InfoCard';
import OfficialShell from '../../components/OfficialShell';
import Button from '../../components/Button';
import SectionHeading from '../../components/SectionHeading';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { Colors, Spacing } from '../../constants/theme';
import { ALL_PROJECTS, MOCK_ALERTS } from '../../data/landAcquisitionData';
import { useI18n } from '../../i18n';
import { useStore } from '../../store/AppStore';

export default function OfficialDashboard() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const leadProject = ALL_PROJECTS[0];

  return (
    <OfficialShell>
      <SectionHeading
        title="Implementing Agency & SLAO Operational Portal"
        subtitle={`Active Jurisdiction: ${leadProject.district}, ${leadProject.state} · ${leadProject.agency}`}
        right={<DemoBadge />}
      />

      {/* Summary cards */}
      <View style={[styles.cards, !wide && styles.cardsStack]}>
        <StatCard label="Total Requisitioned" value={`${leadProject.landProposedHa} ha`} tone="navy" />
        <StatCard label="Land Acquired" value={`${leadProject.landAcquiredHa} ha`} tone="green" />
        <StatCard label="Possession Rate" value={`${leadProject.possessionPercent}%`} tone="saffron" />
        <StatCard label="Compensation Disbursed" value={`₹${leadProject.compensationDisbursedCr} Cr`} tone="green" />
        <StatCard label="R&R Progress" value={`${leadProject.rrPercent}%`} tone="grey" />
      </View>

      {/* Corridor Progress */}
      <View style={[styles.liveGrid, !wide && styles.liveGridStack]}>
        <InfoCard title="Active Statutory Milestone">
          <View style={styles.servingRow}>
            <Text style={[styles.servingToken, { fontSize: fs(24) }]}>{leadProject.currentStage} Stage</Text>
            <StatusBadge status="Processing" small translatedLabel={leadProject.status} />
            <Text style={[styles.servingMeta, { fontSize: fs(13) }]}>
              {leadProject.name} · {leadProject.code}
            </Text>
          </View>
        </InfoCard>

        <InfoCard title="Critical Statutory Notices">
          <View style={styles.nextRow}>
            <Text style={[styles.nextToken, { fontSize: fs(13) }]}>Section 19 Declaration</Text>
            <Text style={[styles.nextMeta, { fontSize: fs(11) }]}>Published in Gazette</Text>
          </View>
          <View style={styles.nextRow}>
            <Text style={[styles.nextToken, { fontSize: fs(13) }]}>Section 23 Award</Text>
            <Text style={[styles.nextMeta, { fontSize: fs(11) }]}>Sanctioned</Text>
          </View>
        </InfoCard>

        <InfoCard title="Possession Handover">
          <View style={styles.nextRow}>
            <Text style={[styles.nextToken, { fontSize: fs(13) }]}>Physical Handover</Text>
            <Text style={[styles.nextMeta, { fontSize: fs(11) }]}>{leadProject.possessionPercent}% Completed</Text>
          </View>
        </InfoCard>
      </View>

      {/* Quick actions */}
      <SectionHeading title="Authority Actions" />
      <View style={styles.actions}>
        <Button label="Open Corridor GIS Map" onPress={() => router.push('/queue' as never)} />
        <Button variant="outline-primary" label="Compensation Audit" onPress={() => router.push('/payments' as never)} />
        <Button variant="outline-primary" label="Cadastral Parcels" onPress={() => router.push('/marketplace' as never)} />
        <Button variant="outline-primary" label="National Reports" onPress={() => router.push('/prices' as never)} />
      </View>

      {/* Project overview */}
      <SectionHeading title="Corridor Details" />
      <InfoCard title={leadProject.name}>
        <MetaRow label="State & District" value={`${leadProject.state} · ${leadProject.district}`} />
        <MetaRow label="Implementing Agency" value={leadProject.agency} />
        <MetaRow label="Target Date" value={leadProject.targetDate} />
        <MetaRow label="Affected Families" value={`${leadProject.affectedFamilies} Families`} />
      </InfoCard>

      <AlertBanner tone="neutral" message="Data synchronized with PM GatiShakti National Master Plan." />
    </OfficialShell>
  );
}

const styles = StyleSheet.create({
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardsStack: {
    flexDirection: 'column',
  },
  liveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  liveGridStack: {
    flexDirection: 'column',
  },
  servingRow: {
    flexDirection: 'column',
    gap: 6,
  },
  servingToken: {
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  servingMeta: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  nextToken: {
    color: Colors.primary,
    fontWeight: '800',
  },
  nextMeta: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
});

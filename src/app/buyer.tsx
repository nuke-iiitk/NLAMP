import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../components/Button';
import InfoCard, { MetaRow } from '../components/InfoCard';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { Colors, Spacing } from '../constants/theme';
import { ALL_PROJECTS } from '../data/landAcquisitionData';
import { useI18n } from '../i18n';
import { path } from '../navigation';

const NODES = [
  { id: 'ADM-DLR-01', name: 'Department of Land Resources (Central)', role: 'Central Ministry', scope: 'All 8 national corridor projects', users: 42, status: 'Active' },
  { id: 'ADM-KL-02', name: 'Kerala Revenue & Land Acquisition Office', role: 'State Government', scope: 'Kerala corridors · 245 ha', users: 28, status: 'Active' },
  { id: 'ADM-MH-03', name: 'Maharashtra SLAO & NICDIT Cell', role: 'State Government', scope: 'Maharashtra corridors · 930 ha', users: 35, status: 'Active' },
  { id: 'ADM-NHAI-04', name: 'NHAI Project Implementation Unit', role: 'Project Implementing Agency', scope: 'NHAI corridors · 585 ha', users: 19, status: 'Active' },
  { id: 'ADM-KTM-05', name: 'Kottayam District Collectorate (LA Cell)', role: 'District Authority', scope: 'Kottayam district parcels', users: 12, status: 'Active' },
];

/**
 * Administration — nodal offices, role matrix and audit configuration.
 * Replaces the old buyer/marketplace screen; same InfoCard/StatCard language.
 */
export default function BuyerScreen() {
  const { fs } = useI18n();
  const [activeNode, setActiveNode] = useState(NODES[0].id);
  const node = NODES.find((n) => n.id === activeNode) ?? NODES[0];

  return (
    <ScreenShell breadcrumbs={[{ label: 'Home', href: path.home }, { label: 'Administration' }]}>
      <SectionHeading title="System Administration & Role Management" subtitle="Nodal offices, role-based data scopes and statutory compliance configuration." />

      <View style={styles.cards}>
        <StatCard label="Registered Nodal Offices" value={String(NODES.length)} tone="navy" />
        <StatCard label="Active Authority Users" value="136" tone="green" />
        <StatCard label="National Projects" value={String(ALL_PROJECTS.length)} tone="saffron" />
        <StatCard label="Audit Compliance" value="98.2%" tone="grey" />
      </View>

      <InfoCard title="Nodal Office Directory" accent={Colors.saffron}>
        {NODES.map((n) => (
          <View key={n.id} style={styles.box}>
            <View style={styles.row}>
              <Text style={[styles.name, { fontSize: fs(13) }]}>{n.name}</Text>
              <StatusBadge status="Completed" translatedLabel={n.status} small />
            </View>
            <MetaRow label="Node ID" value={n.id} />
            <MetaRow label="Assigned Role" value={n.role} />
            <MetaRow label="Data Scope" value={n.scope} />
            <MetaRow label="Authority Users" value={String(n.users)} />
            <Button small label={activeNode === n.id ? 'Active Node' : 'Switch to Node'} variant={activeNode === n.id ? 'primary' : 'outline-primary'} onPress={() => setActiveNode(n.id)} />
          </View>
        ))}
      </InfoCard>

      <InfoCard title={`Active Node: ${node.name}`} accent={Colors.green}>
        <MetaRow label="Role Permissions" value="Notifications gazette · Awards declare · Compensation approve · Possession certify" />
        <MetaRow label="Statutory SLA" value="Sec 11 objections 60 days · Sec 25 award 12 months · Sec 38 possession notice 30 days" />
        <View style={styles.row}>
          <Button label="Open National Dashboard" onPress={() => router.push(path.dashboard as never)} />
          <Button label="Statutory Alerts" variant="outline-primary" onPress={() => router.push(path.alerts as never)} />
        </View>
      </InfoCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  box: { marginTop: Spacing.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceAlt },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  name: { fontWeight: '800', color: Colors.primaryDark, flex: 1 },
});

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import EmptyState from '../components/EmptyState';
import InfoCard from '../components/InfoCard';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatusBadge from '../components/StatusBadge';
import { Colors, Radius, Spacing } from '../constants/theme';
import { MOCK_ALERTS, type ProjectAlert } from '../data/landAcquisitionData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

export default function AlertsScreen() {
  const { t, fs } = useI18n();
  const [filter, setFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return MOCK_ALERTS;
    return MOCK_ALERTS.filter((a) => a.type === filter);
  }, [filter]);

  return (
    <ScreenShell wide breadcrumbs={[{ label: 'Home', href: path.home }, { label: 'Statutory Alerts' }]}>
      <SectionHeading
        title="Statutory & Milestone Alerts System"
        subtitle="Automated vigilance: Section 11/19 notification lapses, Section 25 award deadlines, possession hurdles and R&R compliance."
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['All', 'Critical', 'Warning', 'Information', 'Success'].map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive, { fontSize: fs(12) }]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Notification Cards List */}
      <View style={styles.list}>
        {filtered.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              item.type === 'Critical' && styles.cardCritical,
              item.type === 'Warning' && styles.cardWarning,
              item.type === 'Success' && styles.cardSuccess,
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconWrap, { backgroundColor: item.type === 'Critical' ? Colors.dangerLight : item.type === 'Warning' ? Colors.warningLight : item.type === 'Success' ? Colors.greenLight : Colors.primaryLight }]}>
                  {item.type === 'Critical' ? (
                    <AppIcon name={APP_ICONS.alertCircle} size={20} color={Colors.danger} />
                  ) : item.type === 'Warning' ? (
                    <AppIcon name={APP_ICONS.warning} size={20} color={Colors.warning} />
                  ) : item.type === 'Success' ? (
                    <AppIcon name={APP_ICONS.checkmarkCircle} size={20} color={Colors.green} />
                  ) : (
                    <AppIcon name={APP_ICONS.infoCircle} size={20} color={Colors.primary} />
                  )}
                </View>
                <View>
                  <Text style={[styles.cardTitle, { fontSize: fs(14) }]}>{item.title}</Text>
                  <Text style={[styles.cardMeta, { fontSize: fs(11) }]}>
                    Date: {item.date} {item.stage ? `· Stage: ${item.stage}` : ''}
                  </Text>
                </View>
              </View>

              <StatusBadge
                status={item.type === 'Critical' ? 'Cancelled' : item.type === 'Warning' ? 'Waiting' : 'Completed'}
                translatedLabel={item.type}
                small
              />
            </View>

            <Text style={[styles.cardMessage, { fontSize: fs(13) }]}>{item.message}</Text>

            <View style={styles.cardActions}>
              <Button
                variant="outline-primary"
                label="View Project on GIS Map"
                onPress={() => router.push(path.gis as never)}
                small
              />
              <Button
                variant="ghost"
                label="Statutory Section Notice"
                onPress={() => router.push(path.documents as never)}
                small
              />
            </View>
          </View>
        ))}

        {filtered.length === 0 ? (
          <EmptyState title="No alerts" message="No alerts currently match the selected severity filter." />
        ) : null}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  filterChipText: {
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  list: {
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  cardCritical: {
    borderLeftColor: Colors.danger,
    backgroundColor: '#fffdfd',
  },
  cardWarning: {
    borderLeftColor: Colors.warning,
    backgroundColor: '#fffefc',
  },
  cardSuccess: {
    borderLeftColor: Colors.green,
    backgroundColor: '#fcfffd',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    minWidth: 240,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: Colors.text,
    fontWeight: '800',
  },
  cardMeta: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardMessage: {
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexWrap: 'wrap',
  },
});

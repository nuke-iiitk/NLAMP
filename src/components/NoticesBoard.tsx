import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';
import type { PortalNotice } from '../data/notices';
import { AppIcon } from './AppIcon';
import Button from './Button';
import type { Href } from 'expo-router';

type Props = {
  notices: PortalNotice[];
  subjectLabel: string;
  dateLabel: string;
  viewAllLabel: string;
  viewAllHref: Href | string;
};

/**
 * Latest-notices board. Native renders bordered rows; web resolves
 * NoticesBoard.web.tsx for a Bootstrap table.
 */
export default function NoticesBoard({ notices, subjectLabel, dateLabel, viewAllLabel, viewAllHref }: Props) {
  const { fs } = useI18n();
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { fontSize: fs(11) }]}>{subjectLabel}</Text>
        <Text style={[styles.headerText, { fontSize: fs(11), width: 80, textAlign: 'right' }]}>
          {dateLabel}
        </Text>
      </View>
      {notices.map((n) => (
        <View key={n.title} style={styles.row}>
          <AppIcon name="bi-file-earmark-text" size={15} color={Colors.info} style={styles.icon} />
          <View style={styles.copy}>
            <Text style={[styles.title, { fontSize: fs(13) }]}>{n.title}</Text>
          </View>
          <Text style={[styles.date, { fontSize: fs(11), width: 80, textAlign: 'right' }]}>
            {n.date}
          </Text>
        </View>
      ))}
      <View style={styles.footer}>
        <Button label={viewAllLabel} href={viewAllHref} variant="link" small />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryDark,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  headerText: {
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  icon: {
    width: 24,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: Colors.info,
    fontWeight: '600',
    lineHeight: 20,
  },
  date: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  footer: {
    padding: Spacing.sm,
    alignItems: 'flex-start',
  },
});

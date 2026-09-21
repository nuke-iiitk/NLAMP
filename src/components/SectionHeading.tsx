import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';

/**
 * Section heading pattern: navy title, optional supporting description.
 * Content (buttons, links) can be aligned on the same row via `right`.
 */
export default function SectionHeading({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const { fs } = useI18n();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.title, { fontSize: fs(20) }]}>{title}</Text>
        {right}
      </View>
      {subtitle ? <Text style={[styles.subtitle, { fontSize: fs(14) }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '800',
    color: Colors.primaryDark,
    flexShrink: 1,
    letterSpacing: 0.2,
    fontFamily: Fonts.extraBold,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 20,
  },
});

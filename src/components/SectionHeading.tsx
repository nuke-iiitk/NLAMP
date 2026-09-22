import { StyleSheet, Text, View } from 'react-native';

import { Colors, DISPLAY_STACK, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';

/**
 * Section heading pattern: indigo display title with a saffron field-tick
 * mark, optional supporting description. Content (buttons, links) can be
 * aligned on the same row via `right`.
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
        <View style={styles.titleGroup}>
          <View style={styles.tick} />
          <Text style={[styles.title, { fontSize: fs(21) }]}>{title}</Text>
        </View>
        {right}
      </View>
      {subtitle ? <Text style={[styles.subtitle, { fontSize: fs(14) }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  /** Small saffron field-tick — a quiet agricultural mark, not an icon pile. */
  tick: {
    width: 5,
    height: 22,
    borderRadius: 3,
    backgroundColor: Colors.saffron,
  },
  title: {
    fontWeight: '800',
    color: Colors.primaryDark,
    flexShrink: 1,
    letterSpacing: 0,
    fontFamily: DISPLAY_STACK,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
    lineHeight: 20,
    paddingLeft: 15,
  },
});

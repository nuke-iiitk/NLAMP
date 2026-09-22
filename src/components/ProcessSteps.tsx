import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';
import { AppIcon } from './AppIcon';

export type ProcessStep = {
  step: number;
  label: string;
  body: string;
};

/**
 * Numbered booking-process steps. Native renders bordered rows; web resolves
 * ProcessSteps.web.tsx for a Bootstrap list-group with numbered badges.
 */
export default function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  const { fs } = useI18n();
  return (
    <View style={styles.list}>
      {steps.map((item) => (
        <View key={item.step} style={styles.row}>
          <View style={styles.num}>
            <Text style={styles.numText}>{item.step}</Text>
          </View>
          <View style={styles.copy}>
            <Text style={[styles.label, { fontSize: fs(14) }]}>{item.label}</Text>
            <Text style={[styles.body, { fontSize: fs(12) }]}>{item.body}</Text>
          </View>
          <AppIcon name="bi-chevron-right" size={14} color={Colors.textMuted} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  num: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  copy: {
    flex: 1,
  },
  label: {
    color: Colors.text,
    fontWeight: '700',
  },
  body: {
    color: Colors.textSecondary,
    marginTop: 1,
  },
});

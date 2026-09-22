import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';

/** Horizontal progress stepper used by multi-step flows (booking, registration). */
export default function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  const { fs } = useI18n();
  return (
    <View style={styles.wrap} accessibilityRole="progressbar">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <View key={step} style={styles.stepRow}>
            <View
              style={[
                styles.dot,
                done && styles.dotDone,
                active && styles.dotActive,
              ]}
            >
              <Text style={[styles.dotText, (done || active) && styles.dotTextActive, { fontSize: fs(12) }]}>
                {done ? '✓' : index + 1}
              </Text>
            </View>
            <Text style={[styles.label, (done || active) && styles.labelActive, { fontSize: fs(11) }]} numberOfLines={2}>
              {step}
            </Text>
            {index < steps.length - 1 ? <View style={styles.connector} /> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  stepRow: {
    flex: 1,
    alignItems: 'center',
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  dotDone: {
    backgroundColor: Colors.green,
  },
  dotActive: {
    backgroundColor: Colors.saffron,
  },
  dotText: {
    color: Colors.textMuted,
    fontWeight: '700',
  },
  dotTextActive: {
    color: Colors.white,
    fontWeight: '800',
  },
  label: {
    marginTop: 8,
    textAlign: 'center',
    color: Colors.textMuted,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.saffronDark,
    fontWeight: '800',
  },
  connector: {
    position: 'absolute',
    top: 17,
    left: '50%',
    right: '-50%',
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
    zIndex: -1,
  },
});

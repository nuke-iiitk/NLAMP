import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Colors, Radius, Spacing } from '../constants/theme';
import DemoBadge from './DemoBadge';
import { useI18n } from '../i18n';

/**
 * Premium token card — the object farmers screenshot and show at the gate.
 * Saffron header ribbon, giant tabular token digits, cream footer. No heavy
 * admit-card borders; identity comes from colour and type scale.
 */
export default function TokenDisplay({
  token,
  label,
  subtitle,
}: {
  token: string;
  label?: string;
  subtitle?: string;
}) {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const compact = width < 480;
  // Scale the giant token number so it never overflows a 360–400px phone.
  const tokenSize = fs(compact ? 38 : 56);
  const tokenLetter = compact ? 2 : 4;
  return (
    <View style={styles.wrap}>
      {/* Saffron ribbon header */}
      <View style={styles.headerStrip}>
        <Text style={[styles.headerText, { fontSize: fs(12) }]}>
          {label ?? 'PROCUREMENT TOKEN'}
        </Text>
      </View>

      {/* Token body */}
      <View style={styles.body}>
        <Text style={[styles.token, { fontSize: tokenSize, letterSpacing: tokenLetter }]} accessibilityRole="text">
          {token}
        </Text>
        {subtitle ? <Text style={[styles.subtitle, { fontSize: fs(13) }]}>{subtitle}</Text> : null}
        <View style={styles.demoRow}>
          <DemoBadge />
        </View>
      </View>

      {/* Footer strip */}
      <View style={styles.footerStrip}>
        <Text style={[styles.footerText, { fontSize: fs(11) }]}>
          {t('common.appName')} · DEPARTMENT OF CONSUMER AFFAIRS
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: Colors.primaryDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
    marginBottom: Spacing.lg,
  },
  headerStrip: {
    backgroundColor: Colors.saffron,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  headerText: {
    color: Colors.white,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2.4,
  },
  body: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  token: {
    color: Colors.primaryDeep,
    fontWeight: '800',
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 19,
  },
  demoRow: {
    marginTop: Spacing.md,
  },
  footerStrip: {
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 8,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

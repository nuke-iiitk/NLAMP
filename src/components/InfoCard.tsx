import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';

type Props = {
  title?: string;
  children: ReactNode;
  /** Left accent border colour, e.g. Colors.saffron. */
  accent?: string;
  padded?: boolean;
};

export default function InfoCard({ title, children, accent, padded = true }: Props) {
  const { fs } = useI18n();

  return (
    <View style={[styles.card, !padded && styles.noPad, accent ? { borderLeftWidth: 4, borderLeftColor: accent } : null]}>
      {title ? <Text style={[styles.title, { fontSize: fs(16) }]}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function MetaRow({ label, value }: { label: string; value: string }) {
  const { fs } = useI18n();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { fontSize: fs(12) }]}>{label}</Text>
      <Text style={[styles.value, { fontSize: fs(16) }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#173B27',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  noPad: {
    padding: 0,
  },
  title: {
    fontWeight: '800',
    color: Colors.primaryDark,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  row: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  value: {
    fontWeight: '500',
    color: Colors.text,
  },
});


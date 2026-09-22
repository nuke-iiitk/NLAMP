import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';

type Item = {
  id: string;
  label: string;
  hint?: string;
};

type Props = {
  items: Item[];
  value: string;
  onChange: (id: string) => void;
};

/**
 * Native (iOS/Android) filter chip group. Metro resolves ChoiceChips.web.tsx
 * on web, where Bootstrap's btn-group classes render instead.
 */
export default function ChoiceChips({ items, value, onChange }: Props) {
  const { fs } = useI18n();
  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected, { fontSize: fs(13) }]}>
              {item.label}
            </Text>
            {item.hint ? (
              <Text style={[styles.hint, selected && styles.hintSelected, { fontSize: fs(11) }]}>
                {item.hint}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  label: {
    fontWeight: '700',
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.primary,
  },
  hint: {
    marginTop: 4,
    color: Colors.textSecondary,
  },
  hintSelected: {
    color: Colors.primary,
  },
});

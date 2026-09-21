import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';

export type NavButtonProps = {
  /** Nav label (already translated by the caller). */
  label: string;
  onPress: () => void;
  /** Active/current page → filled navy block. */
  active?: boolean;
  /** Full-width stackable variant used in the mobile drawer. */
  block?: boolean;
};

/**
 * Native nav block — rectangular outline button. Metro resolves
 * NavButton.web.tsx on web, so this file only runs on iOS/Android.
 * Press feedback is a calm background tint; no scale animation.
 */
export default function NavButton({ label, onPress, active, block }: NavButtonProps) {
  const { fs } = useI18n();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.button,
        block && styles.buttonBlock,
        styles.buttonOutline,
        pressed && styles.buttonOutlinePressed,
      ]}
    >
      <Text
        style={[styles.label, { fontSize: fs(block ? 14 : 13) }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  blockWrap: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    minHeight: 34,
    borderWidth: 1.5,
    borderRadius: Radius.md,
  },
  buttonBlock: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
  },
  buttonOutline: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  buttonOutlinePressed: {
    backgroundColor: Colors.primaryLight,
  },
  label: {
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: Fonts.semiBold,
  },
});

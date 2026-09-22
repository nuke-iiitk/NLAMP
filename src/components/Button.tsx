import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Href } from 'expo-router';
import { Colors, Fonts, Radius, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';
import { AppIcon } from './AppIcon';
import type { AppIconName } from './AppIcon';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline-primary'
  | 'outline-secondary'
  | 'success'
  | 'danger'
  | 'link'
  | 'ghost';

export type ButtonProps = {
  /** Visible label. Omit for icon-only buttons. */
  label?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  /** Visual style. Defaults to 'primary'. */
  variant?: ButtonVariant;
    /** Navigation destination — renders an anchor/link when provided (web only). */
  href?: Href | string;
  /** Toggle/selected state (renders the active skin). */
  active?: boolean;
  disabled?: boolean;
  small?: boolean;
    /** Icon glyph on the leading edge. */
  icon?: AppIconName;
  /** Render only the icon (label omitted). */
  iconOnly?: boolean;
  /** Extra content rendered after the label (e.g. chevron icon). */
  after?: React.ReactNode;
  /** Extra Bootstrap utility classes (web only). */
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const VARIANT_COLORS: Record<
  ButtonVariant,
  { bg: string; fg: string; border: string }
> = {
  primary: { bg: Colors.primary, fg: Colors.white, border: Colors.primary },
  secondary: { bg: Colors.surface, fg: Colors.text, border: Colors.borderDark },
  'outline-primary': { bg: 'transparent', fg: Colors.primary, border: Colors.primary },
  'outline-secondary': { bg: 'transparent', fg: Colors.text, border: Colors.border },
  success: { bg: Colors.green, fg: Colors.white, border: Colors.green },
  danger: { bg: Colors.danger, fg: Colors.white, border: Colors.danger },
  link: { bg: 'transparent', fg: Colors.info, border: 'transparent' },
  ghost: { bg: 'transparent', fg: Colors.primary, border: 'transparent' },
};

/**
 * Native (iOS/Android) general-purpose button. Metro resolves Button.web.tsx
 * on web, where a real Bootstrap `<button>` is rendered instead.
 */
export default function Button({
  label,
  children,
  onPress,
  variant = 'primary',
  active = false,
  disabled = false,
  small = false,
  icon,
     iconOnly = false,
  className: _className,
  accessibilityLabel,
  accessibilityHint,
  after,
}: ButtonProps) {
  const { fs } = useI18n();
  const tone = VARIANT_COLORS[variant];
  const showLabel = !iconOnly;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      accessibilityLabel={accessibilityLabel ?? (showLabel ? label : undefined)}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.btn,
        active && styles.btnActive,
        small && styles.btnSmall,
        iconOnly && styles.btnIconOnly,
        {
          backgroundColor: active ? Colors.primaryLight : tone.bg,
          borderColor: tone.border,
          opacity: disabled ? 0.5 : pressed && !active ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        {icon ? (
          <AppIcon
            name={icon}
            size={small ? 14 : 18}
            color={active ? Colors.primaryDark : tone.fg}
          />
        ) : null}
                {showLabel ? (
          <Text
            style={[
              styles.label,
              { color: active ? Colors.primaryDark : tone.fg, fontSize: fs(small ? 13 : 15) },
            ]}
          >
            {label ?? children}
          </Text>
        ) : null}
        {after}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  btnSmall: { minHeight: 34, paddingHorizontal: Spacing.sm },
  btnIconOnly: { paddingHorizontal: Spacing.sm, minWidth: 40 },
  btnActive: {
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  label: {
    fontWeight: '700',
    fontFamily: Fonts.semiBold,
  },
});

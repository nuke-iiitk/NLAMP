import { Pressable, StyleSheet, Text, View } from 'react-native';

import { router, type Href } from 'expo-router';
import { Colors, Fonts } from '../constants/theme';
import { useI18n } from '../i18n';

export type LinkVariant = 'nav' | 'body' | 'muted' | 'footer' | 'breadcrumb';

export type LinkProps = {
  /** Router destination path. */
  href?: Href | string;
  /** Link text. Falls back to `children` if omitted. */
  label?: string;
  children?: React.ReactNode;
  variant?: LinkVariant;
  /** Active/selected state (e.g. current nav page). */
  active?: boolean;
  /** Click handler override (default: router.push(href)). */
  onPress?: () => void;
  /** Extra text/element to render after the label (e.g. external icon). */
  after?: React.ReactNode;
  accessibilityLabel?: string;
  className?: string;
};

/** Native (iOS/Android) link — a text button built on Pressable. */
export default function Link({
  href,
  label,
  children,
  variant = 'body',
  active = false,
  onPress,
  after,
  accessibilityLabel,
  className: _className,
}: LinkProps) {
  const { fs } = useI18n();
    const handle = onPress ?? (() => router.push(href as Href));

  const color = active
    ? Colors.primary
    : variant === 'muted'
    ? Colors.textMuted
    : variant === 'footer'
    ? Colors.white
    : Colors.info;

  return (
    <Pressable
      onPress={handle}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.link,
        { opacity: pressed ? 0.8 : 1, color },
      ]}
    >
      <View style={styles.row}>
        <Text
          style={[
            styles.text,
            { color, fontSize: fs(variant === 'footer' ? 12 : 14), fontWeight: active ? '800' : '600' },
          ]}
        >
          {label ?? children}
        </Text>
        {after ? <View style={styles.after}>{after}</View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontFamily: Fonts.regular,
  },
  after: {
    paddingLeft: 2,
  },
});

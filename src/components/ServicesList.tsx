import { StyleSheet, View } from 'react-native';

import type { Href } from 'expo-router';
import { Spacing } from '../constants/theme';
import Button from './Button';
import type { AppIconName } from './iconGlyphs';

export type ServiceItem = {
  title: string;
  desc: string;
  href: Href | string;
  icon: AppIconName;
};

/**
 * Services offered list. Native renders bordered rows via the Button
 * component; web resolves ServicesList.web.tsx for Bootstrap list-groups.
 */
export default function ServicesList({ items }: { items: ServiceItem[] }) {
  return (
    <View style={styles.list}>
      {items.map((srv) => (
        <Button
          key={String(srv.href)}
          variant="ghost"
          href={srv.href}
          icon={srv.icon}
          accessibilityLabel={srv.title}
          accessibilityHint={srv.desc}
          label={srv.title}
          description={srv.desc}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
});

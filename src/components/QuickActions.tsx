import { type Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, type AppIconName, AppIcon } from './AppIcon';

type Action = {
  icon: AppIconName;
  labelKey:
    | 'dash.qaBook'
    | 'dash.qaTrack'
    | 'dash.qaBookings'
    | 'dash.qaNotifications'
    | 'dash.qaCentres'
    | 'dash.qaHelp'
    | 'nav.prices'
    | 'nav.payments';
  href: Href;
  tone: 'navy' | 'saffron' | 'green';
};

const ACTIONS: Action[] = [
  { icon: APP_ICONS.calendar, labelKey: 'dash.qaBook', href: path.booking, tone: 'saffron' },
  { icon: APP_ICONS.pulse, labelKey: 'dash.qaTrack', href: path.queue, tone: 'navy' },
  { icon: APP_ICONS.list, labelKey: 'dash.qaBookings', href: path.bookings, tone: 'navy' },
  { icon: APP_ICONS.notifications, labelKey: 'dash.qaNotifications', href: path.notifications, tone: 'navy' },
  { icon: APP_ICONS.business, labelKey: 'dash.qaCentres', href: path.centres, tone: 'green' },
  { icon: APP_ICONS.currency, labelKey: 'nav.prices', href: path.prices, tone: 'saffron' },
  { icon: APP_ICONS.wallet, labelKey: 'nav.payments', href: path.payments, tone: 'green' },
  { icon: APP_ICONS.language, labelKey: 'dash.qaHelp', href: path.help, tone: 'navy' },
];

const ICON_COLORS = {
  navy: Colors.primary,
  saffron: Colors.saffronDark,
  green: Colors.green,
};

/** Dashboard quick-action tiles (icons always paired with text, min touch 44). */
export default function QuickActions() {
  const { t, fs } = useI18n();
  return (
    <View style={styles.grid}>
      {ACTIONS.map((action) => (
        <Pressable
          key={action.labelKey}
          accessibilityRole="button"
          onPress={() => router.push(action.href)}
          style={({ pressed }) => [
            styles.tile,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: action.tone === 'saffron' ? Colors.saffronLight : action.tone === 'green' ? Colors.greenLight : Colors.primaryLight }]}>
            <AppIcon name={action.icon} size={24} color={ICON_COLORS[action.tone]} />
          </View>
          <Text style={[styles.label, { fontSize: fs(13) }]}>{t(action.labelKey)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  tile: {
    flexGrow: 1,
    minWidth: 150,
    minHeight: 96,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
});


import { ReactNode, useEffect } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import AppFooter from './AppFooter';
import Breadcrumbs, { type Crumb } from './Breadcrumbs';
import GovernmentHeader from './GovernmentHeader';
import { Colors, MaxContentWidth, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';
import { useStore } from '../store/AppStore';

type Props = {
  children: ReactNode;
  breadcrumbs?: Crumb[];
  /** Wide layouts (tables, dashboards) can use the full portal width. */
  wide?: boolean;
  showFooter?: boolean;
};

/**
 * Page chrome for the land-acquisition portal.
 *
 * The footer lives INSIDE the scrollable content, so it appears at the
 * natural end of the page flow — standard website layout, no overlay panels.
 *
 * On web this shell also keeps browser metadata in sync with the page:
 * `document.title` follows the current breadcrumb (meaningful tab titles,
 * correct titles on refresh/direct links under the Pages sub-path (/NLAMP/) and
 * `<html lang>` follows the selected language for screen readers.
 */
export default function ScreenShell({ children, breadcrumbs, wide, showFooter = true }: Props) {
  const { t, language } = useI18n();
  const { notifications, auth } = useStore();
  const { width } = useWindowDimensions();
  const unread = auth.role === 'farmer' ? notifications.filter((n) => !n.read).length : 0;
  const compact = width < 600;

  const pageLabel = breadcrumbs?.length ? breadcrumbs[breadcrumbs.length - 1].label : '';

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const base = t('common.appName');
    document.title = pageLabel ? `${pageLabel} | ${base}` : base;
    document.documentElement.lang = language === 'hi' ? 'hi' : language === 'ml' ? 'ml' : 'en';
  }, [pageLabel, language, t]);

  return (
    <View style={styles.root}>
      <GovernmentHeader />
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[]}
      >
        <View
          nativeID="main-content"
          style={[
            styles.inner,
            compact && styles.innerCompact,
            { maxWidth: wide ? MaxContentWidth : Math.min(MaxContentWidth, 880) },
          ]}
        >
          {unread > 0 && auth.role === 'farmer' ? (
            <View style={styles.unreadNote}>
              <Text style={styles.unreadText}>
                {t('notif.unread')}: {unread} · {t('nav.notifications')}
              </Text>
            </View>
          ) : null}
          {children}
        </View>

        {/* Footer scrolls with the content — visible at the end of the page */}
        {showFooter ? <AppFooter /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
    inner: {
    width: '100%',
    alignSelf: 'center',
    padding: Spacing.lg,
  },
  innerCompact: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  unreadNote: {
    backgroundColor: Colors.infoLight,
    borderColor: Colors.info,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    marginBottom: Spacing.md,
  },
  unreadText: {
    color: Colors.info,
    fontWeight: '700',
    fontSize: 13,
  },
});

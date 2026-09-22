import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, Linking, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Colors, Fonts, MaxContentWidth, Spacing } from '../constants/theme';
import { HELPLINE, HELP_EMAIL } from '../data/mockData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import Button from './Button';
import Link from './Link';

/** Static demo metadata shown in the footer (classic gov-portal elements). */
const LAST_UPDATED = '29 Aug 2026';
const VISITOR_COUNT = '14,23,858';

export default function AppFooter() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const columns = width >= 768;

  const quickLinks = [
    { label: t('nav.home'), href: path.home as string },
    { label: t('nav.about'), href: path.about },
    { label: t('nav.howItWorks'), href: path.howItWorks },
    { label: t('nav.centres'), href: path.centres },
    { label: t('nav.notices'), href: path.notices },
  ];

  const serviceLinks = [
    { label: t('nav.slotBooking'), href: path.booking },
    { label: t('nav.trackToken'), href: path.queue },
    { label: t('nav.bookings'), href: path.bookings },
    { label: t('nav.register'), href: path.register },
    { label: t('nav.officialPortal'), href: path.officialLogin },
  ];

  const policyLinks = [
    { label: t('footer.terms'), action: () => Alert.alert(t('footer.terms'), t('footer.termsBody')) },
    { label: t('footer.privacy'), action: () => Alert.alert(t('footer.privacy'), t('footer.privacyBody')) },
    { label: t('footer.accessibility'), action: () => router.push(path.help as never) },
    { label: t('footer.sitemap'), action: () => router.push(path.home as never) },
  ];

  return (
    <View style={styles.footer}>
      {/* Tricolour strip on top of footer */}
      <View style={styles.tricolour}>
        <View style={styles.triSaffron} />
        <View style={styles.triWhite} />
        <View style={styles.triGreen} />
      </View>

      <View style={[styles.inner, { maxWidth: MaxContentWidth }]}>
        <View style={[styles.columns, !columns && styles.columnsStack]}>
          {/* Identity column with emblem plate */}
          <View style={styles.column}>
            <View style={styles.emblemPlate}>
              <Image
                source={require('../assets/emblem.svg')}
                style={styles.emblem}
                contentFit="contain"
                accessibilityLabel="State Emblem of India"
              />
            </View>
            <Text style={[styles.brand, { fontSize: fs(17) }]}>{t('landing.heroTitle')}</Text>
            <Text style={[styles.dept, { fontSize: fs(12) }]}>{t('footer.about')}</Text>
          </View>

          <View style={styles.column}>
            <Text style={[styles.heading, { fontSize: fs(13) }]}>{t('footer.quickLinks')}</Text>
                                    {quickLinks.map((link) => (
              <Link key={String(link.href)} href={link.href} variant="footer" label={link.label} />
            ))}
          </View>

          <View style={styles.column}>
            <Text style={[styles.heading, { fontSize: fs(13) }]}>{t('footer.services')}</Text>
                                    {serviceLinks.map((link) => (
              <Link key={String(link.href)} href={link.href} variant="footer" label={link.label} />
            ))}
          </View>

          <View style={styles.column}>
            <Text style={[styles.heading, { fontSize: fs(13) }]}>{t('footer.policies')}</Text>
                        {policyLinks.map((link) => (
              <Button
                key={link.label}
                variant="link"
                label={link.label}
                onPress={link.action}
                small
              />
            ))}
          </View>

          <View style={styles.column}>
            <Text style={[styles.heading, { fontSize: fs(13) }]}>{t('footer.contact')}</Text>
                        <Link
              href={`tel:${HELPLINE.replace(/[^0-9]/g, '')}`}
              variant="footer"
              onPress={() => Linking.openURL(`tel:${HELPLINE.replace(/[^0-9]/g, '')}`)}
              label={`${t('footer.helpline')}: ${HELPLINE}`}
            />
            <Text style={[styles.body, { fontSize: fs(11) }]}>{t('footer.helplineHours')}</Text>
            <Text style={[styles.body, { fontSize: fs(11) }]}>
              {t('footer.email')}: {HELP_EMAIL}
            </Text>
            <View style={styles.counterBox}>
              <Text style={[styles.counterLabel, { fontSize: fs(10) }]}>{t('footer.visitors')}</Text>
              <Text style={[styles.counterValue, { fontSize: fs(14) }]}>{VISITOR_COUNT}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom bar — ownership statement */}
      <View style={styles.bottomBar}>
        <View style={[styles.bottomInner, { maxWidth: MaxContentWidth }]}>
          <Text style={[styles.ownedText, { fontSize: fs(11) }]}>{t('footer.ownedBy')}</Text>
          <View style={styles.bottomRow}>
            <Text style={[styles.bottomText, { fontSize: fs(11) }]}>
              {t('footer.lastUpdated')}: {LAST_UPDATED}
            </Text>
            <Text style={[styles.bottomText, { fontSize: fs(11) }]}>{t('footer.version')}</Text>
          </View>
          <Text style={[styles.bottomText, { fontSize: fs(10) }]}>
            {t('footer.rights')} · {t('footer.mockDisclaimer')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: Colors.primaryDark,
  },
  tricolour: {
    height: 4,
    flexDirection: 'row',
  },
  triSaffron: {
    flex: 1,
    backgroundColor: '#FF9933',
  },
  triWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  triGreen: {
    flex: 1,
    backgroundColor: '#138808',
  },
  inner: {
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: Spacing.xl,
  },
  columns: {
    flexDirection: 'row',
    gap: Spacing.xl,
    flexWrap: 'wrap',
  },
  columnsStack: {
    flexDirection: 'column',
    gap: Spacing.lg,
  },
  column: {
    minWidth: 170,
    flex: 1,
  },
  emblemPlate: {
    backgroundColor: Colors.white,
    padding: 6,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  emblem: {
    width: 30,
    height: 40,
  },
  brand: {
    color: Colors.white,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    fontFamily: Fonts.extraBold,
  },
  dept: {
    color: Colors.saffronLight,
    lineHeight: 18,
    fontWeight: '600',
  },
  heading: {
    color: Colors.saffronLight,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    letterSpacing: 0.6,
    fontFamily: Fonts.bold,
  },
  body: {
    color: Colors.textOnDark,
    lineHeight: 17,
    marginBottom: Spacing.xs,
  },
  link: {
    color: Colors.white,
    fontWeight: '600',
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  counterBox: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  counterLabel: {
    color: Colors.textOnDark,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  counterValue: {
    color: Colors.white,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    backgroundColor: Colors.primary,
  },
  bottomInner: {
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: Spacing.md,
    gap: 4,
  },
  ownedText: {
    color: Colors.saffronLight,
    fontWeight: '700',
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
    alignItems: 'center',
  },
  bottomText: {
    color: Colors.textOnDark,
  },
  bottomLink: {
    color: Colors.white,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

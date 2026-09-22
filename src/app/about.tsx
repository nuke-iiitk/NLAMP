import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import InfoCard from '../components/InfoCard';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import { Colors, Radius, Spacing } from '../constants/theme';
import { analyticsSummary, procurementCentres } from '../data/mockData';
import { useI18n } from '../i18n';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

const FEATURES = [
  { icon: APP_ICONS.personAdd, key: 'about.f1' as const },
  { icon: APP_ICONS.calendar, key: 'about.f2' as const },
  { icon: APP_ICONS.pulse, key: 'about.f3' as const },
  { icon: APP_ICONS.time, key: 'about.f4' as const },
  { icon: APP_ICONS.notifications, key: 'about.f5' as const },
  { icon: APP_ICONS.desktop, key: 'about.f6' as const },
];

const APPROACH = [
  { icon: APP_ICONS.eye, title: 'about.a1t' as const, body: 'about.a1d' as const, accent: Colors.primary, bg: Colors.primaryLight },
  { icon: APP_ICONS.phonePortrait, title: 'about.a2t' as const, body: 'about.a2d' as const, accent: Colors.saffron, bg: Colors.saffronLight },
  { icon: APP_ICONS.language, title: 'about.a3t' as const, body: 'about.a3d' as const, accent: Colors.green, bg: Colors.greenLight },
];

export default function AboutScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  const stats = [
    { icon: APP_ICONS.business, value: String(procurementCentres.length), label: t('about.statCentres') },
    { icon: APP_ICONS.people, value: String(analyticsSummary.farmersProcessed), label: t('about.statFarmers') },
    { icon: APP_ICONS.map, value: '3', label: t('about.statStates') },
    { icon: APP_ICONS.language, value: '3', label: t('about.statLangs') },
  ];

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.about') }]}>
      {/* Intro + mission */}
      <View style={[styles.grid, wide && styles.gridRow]}>
        <View style={styles.col}>
          <InfoCard accent={Colors.saffron}>
            <Text style={[styles.eyebrow, { fontSize: fs(11) }]}>{t('about.heroTag')}</Text>
            <Text style={[styles.paragraph, { fontSize: fs(15) }]}>{t('about.p1')}</Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { fontSize: fs(15) }]}>{t('about.p2')}</Text>
          </InfoCard>
        </View>
        <View style={styles.col}>
          <InfoCard title={t('about.mission')} accent={Colors.green}>
            <View style={styles.missionRow}>
              <AppIcon name={APP_ICONS.flag} size={20} color={Colors.green} />
              <Text style={[styles.mission, { fontSize: fs(15) }]}>{t('about.missionBody')}</Text>
            </View>
          </InfoCard>
        </View>
      </View>

      {/* Impact band */}
      <View style={[styles.statBand, { marginTop: Spacing.lg }]}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <AppIcon name={s.icon} size={18} color={Colors.primary} />
            <Text style={[styles.statValue, { fontSize: fs(20) }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { fontSize: fs(11) }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Approach */}
      <SectionHeading title={t('about.approach')} />
      <View style={[styles.cardWrap, wide && styles.cardWrapWide]}>
        {APPROACH.map((a) => (
          <View key={a.title} style={[styles.approachCard, wide && styles.approachCardWide]}>
            <View style={[styles.approachIcon, { backgroundColor: a.bg }]}>
              <AppIcon name={a.icon} size={20} color={a.accent} />
            </View>
            <Text style={[styles.approachTitle, { fontSize: fs(15) }]}>{t(a.title)}</Text>
            <Text style={[styles.approachBody, { fontSize: fs(13) }]}>{t(a.body)}</Text>
          </View>
        ))}
      </View>

      {/* Features */}
      <SectionHeading title={t('about.features')} />
      <View style={[styles.featureWrap, wide && styles.featureWrapWide]}>
        {FEATURES.map((feature) => (
          <View key={feature.key} style={[styles.featureRow, wide && styles.featureRowWide]}>
            <View style={styles.featureIcon}>
              <AppIcon name={feature.icon} size={18} color={Colors.primary} />
            </View>
            <Text style={[styles.featureText, { fontSize: fs(14) }]}>{t(feature.key)}</Text>
          </View>
        ))}
      </View>

      {/* Governance alignment */}
      <View style={styles.govBox}>
        <View style={styles.govIcon}>
          <AppIcon name={APP_ICONS.shieldCheckmark} size={20} color={Colors.white} />
        </View>
        <View style={styles.govCopy}>
          <Text style={[styles.govTitle, { fontSize: fs(14) }]}>{t('about.govTitle')}</Text>
          <Text style={[styles.govBody, { fontSize: fs(13) }]}>{t('about.govBody')}</Text>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <AppIcon name={APP_ICONS.infoCircle} size={16} color={Colors.warning} />
        <Text style={[styles.disclaimerText, { fontSize: fs(12) }]}>{t('about.disclaimer')}</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
  },
  col: {
    flex: 1,
  },
  eyebrow: {
    color: Colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  spacer: {
    height: Spacing.md,
  },
  missionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  mission: {
    flex: 1,
    color: Colors.text,
    lineHeight: 24,
    fontWeight: '600',
  },
  statBand: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 140,
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  statValue: {
    color: Colors.primary,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  cardWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  cardWrapWide: {
    flexDirection: 'row',
  },
  approachCard: {
    flexBasis: '100%',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  approachCardWide: {
    flexBasis: '31.5%',
  },
  approachIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approachTitle: {
    color: Colors.text,
    fontWeight: '700',
  },
  approachBody: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  featureWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  featureWrapWide: {
    flexDirection: 'row',
  },
  featureRow: {
    flexBasis: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  featureRowWide: {
    flexBasis: '48%',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  govBox: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  govIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  govCopy: {
    flex: 1,
  },
  govTitle: {
    color: Colors.white,
    fontWeight: '700',
    marginBottom: 4,
  },
  govBody: {
    color: '#dbe7ff',
    lineHeight: 20,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warningLight,
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  disclaimerText: {
    color: Colors.warning,
    flex: 1,
    lineHeight: 18,
  },
});

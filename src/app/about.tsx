import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import Button from '../components/Button';
import InfoCard from '../components/InfoCard';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';
import { path } from '../navigation';

/**
 * "About the Portal" — formal, information-led description of the service.
 * Structured public-documentation sections rather than a marketing page:
 * purpose, eligibility, services, process, centre operations, support,
 * and an explicit prototype disclaimer.
 */
export default function AboutScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  const services = ['about.f1', 'about.f2', 'about.f3', 'about.f4', 'about.f5', 'about.f6'] as const;

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.about') }]}>
      <Text style={[styles.lede, { fontSize: fs(15) }]}>{t('about.p1')}</Text>
      <Text style={[styles.body, { fontSize: fs(15) }]}>{t('about.p2')}</Text>

      {/* Purpose */}
      <SectionHeading title={t('about.purposeTitle')} />
      <InfoCard>
        <Text style={[styles.body, { fontSize: fs(14) }]}>{t('about.missionBody')}</Text>
      </InfoCard>

      {/* Who can use it */}
      <SectionHeading title={t('about.whoTitle')} />
      <View style={styles.listCard}>
        <Text style={[styles.listItem, { fontSize: fs(14) }]}>• {t('about.who1')}</Text>
        <Text style={[styles.listItem, { fontSize: fs(14) }]}>• {t('about.who2')}</Text>
        <Text style={[styles.listItem, { fontSize: fs(14) }]}>• {t('about.who3')}</Text>
      </View>

      {/* Services offered */}
      <SectionHeading title={t('about.servicesTitle')} />
      <View style={styles.listCard}>
        {services.map((key) => (
          <Text key={key} style={[styles.listItem, { fontSize: fs(14) }]}>
            • {t(key)}
          </Text>
        ))}
      </View>

      {/* Booking and token process */}
      <SectionHeading title={t('about.processTitle')} />
      <View style={[styles.stepGrid, wide && styles.stepGridRow]}>
        {(['about.step1', 'about.step2', 'about.step3', 'about.step4'] as const).map((key, i) => (
          <View key={key} style={[styles.stepCard, wide && styles.stepCardWide]}>
            <Text style={[styles.stepNum, { fontSize: fs(13) }]}>{i + 1}</Text>
            <Text style={[styles.stepText, { fontSize: fs(13) }]}>{t(key)}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.note, { fontSize: fs(13) }]}>{t('about.processNote')}</Text>

      {/* Centre operations */}
      <SectionHeading title={t('about.centresTitle')} />
      <InfoCard>
        <Text style={[styles.body, { fontSize: fs(14) }]}>{t('about.centresBody')}</Text>
      </InfoCard>

      {/* Support and grievance redressal */}
      <SectionHeading title={t('about.supportTitle')} />
      <InfoCard>
        <Text style={[styles.body, { fontSize: fs(14) }]}>{t('about.supportBody')}</Text>
        <View style={styles.supportActions}>
          <Button
            label={t('nav.help')}
            variant="outline-primary"
            small
            href={path.help}
          />
        </View>
      </InfoCard>

      {/* Prototype disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={[styles.disclaimerTitle, { fontSize: fs(13) }]}>
          {t('about.prototypeTitle')}
        </Text>
        <Text style={[styles.disclaimerText, { fontSize: fs(12) }]}>{t('about.prototypeBody')}</Text>
        <Text style={[styles.disclaimerText, { fontSize: fs(12) }]}>{t('about.disclaimer')}</Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  lede: {
    color: Colors.text,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  body: {
    color: Colors.textSecondary,
    lineHeight: 23,
    marginBottom: Spacing.md,
  },
  listCard: {
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  listItem: {
    color: Colors.text,
    lineHeight: 22,
  },
  stepGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepGridRow: {
    flexDirection: 'row',
  },
  stepCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  stepCardWide: {
    flexBasis: '48%',
    flex: 0,
    flexGrow: 1,
  },
  stepNum: {
    minWidth: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    color: Colors.primaryDark,
    fontWeight: '800',
    borderRadius: 13,
    overflow: 'hidden',
    textAlign: 'center',
  },
  stepText: {
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  note: {
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  supportActions: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  disclaimer: {
    backgroundColor: Colors.warningLight,
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
  },
  disclaimerTitle: {
    color: Colors.warning,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  disclaimerText: {
    color: Colors.warning,
    flex: 1,
    lineHeight: 18,
  },
});

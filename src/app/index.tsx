import { router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import Button from '../components/Button';
import { AppIcon, APP_ICONS } from '../components/AppIcon';
import InfoCard from '../components/InfoCard';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import { Colors, Spacing } from '../constants/theme';
import { analyticsSummary } from '../data/mockData';
import { PORTAL_NOTICES } from '../data/notices';
import { useI18n } from '../i18n';
import { path } from '../navigation';

export default function HomeScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  return (
    <ScreenShell>
      {/* Important Announcement / Notice Strip */}\
      <View style={styles.noticeStrip}>
        <View style={styles.noticeIcon}>
          <AppIcon name={APP_ICONS.megaphone} size={12} color={Colors.white} />
          <Text style={styles.noticeIconText}>{t('landing.newTag').toUpperCase()}</Text>
        </View>
        <Text style={[styles.noticeText, { fontSize: fs(13) }]}>
          {t('landing.noticeStrip')}
        </Text>
      </View>

      {/* Main Hero Section */}\
      <View style={[styles.heroBlock, wide && styles.heroRow]}>
        <View style={styles.heroLeft}>
          <View style={styles.heroTitleLines}>
            <Text style={[styles.portalTitle, { fontSize: fs(30) }]}>{t('landing.heroTitle1')}</Text>
            <Text style={[styles.portalTitle, { fontSize: fs(30) }]}>{t('landing.heroTitle2')}</Text>
            <Text style={[styles.portalTitle, { fontSize: fs(30) }]}>{t('landing.heroTitle3')}</Text>
          </View>

          <Text style={[styles.portalDesc, { fontSize: fs(14) }]}>{t('landing.heroDesc')}</Text>

          <View style={styles.heroButtons}>
            <Button label={t('landing.ctaBook')} onPress={() => router.push(path.booking)} />
            <Button
              label={t('landing.ctaTrack')}
              variant="secondary"
              onPress={() => router.push(path.queue)}
            />
          </View>
        </View>

        <View style={styles.heroRight}>
          <InfoCard title={t('landing.cycleTitle')}>
            <View style={styles.statusRow}>
              <View style={styles.statusRowLeft}>
                <AppIcon name={APP_ICONS.checkmarkCircle} size={15} color={Colors.green} />
                <Text style={[styles.statusLabel, { fontSize: fs(11) }]}>{t('landing.statusLabel')}</Text>
              </View>
              <Text style={[styles.statusValue, { fontSize: fs(14), color: Colors.green }]}>
                {t('landing.statusActive')}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statusRow}>
              <View style={styles.statusRowLeft}>
                <AppIcon name={APP_ICONS.people} size={15} color={Colors.primary} />
                <Text style={[styles.statusLabel, { fontSize: fs(11) }]}>{t('landing.farmersServed')}</Text>
              </View>
              <Text style={[styles.statusValue, { fontSize: fs(14) }]}>{analyticsSummary.farmersProcessed}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statusRow}>
              <View style={styles.statusRowLeft}>
                                <AppIcon name={APP_ICONS.pieChart} size={15} color={Colors.saffronDark} />
                <Text style={[styles.statusLabel, { fontSize: fs(11) }]}>{t('landing.capacityUse')}</Text>
              </View>
              <Text style={[styles.statusValue, { fontSize: fs(14) }]}>{analyticsSummary.capacityUsedPercent}%</Text>
            </View>
          </InfoCard>
        </View>
      </View>

      {/* Services and Notices Grid */}\
      <View style={[styles.mainGrid, wide && styles.mainGridRow]}>
        {/* Left Column: Services & Process */}\
        <View style={styles.mainCol}>
          <SectionHeading title={t('landing.servicesTitle')} />
          {[{
            title: t('nav.register'),
            desc: t('landing.step1Body'),
            href: path.register,
          }, {
            title: t('nav.booking'),
            desc: t('landing.step3Body'),
            href: path.booking,
          }, {
            title: t('nav.queue'),
            desc: t('landing.step5Body'),
            href: path.queue,
          }, {
            title: t('nav.centres'),
            desc: t('landing.centresDesc'),
            href: path.centres,
          }].map((srv) => (
            <Button
              key={srv.title}
              label={srv.title}
              href={srv.href}
              variant="link"
              after={<AppIcon name={APP_ICONS.chevronForward} size={14} color={Colors.primary} />}
            />
          ))}

          <View style={{ marginTop: Spacing.xl }}>
            <SectionHeading title={t('landing.stepsTitle')} subtitle={t('landing.stepsSub')} />
            <InfoCard>
              {[{
                step: 1,
                label: t('landing.step1'),
                icon: APP_ICONS.personAdd,
              }, {
                step: 2,
                label: t('landing.step2'),
                icon: APP_ICONS.location,
              }, {
                step: 3,
                label: t('landing.step3'),
                icon: APP_ICONS.calendar,
              }, {
                step: 4,
                label: t('landing.step4'),
                icon: APP_ICONS.ticket,
              }, {
                step: 5,
                label: t('landing.step5'),
                icon: APP_ICONS.speedometer,
              }, {
                step: 6,
                label: t('landing.step6'),
                icon: APP_ICONS.checkmarkDone,
              }].map((item) => (
                <View key={item.step} style={styles.processRow}>
                  <View style={styles.processNum}>
                    <Text style={styles.processNumText}>{item.step}</Text>
                  </View>
                  <AppIcon name={item.icon} size={16} color={Colors.primary} />
                  <Text style={[styles.processLabel, { fontSize: fs(13) }]}>{item.label}</Text>
                </View>
              ))}
            </InfoCard>
          </View>
        </View>

        {/* Right Column: Notices */}\
        <View style={styles.sideCol}>
          <SectionHeading title={t('notice.title')} />
          <InfoCard>
            <View style={styles.noticeBoardHeader}>
              <Text style={[styles.nbHeaderText, { fontSize: fs(11) }]}>{t('notice.subject')}</Text>
              <Text style={[styles.nbHeaderText, { fontSize: fs(11), width: 80, textAlign: 'right' }]}>
                {t('notice.date')}
              </Text>
            </View>
            {PORTAL_NOTICES.slice(0, 5).map((n) => (
              <View key={n.title} style={styles.noticeItem}>
                <AppIcon name={APP_ICONS.documentText} size={15} color={Colors.info} style={styles.noticeItemIcon} />
                <View style={styles.noticeCopy}>
                  <Text style={[styles.noticeItemTitle, { fontSize: fs(13) }]}>{n.title}</Text>
                </View>
                <Text style={[styles.noticeItemDate, { fontSize: fs(11), width: 80, textAlign: 'right' }]}>
                  {n.date}
                </Text>
              </View>
            ))}
            <Button
              label={t('common.viewAll')}
              href={path.notices}
              variant="link"
              small
            />
          </InfoCard>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  noticeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.saffronLight,
    borderWidth: 1,
    borderColor: Colors.saffron,
    padding: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  noticeIcon: {
    backgroundColor: Colors.saffronDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 4,
  },
  noticeIconText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  noticeText: {
    color: Colors.saffronDark,
    fontWeight: '700',
    flex: 1,
  },
  heroBlock: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xl,
  },
  heroLeft: {
    flex: 1,
  },
  portalTitle: {
    color: Colors.primaryDark,
    fontWeight: '400',
    textAlign: 'left',
    letterSpacing: 0.3,
  },
  heroTitleLines: {
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  portalDesc: {
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.xl,
    maxWidth: 600,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  heroRight: {
    width: '100%',
    maxWidth: 320,
    marginTop: Spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    color: Colors.textMuted,
    fontWeight: '700',
  },
  statusValue: {
    color: Colors.text,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  mainGrid: {
    gap: Spacing.xl,
  },
  mainGridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainCol: {
    flex: 2,
  },
  sideCol: {
    flex: 1,
  },
  processRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
  },
  processNum: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processNumText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  processLabel: {
    color: Colors.text,
    fontWeight: '500',
  },
  noticeBoardHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryDark,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  nbHeaderText: {
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  noticeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  noticeItemIcon: {
    width: 24,
  },
  noticeCopy: {
    flex: 1,
  },
  noticeItemTitle: {
    color: Colors.info,
    fontWeight: '600',
    lineHeight: 20,
  },
  noticeItemDate: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});

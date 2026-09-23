import { router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import Button from '../components/Button';
import { AppIcon, APP_ICONS } from '../components/AppIcon';
import InfoCard from '../components/InfoCard';
import NoticesBoard from '../components/NoticesBoard';
import ProcessSteps from '../components/ProcessSteps';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import ServicesList from '../components/ServicesList';
import { Colors, Spacing } from '../constants/theme';
import { analyticsSummary } from '../data/mockData';
import { PORTAL_NOTICES } from '../data/notices';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { useStore } from '../store/AppStore';

export default function HomeScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  /** 16:9 desktop: three balanced columns (services / steps / notices). */
  const desktop = width >= 1024;

  // ---- auth-aware hero state ----
  const { auth, farmer, activeBookingFor, queueSnapshot } = useStore();
  const activeBooking = farmer ? activeBookingFor(farmer.id) : undefined;
  const snapshot = activeBooking
    ? queueSnapshot(activeBooking.centreId, activeBooking.token)
    : undefined;
  const isFarmer = auth.role === 'farmer' && !!farmer;
  const isGuest = !isFarmer;
  const hasActiveBooking = isFarmer && !!activeBooking;

  /** Booking-process steps — shared between the stacked (mobile/tablet) and
      three-column (16:9 desktop) home layouts. */
  const stepsBlock = (
    <>
      <SectionHeading title={t('landing.stepsTitle')} subtitle={t('landing.stepsSub')} />
      <ProcessSteps
        steps={[{
          step: 1,
          label: t('landing.step1'),
          body: t('landing.step1Body'),
        }, {
          step: 2,
          label: t('landing.step2'),
          body: t('landing.step2Body'),
        }, {
          step: 3,
          label: t('landing.step3'),
          body: t('landing.step3Body'),
        }, {
          step: 4,
          label: t('landing.step4'),
          body: t('landing.step4Body'),
        }, {
          step: 5,
          label: t('landing.step5'),
          body: t('landing.step5Body'),
        }, {
          step: 6,
          label: t('landing.step6'),
          body: t('landing.step6Body'),
        }]}
      />
    </>
  );

  return (
    <ScreenShell>
      {/* Important Announcement / Notice Strip */}
      <View style={styles.noticeStrip}>
        <View style={styles.noticeIcon}>
          <AppIcon name={APP_ICONS.megaphone} size={12} color={Colors.white} />
          <Text style={styles.noticeIconText}>{t('landing.newTag').toUpperCase()}</Text>
        </View>
        <Text style={[styles.noticeText, { fontSize: fs(13) }]}>
          {t('landing.noticeStrip')}
        </Text>
      </View>

      {/* Main Hero Section */}
      <View style={[styles.heroBlock, wide && styles.heroRow]}>
        <View style={styles.heroLeft}>
          <View style={styles.heroTitleLines}>
            <Text style={[styles.portalTitle, { fontSize: fs(desktop ? 34 : 30) }]}>{t('landing.heroTitle1')}</Text>
            <Text style={[styles.portalTitle, { fontSize: fs(desktop ? 34 : 30) }]}>{t('landing.heroTitle2')}</Text>
            <Text style={[styles.portalTitle, { fontSize: fs(desktop ? 34 : 30) }]}>{t('landing.heroTitle3')}</Text>
          </View>

          <Text style={[styles.portalDesc, { fontSize: fs(desktop ? 15 : 14) }]}>{t('landing.heroDesc')}</Text>

          <View style={styles.heroButtons}>
            <Button
              label={t(isGuest ? 'landing.ctaBookRegister' : 'landing.ctaBook')}
              onPress={() => router.push(isGuest ? path.register : path.booking)}
            />
            {hasActiveBooking ? (
              <Button
                label={t('landing.ctaTrack')}
                variant="secondary"
                onPress={() => router.push(path.queue)}
              />
            ) : (
              <View style={styles.ctaTrackWrap}>
                <Button
                  label={t('landing.ctaTrack')}
                  variant="secondary"
                  disabled
                  accessibilityHint={t('landing.trackNoBooking')}
                />
                <Text style={[styles.trackHint, { fontSize: fs(11) }]}>
                  {t('landing.trackNoBooking')}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.heroRight}>
          {hasActiveBooking && activeBooking && snapshot ? (
            /* Logged-in farmer with an active booking: live personal status */
            <>
              <InfoCard title={t('landing.yourStatus')}>
                <View style={styles.statusRow}>
                  <View style={styles.statusRowLeft}>
                    <AppIcon name={APP_ICONS.ticket} size={15} color={Colors.primary} />
                    <Text style={[styles.statusLabel, { fontSize: fs(11) }]}>{t('queue.yourToken')}</Text>
                  </View>
                  <Text style={[styles.statusValue, { fontSize: fs(14) }]}>{activeBooking.token}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statusRow}>
                  <View style={styles.statusRowLeft}>
                    <AppIcon name={APP_ICONS.people} size={15} color={Colors.primary} />
                    <Text style={[styles.statusLabel, { fontSize: fs(11) }]}>{t('queue.ahead')}</Text>
                  </View>
                  <Text style={[styles.statusValue, { fontSize: fs(14) }]}>
                    {t('queue.aheadValue', { n: snapshot.farmersAhead })}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statusRow}>
                  <View style={styles.statusRowLeft}>
                    <AppIcon name={APP_ICONS.time} size={15} color={Colors.primary} />
                    <Text style={[styles.statusLabel, { fontSize: fs(11) }]}>{t('queue.estWait')}</Text>
                  </View>
                  <Text style={[styles.statusValue, { fontSize: fs(14) }]}>
                    ~{snapshot.estimatedWaitMinutes}
                  </Text>
                </View>
              </InfoCard>
              <Button
                label={t('landing.viewQueueCta')}
                onPress={() => router.push(path.queue)}
              />
            </>
          ) : (
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
          )}
        </View>
      </View>

      {/* Services and Notices Grid */}
      <View style={[styles.mainGrid, wide && styles.mainGridRow]}>
        {/* Services column (own column on 16:9 desktop) */}
        <View style={[styles.mainCol, desktop && styles.desktopCol]}>
          <SectionHeading title={t('landing.servicesTitle')} />
          <ServicesList
            items={[{
              title: t('nav.register'),
              desc: t('landing.step1Body'),
              href: path.register,
              icon: APP_ICONS.personAdd,
            }, {
              title: t('nav.booking'),
              desc: t('landing.step3Body'),
              href: path.booking,
              icon: APP_ICONS.calendar,
            }, {
              title: t('nav.queue'),
              desc: t('landing.step5Body'),
              href: path.queue,
              icon: APP_ICONS.speedometer,
            }, {
              title: t('nav.centres'),
              desc: t('landing.centresDesc'),
              href: path.centres,
              icon: APP_ICONS.location,
            }]}
          />
          {/* Below desktop the steps stack under services in the left column */}
          {!desktop ? <View style={styles.stepsStack}>{stepsBlock}</View> : null}
        </View>

        {/* Process steps column — own column on 16:9 desktop only */}
        {desktop ? <View style={styles.desktopCol}>{stepsBlock}</View> : null}

        {/* Right Column: Notices */}
        <View style={styles.sideCol}>
          <SectionHeading title={t('notice.title')} />
          <NoticesBoard
            notices={PORTAL_NOTICES.slice(0, 5)}
            subjectLabel={t('notice.subject')}
            dateLabel={t('notice.date')}
            viewAllLabel={t('common.viewAll')}
            viewAllHref={path.notices}
          />
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
  ctaTrackWrap: {
    flexDirection: 'column',
  },
  trackHint: {
    color: Colors.textMuted,
    marginTop: 4,
    maxWidth: 260,
  },
  heroRight: {
    width: '100%',
    maxWidth: 380,
    marginTop: Spacing.lg,
    minWidth: 280,
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
  /** 16:9 desktop — three equal columns (services / steps / notices). */
  desktopCol: {
    flex: 1,
    minWidth: 0,
  },
  /** Steps stacked under services below desktop. */
  stepsStack: {
    marginTop: Spacing.xl,
  },
});

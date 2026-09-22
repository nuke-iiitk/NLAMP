import { router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import Button from '../components/Button';
import { AppIcon, APP_ICONS } from '../components/AppIcon';
import NoticesBoard from '../components/NoticesBoard';
import ProcessSteps from '../components/ProcessSteps';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import ServicesList from '../components/ServicesList';
import { Colors, Radius, Spacing } from '../constants/theme';
import { analyticsSummary } from '../data/mockData';
import { PORTAL_NOTICES } from '../data/notices';
import { useI18n } from '../i18n';
import { path } from '../navigation';

export default function HomeScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  /** 16:9 desktop: three balanced columns (services / steps / notices). */
  const desktop = width >= 1024;

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

      {/* Main Hero — composed field illustration panel, not a boxed card */}
      <View style={[styles.heroBlock, wide && styles.heroRow]}>
        {/* Abstract paddy-field backdrop: contour arcs + seed dots, CSS-free */}
        <View style={styles.fieldBackdrop} pointerEvents="none">
          <View style={[styles.contour, styles.contour1]} />
          <View style={[styles.contour, styles.contour2]} />
          <View style={[styles.contour, styles.contour3]} />
          <View style={styles.seedRow}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} style={[styles.seed, i % 2 === 0 && styles.seedAlt]} />
            ))}
          </View>
        </View>

        <View style={styles.heroLeft}>
          <View style={styles.heroEyebrowRow}>
            <View style={styles.heroEyebrowTick} />
            <Text style={[styles.heroEyebrow, { fontSize: fs(11) }]}>
              {t('common.gov').toUpperCase()}
            </Text>
          </View>
          <View style={styles.heroTitleLines}>
            <Text style={[styles.portalTitle, { fontSize: fs(desktop ? 36 : 31) }]}>{t('landing.heroTitle1')}</Text>
            <Text style={[styles.portalTitleAccent, { fontSize: fs(desktop ? 36 : 31) }]}>{t('landing.heroTitle2')}</Text>
            <Text style={[styles.portalTitle, { fontSize: fs(desktop ? 36 : 31) }]}>{t('landing.heroTitle3')}</Text>
          </View>

          <Text style={[styles.portalDesc, { fontSize: fs(desktop ? 15 : 14) }]}>{t('landing.heroDesc')}</Text>

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
          <View style={styles.statusPanel}>
            <View style={styles.statusPanelHead}>
              <View style={styles.liveDot} />
              <Text style={[styles.statusPanelTitle, { fontSize: fs(12) }]}>{t('landing.cycleTitle')}</Text>
            </View>
            <View style={styles.statusPanelBody}>
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { fontSize: fs(12) }]}>{t('landing.statusLabel')}</Text>
                <View style={styles.statusPill}>
                  <View style={styles.statusPillDot} />
                  <Text style={[styles.statusPillText, { fontSize: fs(12) }]}>{t('landing.statusActive')}</Text>
                </View>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { fontSize: fs(12) }]}>{t('landing.farmersServed')}</Text>
                <Text style={[styles.statusValue, { fontSize: fs(18) }]}>{analyticsSummary.farmersProcessed}</Text>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { fontSize: fs(12) }]}>{t('landing.capacityUse')}</Text>
                <Text style={[styles.statusValue, { fontSize: fs(18) }]}>{analyticsSummary.capacityUsedPercent}%</Text>
              </View>
              <View style={styles.capacityTrack}>
                <View style={[styles.capacityFill, { width: `${analyticsSummary.capacityUsedPercent}%` }]} />
              </View>
            </View>
          </View>
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
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  noticeIcon: {
    backgroundColor: Colors.saffronDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
  },
  noticeIconText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  noticeText: {
    color: Colors.saffronDark,
    fontWeight: '600',
    flex: 1,
  },
  /* ---- Hero: open panel on cream, contoured field motif behind ---- */
  heroBlock: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    shadowColor: '#3d2f10',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  fieldBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.55,
  },
  /** Contour arcs — abstract paddy terraces, bottom of the hero. */
  contour: {
    position: 'absolute',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.greenLight,
    backgroundColor: 'transparent',
  },
  contour1: {
    width: 620,
    height: 620,
    left: -140,
    bottom: -420,
  },
  contour2: {
    width: 460,
    height: 460,
    left: -60,
    bottom: -320,
    borderColor: Colors.surfaceAlt,
  },
  contour3: {
    width: 320,
    height: 320,
    left: 10,
    bottom: -220,
    borderColor: Colors.saffronLight,
  },
  seedRow: {
    position: 'absolute',
    right: 24,
    top: 24,
    flexDirection: 'row',
    gap: 10,
  },
  seed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.greenLight,
  },
  seedAlt: {
    backgroundColor: Colors.saffronLight,
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
  heroEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  heroEyebrowTick: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.green,
  },
  heroEyebrow: {
    color: Colors.greenDark,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  portalTitle: {
    color: Colors.primaryDeep,
    fontWeight: '800',
    textAlign: 'left',
    letterSpacing: 0,
  },
  /** Middle hero line in leaf green — the growth line. */
  portalTitleAccent: {
    color: Colors.greenDark,
    fontWeight: '800',
    textAlign: 'left',
    letterSpacing: 0,
  },
  heroTitleLines: {
    alignItems: 'flex-start',
    gap: 2,
    marginBottom: Spacing.md,
  },
  portalDesc: {
    color: Colors.textSecondary,
    lineHeight: 23,
    marginBottom: Spacing.xl,
    maxWidth: 540,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  heroRight: {
    width: '100%',
    maxWidth: 360,
    marginTop: Spacing.lg,
    minWidth: 280,
  },
  /* ---- Season status panel: instrument, not a random box ---- */
  statusPanel: {
    backgroundColor: Colors.primaryDeep,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    paddingBottom: Spacing.md,
  },
  statusPanelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.saffron,
  },
  statusPanelTitle: {
    color: Colors.textOnDark,
    fontWeight: '700',
    letterSpacing: 0.6,
    flexShrink: 1,
  },
  statusPanelBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusLabel: {
    color: Colors.textOnDark,
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(46,125,79,0.35)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7fd1a1',
  },
  statusPillText: {
    color: '#bfe8cf',
    fontWeight: '800',
  },
  statusValue: {
    color: Colors.white,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statusDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  capacityTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.saffron,
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

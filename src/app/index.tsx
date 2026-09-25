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
import { usePortalNotices } from '../hooks/usePortalNotices';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { ALL_PROJECTS } from '../data/landAcquisitionData';

export default function HomeScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const desktop = width >= 1024;

  const portalNotices = usePortalNotices(5);
  const leadProject = ALL_PROJECTS[0];

  const stepsBlock = (
    <>
      <SectionHeading title={t('landing.stepsTitle')} subtitle={t('landing.stepsSub')} />
      <ProcessSteps
        steps={[
          {
            step: 1,
            label: t('landing.step1'),
            body: t('landing.step1Body'),
          },
          {
            step: 2,
            label: t('landing.step2'),
            body: t('landing.step2Body'),
          },
          {
            step: 3,
            label: t('landing.step3'),
            body: t('landing.step3Body'),
          },
          {
            step: 4,
            label: t('landing.step4'),
            body: t('landing.step4Body'),
          },
          {
            step: 5,
            label: t('landing.step5'),
            body: t('landing.step5Body'),
          },
          {
            step: 6,
            label: t('landing.step6'),
            body: t('landing.step6Body'),
          },
        ]}
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
            <Text style={[styles.portalTitle, { fontSize: fs(desktop ? 34 : 30) }]}>
              {t('landing.heroTitle1')}
            </Text>
            <Text style={[styles.portalTitle, { fontSize: fs(desktop ? 34 : 30) }]}>
              {t('landing.heroTitle2')}
            </Text>
            <Text style={[styles.portalTitle, { fontSize: fs(desktop ? 34 : 30) }]}>
              {t('landing.heroTitle3')}
            </Text>
          </View>

          <Text style={[styles.portalDesc, { fontSize: fs(desktop ? 15 : 14) }]}>
            {t('landing.heroDesc')}
          </Text>

          <View style={styles.heroButtons}>
            <Button
              label="National Dashboard"
              onPress={() => router.push(path.dashboard as never)}
            />
            <Button
              label={t('landing.ctaTrack')}
              variant="secondary"
              onPress={() => router.push(path.gis as never)}
            />
            <Button
              label="Submit Land Proposal"
              variant="outline-primary"
              onPress={() => router.push(path.proposal as never)}
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
                {leadProject.currentStage} Stage
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statusRow}>
              <View style={styles.statusRowLeft}>
                <AppIcon name={APP_ICONS.business} size={15} color={Colors.primary} />
                <Text style={[styles.statusLabel, { fontSize: fs(11) }]}>Lead Corridor</Text>
              </View>
              <Text style={[styles.statusValue, { fontSize: fs(13) }]} numberOfLines={1}>
                {leadProject.code}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statusRow}>
              <View style={styles.statusRowLeft}>
                <AppIcon name={APP_ICONS.people} size={15} color={Colors.primary} />
                <Text style={[styles.statusLabel, { fontSize: fs(11) }]}>{t('landing.farmersServed')}</Text>
              </View>
              <Text style={[styles.statusValue, { fontSize: fs(14) }]}>
                {leadProject.affectedFamilies}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statusRow}>
              <View style={styles.statusRowLeft}>
                <AppIcon name={APP_ICONS.pieChart} size={15} color={Colors.saffronDark} />
                <Text style={[styles.statusLabel, { fontSize: fs(11) }]}>Land Acquired</Text>
              </View>
              <Text style={[styles.statusValue, { fontSize: fs(14) }]}>
                {leadProject.landAcquiredHa} / {leadProject.landProposedHa} ha ({leadProject.possessionPercent}%)
              </Text>
            </View>
          </InfoCard>
          <Button
            label="Open Corridor in GIS Map"
            onPress={() => router.push(path.gis as never)}
          />
        </View>
      </View>

      {/* Services and Notices Grid */}
      <View style={[styles.mainGrid, wide && styles.mainGridRow]}>
        {/* Services column (own column on 16:9 desktop) */}
        <View style={[styles.mainCol, desktop && styles.desktopCol]}>
          <SectionHeading title={t('landing.servicesTitle')} />
          <ServicesList
            items={[
              {
                title: 'National Dashboard',
                desc: 'Real-time KPIs, charts and statutory RFCTLARR progress tracking.',
                href: path.dashboard,
                icon: APP_ICONS.speedometer,
              },
              {
                title: 'National Projects Directory',
                desc: 'Corridor search, state filters, agency tracking and stage milestones.',
                href: path.projects,
                icon: APP_ICONS.business,
              },
              {
                title: 'Cadastral Land Parcels',
                desc: 'Survey numbers, area, land titleholders and valuation records.',
                href: path.parcels,
                icon: APP_ICONS.grid,
              },
              {
                title: 'National GIS Spatial Map',
                desc: 'Spatial cadastre viewer, project alignments and possession boundaries.',
                href: path.gis,
                icon: APP_ICONS.map,
              },
              {
                title: 'Acquisition Workflow Engine',
                desc: 'Nine statutory stages from Section 4 SIA to final possession and mutation.',
                href: path.workflow,
                icon: APP_ICONS.pulse,
              },
              {
                title: 'Direct Compensation Audit',
                desc: 'Schedule I valuation, 100% solatium and DBT disbursement tracker.',
                href: path.compensation,
                icon: APP_ICONS.wallet,
              },
            ]}
          />
          {!desktop ? <View style={styles.stepsStack}>{stepsBlock}</View> : null}
        </View>

        {/* Process steps column */}
        {desktop ? <View style={styles.desktopCol}>{stepsBlock}</View> : null}

        {/* Right Column: Notices */}
        <View style={styles.sideCol}>
          <SectionHeading title={t('notice.title')} />
          <NoticesBoard
            notices={portalNotices.notices}
            subjectLabel={t('notice.subject')}
            dateLabel={t('notice.date')}
            viewAllLabel={t('common.viewAll')}
            viewAllHref={path.documents}
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
    fontWeight: '800',
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
    maxWidth: 380,
    marginTop: Spacing.lg,
    minWidth: 280,
    gap: Spacing.sm,
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
  desktopCol: {
    flex: 1,
    minWidth: 0,
  },
  stepsStack: {
    marginTop: Spacing.xl,
  },
});

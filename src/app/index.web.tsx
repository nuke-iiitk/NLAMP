import { APP_ICONS } from '../components/AppIcon';
import BootstrapIcon from '../components/BootstrapIcon';
import Button from '../components/Button';
import NoticesBoard from '../components/NoticesBoard';
import ProcessSteps from '../components/ProcessSteps';
import SectionHeading from '../components/SectionHeading';
import ServicesList from '../components/ServicesList';
import { Colors } from '../constants/theme';
import { analyticsSummary } from '../data/mockData';
import { PORTAL_NOTICES } from '../data/notices';
import { useI18n } from '../i18n';
import { path } from '../navigation';


/** Web home page — Bootstrap grid layout + Bootstrap Icons.
 * Metro resolves this file instead of index.tsx on web, so no React Native
 * View/StyleSheet hierarchy reaches the browser. */
export default function HomeScreenWeb() {
  const { t } = useI18n();

  return (
    <div className="container py-4">
      {/* Gov tagline strip */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span
          className="text-body-secondary small lh-sm"
          style={{ color: '#6c757d', letterSpacing: '0.4px' }}
        >
          {t('landing.badge')}
        </span>
      </div>

      {/* Important announcement strip */}
      <div
        className="d-flex align-items-center justify-content-between gap-2 rounded-2 mb-4 px-3 py-2"
        style={{
          backgroundColor: '#fff3e0',
          border: '1px solid #e65100',
        }}
        role="region"
        aria-label={t('landing.noticeStrip')}
      >
        <span className="d-flex align-items-center gap-2">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded"
            style={{
              backgroundColor: '#e65100',
              color: '#fff',
              padding: '2px 6px',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.5px',
            }}
          >
            {t('landing.newTag').toUpperCase()}
          </span>
        </span>
        <span className="fw-bold" style={{ color: '#e65100', fontSize: 13 }}>
          {t('landing.noticeStrip')}
        </span>
      </div>

      {/* Main hero block */}
      <div
        className="card border-0 shadow-sm mb-4"
        style={{ backgroundColor: '#fff' }}
      >
        <div className="row g-4 align-items-start">
          {/* Hero text */}
          <div className="col">
            <div className="mb-3">
              <span
                className="fs-3 fw-bold lh-sm text-primary d-block"
                style={{ color: '#0a2f6b', letterSpacing: '0.3px' }}
              >
                {t('landing.heroTitle1')}
              </span>
              <span
                className="fs-3 fw-bold lh-sm text-primary d-block"
                style={{ color: '#0a2f6b', letterSpacing: '0.3px', marginTop: 6 }}
              >
                {t('landing.heroTitle2')}
              </span>
              <span
                className="fs-3 fw-bold lh-sm text-primary d-block"
                style={{ color: '#0a2f6b', letterSpacing: '0.3px', marginTop: 6 }}
              >
                {t('landing.heroTitle3')}
              </span>
            </div>
            <p
              className="text-body-secondary mb-4 lh-sm"
              style={{ maxWidth: 600, lineHeight: 22 }}
            >
              {t('landing.heroDesc')}
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <Button label={t('landing.ctaBook')} href={path.booking} />
              <Button label={t('landing.ctaTrack')} variant="secondary" href={path.queue} />
            </div>
          </div>

          {/* Live queue card */}
          <div className="col-auto">
            <div
              className="card bg-primary-subtle border border-primary-subtle mb-3"
              style={{ maxWidth: 320 }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span
                    className="badge bg-primary-subtle text-primary fw-bold"
                    style={{ fontSize: 10, letterSpacing: '0.5px', padding: '2px 6px' }}
                  >
                    {t('landing.heroCardSub')}
                  </span>
                </div>
                <h6 className="fw-bold text-primary mb-1 lh-sm" style={{ color: '#0a2f6b' }}>
                  {t('landing.heroCardTitle')}
                </h6>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-body-secondary lh-sm" style={{ color: '#6c757d' }}>
                    {t('landing.heroNow')}
                  </span>
                  <span className="fw-bold lh-sm" style={{ color: Colors.green, fontSize: 14 }}>
                    #{analyticsSummary.farmersProcessed}
                  </span>
                </div>
                <hr className="my-2 border-primary-subtle" />
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-body-secondary lh-sm" style={{ color: '#6c757d' }}>
                    {t('landing.heroUpNext')}
                  </span>
                  <span className="fw-bold lh-sm" style={{ color: '#e65100', fontSize: 14 }}>
                    #{analyticsSummary.farmersProcessed + 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Track an existing token */}
      <div className="row mb-4">
        <div className="col-lg-5">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ backgroundColor: '#fff' }}
          >
            <div className="card-body d-flex flex-column justify-content-center px-4 py-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <BootstrapIcon name="bi-search" size={18} color={Colors.primary} />
                <span className="fs-5 fw-bold lh-sm text-primary" style={{ color: '#0a2f6b', letterSpacing: '0.3px' }}>
                  {t('landing.trackTitle')}
                </span>
              </div>
              <p className="text-body-secondary mb-4 lh-sm small" style={{ lineHeight: 22 }}>
                {t('landing.trackDesc')}
              </p>
              <Button label={t('landing.trackBtn')} href={path.queue} variant="primary" small />
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="col-lg-7">
          <div
            className="card border-0 shadow-sm h-100"
            style={{ backgroundColor: '#fff' }}
          >
            <div className="card-body px-4 py-4">
              <h6 className="fw-bold text-primary mb-3 lh-sm" style={{ color: '#0a2f6b' }}>
                {t('landing.cycleTitle')}
              </h6>
              <div className="row g-3">
                <div className="col-6">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="d-flex align-items-center gap-2 small lh-sm" style={{ color: '#6c757d', fontWeight: 700 }}>
                      <BootstrapIcon name="bi-people" size={15} color={Colors.primary} />
                      {t('landing.farmersServed')}
                    </span>
                    <span className="fw-bold lh-sm" style={{ color: Colors.text, fontSize: 14 }}>
                      {analyticsSummary.farmersProcessed}
                    </span>
                  </div>
                  <hr className="my-2 border-primary-subtle" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="d-flex align-items-center gap-2 small lh-sm" style={{ color: '#6c757d', fontWeight: 700 }}>
                      <BootstrapIcon name="bi-receipt" size={15} color={Colors.saffronDark} />
                      {t('landing.statsTokens')}
                    </span>
                    <span className="fw-bold lh-sm" style={{ color: Colors.text, fontSize: 14 }}>
                      {analyticsSummary.volumeQuintals} q
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="d-flex align-items-center gap-2 small lh-sm" style={{ color: '#6c757d', fontWeight: 700 }}>
                      <BootstrapIcon name="bi-clock" size={15} color={Colors.saffronDark} />
                      {t('landing.statsAvgWait')}
                    </span>
                    <span className="fw-bold lh-sm" style={{ color: Colors.text, fontSize: 14 }}>
                      {analyticsSummary.avgWaitMinutes} min
                    </span>
                  </div>
                  <hr className="my-2 border-primary-subtle" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="d-flex align-items-center gap-2 small lh-sm" style={{ color: '#6c757d', fontWeight: 700 }}>
                      <BootstrapIcon name="bi-pie-chart" size={15} color={Colors.green} />
                      {t('landing.capacityUse')}
                    </span>
                    <span className="fw-bold lh-sm" style={{ color: Colors.text, fontSize: 14 }}>
                      {analyticsSummary.capacityUsedPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services + Booking process + Notices */}
      <div className="row g-4">
        {/* Left column: Services + Process */}
        <div className="col-lg-8">
          <SectionHeading
            title={t('landing.servicesTitle')}
            subtitle={t('landing.centresDesc')}
          />
          <ServicesList
            items={[
              { href: path.booking, title: t('landing.card1Title'), desc: t('landing.card1Body'), icon: APP_ICONS.ticket },
              { href: path.queue, title: t('landing.card2Title'), desc: t('landing.card2Body'), icon: APP_ICONS.time },
              { href: path.notifications, title: t('landing.card3Title'), desc: t('landing.card3Body'), icon: APP_ICONS.notifications },
              { href: path.about, title: t('landing.card4Title'), desc: t('landing.card4Body'), icon: APP_ICONS.shieldCheckmark },
            ]}
          />

          <SectionHeading
            title={t('landing.stepsTitle')}
            subtitle={t('landing.stepsSub')}
            right={<Button label={t('landing.ctaBook')} href={path.booking} variant="link" small />}
          />
          <ProcessSteps
            steps={[
              { step: 1, label: t('landing.step1'), body: t('landing.step1Body') },
              { step: 2, label: t('landing.step2'), body: t('landing.step2Body') },
              { step: 3, label: t('landing.step3'), body: t('landing.step3Body') },
              { step: 4, label: t('landing.step4'), body: t('landing.step4Body') },
              { step: 5, label: t('landing.step5'), body: t('landing.step5Body') },
              { step: 6, label: t('landing.step6'), body: t('landing.step6Body') },
            ]}
          />
        </div>

        {/* Right column: Notices */}
        <div className="col-lg-4">
          <SectionHeading title={t('notice.title')} />
          <NoticesBoard
            notices={PORTAL_NOTICES.slice(0, 5)}
            subjectLabel={t('notice.subject')}
            dateLabel={t('notice.date')}
            viewAllLabel={t('common.viewAll')}
            viewAllHref={path.notices}
          />
        </div>
      </div>
    </div>
  );
}

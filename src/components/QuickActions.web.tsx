import { useI18n, type TranslationKey } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, AppIcon, type AppIconName } from './AppIcon';

type Action = {
  icon: AppIconName;
  labelKey: TranslationKey;
  hintKey: TranslationKey;
  href: string;
};

const ACTIONS: Action[] = [
  { icon: APP_ICONS.calendar, labelKey: 'dash.qaBook', hintKey: 'dash.qaBookHint', href: String(path.booking) },
  { icon: APP_ICONS.pulse, labelKey: 'dash.qaTrack', hintKey: 'dash.qaTrackHint', href: String(path.queue) },
  { icon: APP_ICONS.list, labelKey: 'dash.qaBookings', hintKey: 'dash.qaBookingsHint', href: String(path.bookings) },
  { icon: APP_ICONS.notifications, labelKey: 'dash.qaNotifications', hintKey: 'dash.qaNotificationsHint', href: String(path.notifications) },
  { icon: APP_ICONS.business, labelKey: 'dash.qaCentres', hintKey: 'dash.qaCentresHint', href: String(path.centres) },
  { icon: APP_ICONS.currency, labelKey: 'nav.prices', hintKey: 'prices.title', href: String(path.prices) },
  { icon: APP_ICONS.business, labelKey: 'nav.marketplace', hintKey: 'marketplace.title', href: String(path.marketplace) },
  { icon: APP_ICONS.list, labelKey: 'nav.pools', hintKey: 'pools.title', href: String(path.pools) },
  { icon: APP_ICONS.currency, labelKey: 'nav.offers', hintKey: 'offers.title', href: String(path.offers) },
  { icon: APP_ICONS.wallet, labelKey: 'nav.buyer', hintKey: 'buyer.title', href: String(path.buyer) },
  { icon: APP_ICONS.wallet, labelKey: 'nav.payments', hintKey: 'payments.title', href: String(path.payments) },
  { icon: APP_ICONS.infoCircle, labelKey: 'dash.qaHelp', hintKey: 'dash.qaHelpHint', href: String(path.help) },
];

/**
 * Dashboard quick actions — a Bootstrap list-group of task links. Each row
 * names the task and states what it opens, so the list reads as guidance
 * rather than decoration. Metro resolves this file on web.
 */
export default function QuickActions() {
  const { t } = useI18n();
  return (
    <div className="list-group">
      {ACTIONS.map((action) => (
        <a
          key={action.labelKey}
          href={action.href}
          className="list-group-item list-group-item-action d-flex align-items-start gap-3 py-3"
        >
          <span className="mt-1 flex-shrink-0">
            <AppIcon name={action.icon} size={18} />
          </span>
          <span className="flex-grow-1">
            <span className="fw-semibold d-block">{t(action.labelKey)}</span>
            <small className="text-body-secondary">{t(action.hintKey)}</small>
          </span>
          <span className="ms-auto mt-1 flex-shrink-0 text-body-secondary">
            <AppIcon name={APP_ICONS.chevronForward} size={14} color="currentColor" />
          </span>
        </a>
      ))}
    </div>
  );
}

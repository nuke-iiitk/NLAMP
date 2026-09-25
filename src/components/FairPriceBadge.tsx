import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';
import type { ApiFairPriceStatus } from '../services/api';
import { formatDeviation, formatInr } from '../utils/format';

type Tone = { bg: string; fg: string; border: string };

/** Mirrors the backend's `badge_color`: red = low offer, green = good price. */
const TONES: Record<ApiFairPriceStatus, Tone> = {
  below_market: { bg: Colors.dangerLight, fg: Colors.danger, border: Colors.danger },
  near_market: { bg: Colors.warningLight, fg: Colors.warning, border: Colors.warning },
  above_market: { bg: Colors.greenLight, fg: Colors.success, border: Colors.success },
};

const LABELS: Record<ApiFairPriceStatus, TranslationKey> = {
  below_market: 'fairPrice.belowMarket',
  near_market: 'fairPrice.nearMarket',
  above_market: 'fairPrice.aboveMarket',
};

function toneFor(status: string): Tone {
  return TONES[status as ApiFairPriceStatus] ?? TONES.near_market;
}

function labelFor(status: string): TranslationKey {
  return LABELS[status as ApiFairPriceStatus] ?? LABELS.near_market;
}

/** Minimal shape needed from the backend's FairPriceIndicator payload. */
export type FairPriceLike = {
  status: string;
  deviation_pct: number;
  market_avg_price: string;
  offer_price: string;
  message: string;
};

/**
 * Fair-price badge — the visual language of the Fair Price Discovery engine.
 *
 * Colour always comes from the backend's own classification (`status` /
 * `badge_color`) so the app and the API can never disagree about whether an
 * offer is below, near or above the market average.
 */
export default function FairPriceBadge({
  indicator,
  small,
  showPrices,
  showMessage,
}: {
  indicator: FairPriceLike;
  /** Compact variant for dense lists (match cards, tables). */
  small?: boolean;
  /** Print `market average › your price` under the badge. */
  showPrices?: boolean;
  /** Print the backend's human-readable sentence under the badge. */
  showMessage?: boolean;
}) {
  const { t, fs } = useI18n();
  const tone = toneFor(indicator.status);

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.badge,
          small && styles.badgeSmall,
          { backgroundColor: tone.bg, borderColor: tone.border },
        ]}
        accessibilityLabel={`${t(labelFor(indicator.status))} ${formatDeviation(
          indicator.deviation_pct
        )}`}
      >
        <Text style={[styles.label, { color: tone.fg, fontSize: fs(small ? 11 : 12) }]}>
          {t(labelFor(indicator.status))}
        </Text>
        <Text style={[styles.deviation, { color: tone.fg, fontSize: fs(small ? 10 : 11) }]}>
          {formatDeviation(indicator.deviation_pct)}
        </Text>
      </View>

      {showPrices ? (
        <Text style={[styles.meta, { fontSize: fs(12) }]}>
          {t('fairPrice.marketAverage')} ₹{formatInr(indicator.market_avg_price)}
          {'   ·   '}
          {t('fairPrice.offerPrice')} ₹{formatInr(indicator.offer_price)}
        </Text>
      ) : null}

      {showMessage && indicator.message ? (
        <Text style={[styles.message, { fontSize: fs(12), color: tone.fg }]}>
          {indicator.message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontWeight: '700',
  },
  deviation: {
    fontWeight: '800',
  },
  meta: {
    color: Colors.textSecondary,
  },
  message: {
    fontWeight: '600',
  },
});

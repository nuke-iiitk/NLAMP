import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AlertBanner from '../components/AlertBanner';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import FormField from '../components/FormField';
import InfoCard, { MetaRow } from '../components/InfoCard';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import { Colors, Radius, Spacing } from '../constants/theme';
import { useBuyerMatches, useBuyerRequirements, useOfferInbox } from '../hooks/useMarketplace';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { api } from '../services/api';
import type { ApiBuyer, ApiMatchedFarmerListing, ApiOffer } from '../services/api';
import { useStore } from '../store/AppStore';
import { formatDeviation, formatIsoDate, formatKg, formatRate } from '../utils/format';

/** Crops with a market price feed — keeps matching aligned with /prices. */
const CROPS = ['Paddy', 'Wheat', 'Maize', 'Coconut'];

const STATUS_TONE: Record<string, string> = {
  PENDING: Colors.saffronDark,
  ACCEPTED: Colors.green,
  REJECTED: Colors.danger,
  COUNTERED: Colors.info,
  CANCELLED: Colors.textMuted,
  EXPIRED: Colors.textMuted,
};

export default function BuyerScreen() {
  const { t, fs } = useI18n();
  const { farmer } = useStore();

  const [buyer, setBuyer] = useState<ApiBuyer | null>(null);
  const [signup, setSignup] = useState({ name: '', company: '', phone: '', password: '' });
  const [draft, setDraft] = useState({
    crop: farmer?.crop || CROPS[0],
    minQuantity: '1000',
    maxQuantity: '20000',
    price: '1900',
    state: farmer?.state || 'Kerala',
    district: farmer?.district || 'Kottayam',
    maxDistance: '150',
    deadline: '',
    quality: '',
  });
  const [openRequirement, setOpenRequirement] = useState<string | null>(null);
  const [offer, setOffer] = useState<{
    listing: ApiMatchedFarmerListing | null;
    price: string;
    quantity: string;
  }>({ listing: null, price: '', quantity: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requirements = useBuyerRequirements(buyer?.id ?? null, 'ALL');
  const matches = useBuyerMatches(openRequirement);
  const outbox = useOfferInbox({ buyerId: buyer?.id });

  const register = async () => {
    if (!signup.name || !/^[6-9]\d{9}$/.test(signup.phone) || signup.password.length < 8) {
      setError(t('buyer.registerError'));
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const response = await api.createBuyer({
      name: signup.name,
      phone: signup.phone,
      password: signup.password,
      company_name: signup.company || undefined,
      state: farmer?.state,
      district: farmer?.district,
    });
    setBusy(false);
    if (!response.ok) {
      setError(t('buyer.registerError'));
      return;
    }
    setBuyer(response.data);
    setNotice(t('buyer.registered', { code: response.data.buyer_code }));
  };

  const postRequirement = async () => {
    if (!buyer) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const response = await api.createRequirement(buyer.id, {
      crop: draft.crop,
      min_quantity_kg: Number(draft.minQuantity) || 0,
      max_quantity_kg: Number(draft.maxQuantity) || 0,
      offered_price_per_quintal: Number(draft.price) || 0,
      state: draft.state,
      district: draft.district || undefined,
      max_distance_km: Number(draft.maxDistance) || undefined,
      delivery_deadline: draft.deadline || undefined,
      quality_requirements: draft.quality || undefined,
    });
    setBusy(false);
    if (!response.ok) {
      setError(t('buyer.postError'));
      return;
    }
    setNotice(t('buyer.posted'));
    // Open the new requirement straight away so matches load immediately.
    setOpenRequirement(response.data.id);
    requirements.reload();
  };

  const sendOffer = async () => {
    if (!offer.listing || !openRequirement) return;
    const price = Number(offer.price);
    const quantity = Number(offer.quantity);
    if (!(price > 0) || !(quantity > 0)) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const response = await api.createOffer({
      requirement_id: openRequirement,
      farmer_id: offer.listing.farmer_id,
      price_per_quintal: price,
      quantity_kg: quantity,
    });
    setBusy(false);
    if (!response.ok) {
      setError(t('buyer.offerError'));
      return;
    }
    setNotice(t('buyer.offerSent'));
    setOffer({ listing: null, price: '', quantity: '' });
    outbox.reload();
  };

  const withdraw = async (target: ApiOffer) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const response = await api.updateOffer(target.id, { status: 'CANCELLED' });
    setBusy(false);
    if (!response.ok) {
      setError(t('buyer.withdrawError'));
      return;
    }
    setNotice(t('buyer.withdrawn'));
    outbox.reload();
  };

  // ------------------------------------------------- registration gate
  if (!buyer) {
    return (
      <ScreenShell breadcrumbs={[{ label: t('nav.buyer') }]}>
        <SectionHeading title={t('buyer.title')} subtitle={t('buyer.subtitle')} />
        <AlertBanner tone="info" title={t('buyer.registerTitle')} message={t('buyer.registerHint')} />
        <InfoCard title={t('buyer.registerTitle')}>
          <FormField
            label={t('buyer.name')}
            value={signup.name}
            onChangeText={(value) => setSignup({ ...signup, name: value })}
            maxLength={80}
          />
          <FormField
            label={t('buyer.company')}
            value={signup.company}
            onChangeText={(value) => setSignup({ ...signup, company: value })}
            maxLength={80}
          />
          <FormField
            label={t('buyer.phone')}
            value={signup.phone}
            onChangeText={(value) => setSignup({ ...signup, phone: value.replace(/\D/g, '') })}
            keyboardType="phone-pad"
            maxLength={10}
          />
          <FormField
            label={t('buyer.password')}
            value={signup.password}
            onChangeText={(value) => setSignup({ ...signup, password: value })}
            maxLength={32}
          />
          <Button label={t('buyer.register')} loading={busy} onPress={() => void register()} />
        </InfoCard>
        {error ? <AlertBanner tone="error" title={t('buyer.registerTitle')} message={error} /> : null}
        <Button
          label={t('nav.marketplace')}
          variant="outline-primary"
          onPress={() => router.push(path.marketplace)}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.buyer') }]}>
      <SectionHeading title={t('buyer.title')} subtitle={t('buyer.subtitle')} />
      <AlertBanner
        tone="success"
        title={t('buyer.activeBuyer', { name: buyer.name, code: buyer.buyer_code })}
        message={t('buyer.registerHint')}
      />
      {notice ? <AlertBanner tone="success" title={t('buyer.title')} message={notice} /> : null}
      {error ? <AlertBanner tone="error" title={t('buyer.title')} message={error} /> : null}

      <InfoCard title={t('buyer.requirementTitle')} accent={Colors.saffron}>
        <View style={styles.chips}>
          {CROPS.map((item) => (
            <Button
              key={item}
              small
              label={item}
              active={draft.crop === item}
              variant={draft.crop === item ? 'primary' : 'outline-secondary'}
              onPress={() => setDraft({ ...draft, crop: item })}
            />
          ))}
        </View>
        <FormField
          label={t('buyer.minQuantity')}
          value={draft.minQuantity}
          onChangeText={(value) => setDraft({ ...draft, minQuantity: value })}
          keyboardType="numeric"
          maxLength={7}
        />
        <FormField
          label={t('buyer.maxQuantity')}
          value={draft.maxQuantity}
          onChangeText={(value) => setDraft({ ...draft, maxQuantity: value })}
          keyboardType="numeric"
          maxLength={7}
        />
        <FormField
          label={t('buyer.offeredPrice')}
          value={draft.price}
          onChangeText={(value) => setDraft({ ...draft, price: value })}
          keyboardType="numeric"
          maxLength={7}
          hint={t('prices.checkHint')}
        />
        <FormField
          label={t('buyer.maxDistance')}
          value={draft.maxDistance}
          onChangeText={(value) => setDraft({ ...draft, maxDistance: value })}
          keyboardType="numeric"
          maxLength={5}
        />
        <FormField
          label={t('buyer.deadline')}
          value={draft.deadline}
          onChangeText={(value) => setDraft({ ...draft, deadline: value })}
          maxLength={10}
        />
        <FormField
          label={t('buyer.quality')}
          value={draft.quality}
          onChangeText={(value) => setDraft({ ...draft, quality: value })}
          maxLength={200}
        />
        <Button label={t('buyer.post')} loading={busy} onPress={() => void postRequirement()} />
      </InfoCard>

      <InfoCard title={t('buyer.myRequirements')}>
        {requirements.loading ? (
          <Text style={[styles.hint, { fontSize: fs(13) }]}>{t('common.loading')}</Text>
        ) : null}
        {!requirements.loading && requirements.items.length === 0 ? (
          <Text style={[styles.hint, { fontSize: fs(13) }]}>{t('buyer.requirementsEmpty')}</Text>
        ) : null}
        {requirements.items.map((item) => (
          <View key={item.id} style={styles.box}>
            <Text style={[styles.status, { fontSize: fs(13), color: Colors.primary }]}>
              {`${item.crop} · ${formatRate(item.offered_price_per_quintal)}`}
            </Text>
            <MetaRow
              label={t('marketplace.quantityRange')}
              value={`${formatKg(item.min_quantity_kg)} – ${formatKg(item.max_quantity_kg)}`}
            />
            <MetaRow label={t('marketplace.status')} value={item.status} />
            <MetaRow label={t('marketplace.expiresOn')} value={formatIsoDate(item.valid_until)} />
            <Button
              small
              label={t('buyer.findFarmers')}
              variant={openRequirement === item.id ? 'primary' : 'outline-primary'}
              onPress={() => setOpenRequirement(openRequirement === item.id ? null : item.id)}
            />
          </View>
        ))}
      </InfoCard>

      {openRequirement ? (
        <InfoCard title={t('buyer.matchesTitle')} accent={Colors.green}>
          <Text style={[styles.hint, { fontSize: fs(13) }]}>{t('buyer.matchesHint')}</Text>
          {matches.loading ? (
            <Text style={[styles.hint, { fontSize: fs(13) }]}>{t('common.loading')}</Text>
          ) : null}
          {!matches.loading && matches.items.length === 0 ? (
            <EmptyState title={t('buyer.noMatches')} />
          ) : null}
          {matches.items.map((listing) => (
            <View key={listing.farmer_id} style={styles.box}>
              <Text style={[styles.status, { fontSize: fs(13), color: Colors.primaryDark }]}>
                {`${listing.farmer_name} · ${Math.round(listing.match_score.total_score * 100)}%`}
              </Text>
              <MetaRow label={t('buyer.quantityAvailable')} value={formatKg(listing.quantity_kg)} />
              <MetaRow
                label={t('buyer.expectation')}
                value={listing.price_per_quintal ? formatRate(listing.price_per_quintal) : '—'}
              />
              <MetaRow label={t('marketplace.location')} value={`${listing.district}, ${listing.state}`} />
              <MetaRow
                label={t('offers.marketAvg')}
                value={formatRate(listing.fair_price.market_avg_price)}
              />
              <MetaRow
                label={t('offers.deviation')}
                value={formatDeviation(listing.fair_price.deviation_pct)}
              />
              <Text style={[styles.hint, { fontSize: fs(12) }]}>
                {`${t('marketplace.matchScore')}: ${t('marketplace.scorePrice')} ${Math.round(
                  listing.match_score.price_score * 100
                )}% · ${t('marketplace.scoreDistance')} ${Math.round(
                  listing.match_score.distance_score * 100
                )}% · ${t('marketplace.scoreQuantity')} ${Math.round(
                  listing.match_score.quantity_score * 100
                )}% · ${t('marketplace.scoreReliability')} ${Math.round(
                  listing.match_score.reliability_score * 100
                )}%`}
              </Text>

              {offer.listing?.farmer_id === listing.farmer_id ? (
                <View style={styles.box}>
                  <FormField
                    label={t('buyer.offeredPrice')}
                    value={offer.price}
                    onChangeText={(value) => setOffer({ ...offer, price: value })}
                    keyboardType="numeric"
                    maxLength={7}
                  />
                  <FormField
                    label={t('marketplace.quantity')}
                    value={offer.quantity}
                    onChangeText={(value) => setOffer({ ...offer, quantity: value })}
                    keyboardType="numeric"
                    maxLength={7}
                  />
                  <Button
                    small
                    label={t('buyer.sendOffer')}
                    loading={busy}
                    onPress={() => void sendOffer()}
                  />
                </View>
              ) : (
                <Button
                  small
                  variant="outline-primary"
                  label={t('buyer.sendOffer')}
                  onPress={() =>
                    setOffer({
                      listing,
                      price: draft.price,
                      quantity: String(
                        Math.min(
                          Number(draft.maxQuantity) || 1000,
                          Number(listing.quantity_kg) || 1000
                        )
                      ),
                    })
                  }
                />
              )}
            </View>
          ))}
        </InfoCard>
      ) : null}

      <InfoCard title={t('buyer.outboxTitle')}>
        {outbox.loading ? (
          <Text style={[styles.hint, { fontSize: fs(13) }]}>{t('common.loading')}</Text>
        ) : null}
        {!outbox.loading && outbox.items.length === 0 ? (
          <Text style={[styles.hint, { fontSize: fs(13) }]}>{t('buyer.outboxEmpty')}</Text>
        ) : null}
        {outbox.items.map((item) => (
          <View key={item.id} style={styles.box}>
            <Text
              style={[
                styles.status,
                { fontSize: fs(13), color: STATUS_TONE[item.status] ?? Colors.textMuted },
              ]}
            >
              {item.status}
            </Text>
            <MetaRow label={t('buyer.offeredPrice')} value={formatRate(item.price_per_quintal)} />
            <MetaRow label={t('marketplace.quantity')} value={formatKg(item.quantity_kg)} />
            <MetaRow label={t('offers.deviation')} value={formatDeviation(item.deviation_pct)} />
            <MetaRow
              label={t('offers.received')}
              value={formatIsoDate(item.created_at.slice(0, 10))}
            />
            {item.status === 'PENDING' ? (
              <Button
                small
                variant="danger"
                label={t('buyer.withdraw')}
                loading={busy}
                onPress={() => void withdraw(item)}
              />
            ) : null}
          </View>
        ))}
      </InfoCard>

      <Button label={t('nav.offers')} variant="secondary" onPress={() => router.push(path.offers)} />
      <Button
        label={t('marketplace.viewPools')}
        variant="outline-primary"
        onPress={() => router.push(path.pools)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  hint: { color: Colors.textSecondary, marginBottom: Spacing.md },
  status: { fontWeight: '800', letterSpacing: 0.4, marginBottom: Spacing.sm },
  box: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
  },
});


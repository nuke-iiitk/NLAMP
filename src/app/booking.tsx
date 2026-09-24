import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions, Alert } from 'react-native';

import CentreCard from '../components/CentreCard';
import ChoiceChips from '../components/ChoiceChips';
import DemoBadge from '../components/DemoBadge';
import DropdownSelect from '../components/DropdownSelect';
import FormField from '../components/FormField';
import InfoCard, { MetaRow } from '../components/InfoCard';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StepIndicator from '../components/StepIndicator';
import TokenDisplay from '../components/TokenDisplay';
import TokenPdfButton from '../components/TokenPdfButton';
import { Colors, Radius, Spacing } from '../constants/theme';
import {
  DEFAULT_TRANSPORT_MODE,
  MAX_BAGS,
  MAX_QUANTITY_KG,
  TRANSPORT_MODES,
  bagsForWeight,
  cropNeedsMoisture,
  transportModeLabelKey,
  transportNeedsVehicle,
  varietiesForCrop,
} from '../constants/produce';
import {
  addDaysISO,
  formatDateLong,
  formatDateShort,
  formatTime12h,
  dayName,
  slotAvailability,
  slotRange,
  todayISO,
  type Booking,
  type Slot,
  type SlotAvailability,
} from '../data/mockData';
import { useI18n, type TranslationKey } from '../i18n';
import { path } from '../navigation';
import { useStore } from '../store/AppStore';

const STEPS: TranslationKey[] = [
  'book.sCentre',
  'book.sSlot',
  'book.sProduce',
  'book.review',
  'book.confirmed',
];

export default function BookingScreen() {
  const { t, fs } = useI18n();
  const { centres, slots, createBooking, farmer } = useStore();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  const [step, setStep] = useState(0);
  const [centreId, setCentreId] = useState<string>(farmer?.preferredCentreId ?? 'c1');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [slotError, setSlotError] = useState('');

  // ---- Produce declaration (step 2) ----
  // Pre-filled from the registration profile as *defaults only*; every field
  // stays editable so the farmer can declare what they actually bring.
  const [produce, setProduce] = useState('');
  const [variety, setVariety] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [bagCount, setBagCount] = useState('');
  const [moisture, setMoisture] = useState('');
  const [transportMode, setTransportMode] = useState(DEFAULT_TRANSPORT_MODE);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [produceErrors, setProduceErrors] = useState<Record<string, string>>({});

  const centre = centres.find((c) => c.id === centreId) ?? centres[0];
  const distinctDistricts = Array.from(new Set(centres.map((c) => c.district)));

  const centreSlots = useMemo(
    () => slots.filter((slot) => slot.centreId === centreId && slot.date === selectedDate),
    [slots, centreId, selectedDate]
  );

  const selectedSlotObj = selectedSlot
    ? centreSlots.find((s) => s.id === selectedSlot)
    : undefined;
  const selectedSlotStart = selectedSlotObj?.start;
  const selectedSlotEnd = selectedSlotObj?.end;

  const dates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysISO(todayISO(), i)),
    []
  );

  const availableCount = centreSlots.filter(
    (slot) => slotAvailability(slot) === 'Available' || slotAvailability(slot) === 'Almost Full'
  ).length;

  // ---- Produce-declaration derivations ----
  /** Crops this centre is actually authorised to procure. */
  const centreCrops = centre?.crops ?? [];
  const cropOptions = useMemo(
    () => (centre?.crops ?? []).map((crop) => ({ value: crop, label: crop })),
    [centre]
  );
  const varietyOptions = useMemo(
    () => varietiesForCrop(produce).map((value) => ({ value, label: value })),
    [produce]
  );
  const needsMoisture = cropNeedsMoisture(produce);
  const needsVehicle = transportNeedsVehicle(transportMode);
  const suggestedBags = bagsForWeight(Number.parseInt(quantityKg, 10));
  const transportItems = useMemo(
    () => TRANSPORT_MODES.map((mode) => ({ id: mode.id, label: t(mode.labelKey as TranslationKey) })),
    [t]
  );
  /** Crop recorded in the farmer's registration profile. */
  const profileCrop = farmer?.crop ?? '';
  const profileCropAccepted = profileCrop === '' || centreCrops.includes(profileCrop);
  /** Centre · date · slot line shown above the produce fields. */
  const produceContext = `${centre?.name ?? ''} · ${formatDateLong(selectedDate)} · ${slotRange(
    selectedSlotStart ?? '10:00',
    selectedSlotEnd ?? '10:30'
  )}`;

  /** Enter the produce step, pre-filling editable defaults from the profile. */
  function openProduceStep() {
    if (!selectedSlot) {
      setSlotError(t('book.slotTaken'));
      return;
    }
    if (produce === '' && profileCropAccepted && profileCrop !== '') setProduce(profileCrop);
    if (quantityKg === '' && farmer?.quantityKg) {
      const fromProfile = farmer.quantityKg.replace(/[^0-9]/g, '');
      setQuantityKg(fromProfile);
      const suggested = bagsForWeight(Number.parseInt(fromProfile, 10));
      if (suggested > 0 && bagCount === '') setBagCount(String(suggested));
    }
    setSlotError('');
    setStep(2);
  }

  /** Digits-only quantity entry; seeds the bag count while it is untouched. */
  function handleQuantityChange(value: string) {
    const digits = value.replace(/[^0-9]/g, '');
    setQuantityKg(digits);
    const suggested = bagsForWeight(Number.parseInt(digits, 10));
    if (suggested > 0) setBagCount((current) => (current === '' ? String(suggested) : current));
    setProduceErrors({});
  }

  function confirmBooking() {
    if (!selectedSlot) {
      setSlotError(t('book.slotTaken'));
      return;
    }
    const slot = centreSlots.find((s) => s.id === selectedSlot);
    if (!slot) {
      setSlotError(t('book.slotTaken'));
      return;
    }
    void (async () => {
      const result = await createBooking({
        centreId,
        date: selectedDate,
        slotStart: slot.start,
        slotEnd: slot.end,
        produce: produce || farmer?.crop || 'Paddy',
        quantityKg: quantityKg || farmer?.quantityKg || '850',
        slotId: slot.id,
      });
      if (!result.ok) {
        setSlotError(t((result.error ?? 'book.slotTaken') as TranslationKey));
        return;
      }
      setConfirmedBooking(result.booking);
      setStep(4);
    })();
  }

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.booking') }]}>
      <SectionHeading title={t('book.title')} subtitle={t('book.subtitle')} />

      <StepIndicator steps={STEPS.map((key) => t(key))} current={Math.min(step, STEPS.length - 1)} />

{step === 0 ? (
        <View>
          <Text style={[styles.section, { fontSize: fs(14) }]}>{t('book.sDistrict')}</Text>
          <View style={styles.chipGrid}>
            {distinctDistricts.map((district) => {
              const active = centre.district === district;
              const count = centres.filter((c) => c.district === district).length;
              return (
                <Button
                  key={district}
                  variant="outline-primary"
                  active={active}
                  label={district}
                  description={`${count} ${t('nav.centres')}`}
                  accessibilityLabel={`${district}, ${count} ${t('nav.centres')}`}
                  onPress={() => {
                    const first = centres.find((c) => c.district === district);
                    if (first) setCentreId(first.id);
                  }}
                />
              );
            })}
          </View>

          <Text style={[styles.section, { fontSize: fs(14) }]}>{t('book.sCentre')}</Text>
          <View style={[styles.centreGrid, !wide && styles.centreStack]}>
            {centres.filter((c) => c.district === centre.district).map((c) => (
              <View key={c.id} style={styles.centreWrap}>
                <CentreCard
                  centre={c}
                  action={
                    <Button
                      label={c.id === centreId ? t('book.selected') : t('book.selectCentre')}
                      onPress={() => {
                        setCentreId(c.id);
                        setStep(1);
                      }}
                      small
                      variant={c.id === centreId ? 'primary' : 'secondary'}
                    />
                  }
                />
              </View>
            ))}
          </View>

          <View style={styles.sectionRow}>
            <Button variant="outline-primary" label={t('common.back')} onPress={() => router.back()} />
            <Button label={t('common.continue')} onPress={() => setStep(1)} />
          </View>
        </View>
      ) : null}

{step === 1 ? (
        <View>
          {/* Date selector */}
          <Text style={[styles.section, { fontSize: fs(14) }]}>{t('book.sDate')}</Text>
          <View style={styles.dateRow}>
            {dates.map((date) => {
              const active = date === selectedDate;
              return (
                <Button
                  key={date}
                  variant="outline-secondary"
                  small
                  active={active}
                  label={dayName(date)}
                  description={formatDateShort(date)}
                  accessibilityLabel={formatDateLong(date)}
                  onPress={() => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                    setSlotError('');
                  }}
                />
              );
            })}
          </View>

          {/* Slot legend */}
          <View style={styles.legend}>
            <LegendDot color={Colors.green} label={t('book.legendAvailable')} />
            <LegendDot color={Colors.saffron} label={t('book.legendAlmost')} />
            <LegendDot color={Colors.borderDark} label={t('book.legendFull')} />
          </View>

          <Text style={[styles.section, { fontSize: fs(14) }]}>
            {t('book.sSlot')} · {formatDateLong(selectedDate)} · {centre.name}
            {availableCount > 0 ? ` · ${availableCount} ${t('book.availableSlots')}` : ''}
          </Text>
          {centreSlots.length === 0 ? (
            <InfoCard>
              <Text style={[styles.emptyText, { fontSize: fs(14) }]}>{t('book.noSlots')}</Text>
            </InfoCard>
          ) : (
            <View style={styles.slotGrid}>
              {centreSlots.map((slot: Slot) => {
                const availability: SlotAvailability = slotAvailability(slot);
                const disabled = availability === 'Full' || availability === 'Closed';
                const active = selectedSlot === slot.id;
                const colors = {
                  Available: Colors.green,
                  'Almost Full': Colors.saffron,
                  Full: Colors.borderDark,
                  Closed: Colors.borderDark,
                };
                const bg = {
                  Available: Colors.greenLight,
                  'Almost Full': Colors.saffronLight,
                  Full: Colors.surfaceAlt,
                  Closed: Colors.surfaceAlt,
                }[availability];
                return (
                  <Button
                    key={slot.id}
                    variant="outline-primary"
                    active={active}
                    disabled={disabled}
                    onPress={() => {
                      setSelectedSlot(slot.id);
                      setSlotError('');
                    }}
                    className="fpp-slot-btn"
                    label={`${formatTime12h(slot.start)} – ${formatTime12h(slot.end)}`}
                    description={
                      availability === 'Closed'
                        ? t('book.slotClosed')
                        : availability === 'Full'
                          ? t('book.slotFull')
                          : `${slot.capacity - slot.booked} ${t('book.availableSlots')}`
                    }
                  />
                );
              })}
            </View>
          )}
          {slotError ? <Text style={styles.error}>{slotError}</Text> : null}

          <View style={styles.sectionRow}>
            <Button variant="outline-primary" label={t('common.back')} onPress={() => setStep(0)} />
            <Button
              label={t('common.continue')}
              onPress={openProduceStep}
              disabled={!selectedSlot}
            />
          </View>
        </View>
      ) : null}

      {/* ---- Step 2: Produce declaration ---- */}
      {step === 2 ? (
        <View>
          <InfoCard accent={Colors.saffron}>
            <Text style={[styles.produceTitle, { fontSize: fs(15) }]}>{t('book.produceTitle')}</Text>
            <Text style={[styles.produceBody, { fontSize: fs(13) }]}>{t('book.produceNote')}</Text>
            <Text style={[styles.produceMeta, { fontSize: fs(12) }]}>{produceContext}</Text>
          </InfoCard>

          {!profileCropAccepted ? (
            <InfoCard accent={Colors.warning}>
              <Text style={[styles.produceWarn, { fontSize: fs(13) }]}>
                {t('book.notAccepted', { crop: profileCrop })}
              </Text>
            </InfoCard>
          ) : null}

          {/* Crop — limited to what this centre is authorised to procure */}
          <DropdownSelect
            label={t('book.crop')}
            value={produce}
            placeholder={t('book.cropPlaceholder')}
            options={cropOptions}
            onSelect={(value) => {
              setProduce(value);
              setVariety('');
              setProduceErrors({});
            }}
            error={produceErrors.crop}
          />
          <Text style={[styles.fieldHint, { fontSize: fs(12) }]}>
            {t('book.cropAccepted', { list: centreCrops.join(', ') })}
          </Text>

          {/* Variety / grade — compared against the officer's intake reading */}
          <DropdownSelect
            label={t('book.variety')}
            value={variety}
            placeholder={t('book.varietyPlaceholder')}
            options={varietyOptions}
            onSelect={(value) => {
              setVariety(value);
              setProduceErrors({});
            }}
            error={produceErrors.variety}
          />

          {/* Quantity + bags — bags are checked at the gate */}
          <FormField
            label={t('book.quantity')}
            value={quantityKg}
            onChangeText={handleQuantityChange}
            keyboardType="numeric"
            maxLength={5}
            required
            error={produceErrors.quantity}
            hint={t('book.quantityHint', { max: MAX_QUANTITY_KG, bags: MAX_BAGS })}
          />
          <FormField
            label={t('book.bags')}
            value={bagCount}
            onChangeText={(value) => {
              setBagCount(value.replace(/[^0-9]/g, ''));
              setProduceErrors({});
            }}
            keyboardType="numeric"
            maxLength={3}
            required
            error={produceErrors.bags}
            hint={suggestedBags > 0 ? t('book.bagsAuto', { bags: suggestedBags }) : undefined}
          />

          {/* Moisture — declared for grain crops only */}
          {needsMoisture ? (
            <FormField
              label={t('book.moisture')}
              value={moisture}
              onChangeText={(value) => {
                setMoisture(value.replace(/[^0-9.]/g, ''));
                setProduceErrors({});
              }}
              keyboardType="numeric"
              maxLength={5}
              error={produceErrors.moisture}
              hint={t('book.moistureHint')}
            />
          ) : null}

          {/* Transport — mode drives whether a vehicle number is required */}
          <Text style={[styles.section, { fontSize: fs(14) }]}>{t('book.transport')}</Text>
          <ChoiceChips
            items={transportItems}
            value={transportMode}
            onChange={(value) => {
              setTransportMode(value);
              setProduceErrors({});
            }}
          />
          {needsVehicle ? (
            <FormField
              label={t('book.vehicle')}
              value={vehicleNumber}
              onChangeText={(value) => {
                setVehicleNumber(value.toUpperCase());
                setProduceErrors({});
              }}
              placeholder={t('book.vehiclePlaceholder')}
              maxLength={14}
              error={produceErrors.vehicle}
            />
          ) : null}

          <FormField
            label={t('book.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('book.notesPlaceholder')}
            multiline
            maxLength={200}
          />

          {slotError ? <Text style={styles.error}>{slotError}</Text> : null}

          <View style={styles.sectionRow}>
            <Button variant="outline-primary" label={t('common.back')} onPress={() => setStep(1)} />
            <Button label={t('book.review')} onPress={() => setStep(3)} />
          </View>
        </View>
      ) : null}

      {/* ---- Step 3: Review ---- */}
      {step === 3 ? (
        <View>
          <InfoCard title={t('book.review')}>
            <MetaRow label={t('book.farmer')} value={farmer?.name ?? t('nav.login')} />
            <MetaRow label={t('dash.centre')} value={centre.name} />
            <MetaRow label={t('dash.date')} value={formatDateLong(selectedDate)} />
            <MetaRow label={t('dash.time')} value={slotRange(selectedSlotStart ?? '10:00', selectedSlotEnd ?? '10:30')} />
            <MetaRow label={t('book.crop')} value={produce || '—'} />
            <MetaRow label={t('book.variety')} value={variety || '—'} />
            <MetaRow label={t('book.quantity')} value={quantityKg ? `${quantityKg} kg` : '—'} />
            <MetaRow label={t('book.bags')} value={bagCount || '—'} />
            {needsMoisture ? (
              <MetaRow label={t('book.moisture')} value={moisture ? `${moisture}%` : '—'} />
            ) : null}
            <MetaRow
              label={t('book.transport')}
              value={t(transportModeLabelKey(transportMode) as TranslationKey)}
            />
            {needsVehicle ? (
              <MetaRow label={t('book.vehicle')} value={vehicleNumber || '—'} />
            ) : null}
            {notes ? <MetaRow label={t('book.notes')} value={notes} /> : null}
          </InfoCard>

          {slotError ? <Text style={styles.error}>{slotError}</Text> : null}

          <View style={styles.sectionRow}>
            <Button variant="outline-primary" label={t('common.back')} onPress={() => setStep(2)} />
            <Button label={t('book.confirm')} onPress={confirmBooking} variant="success" />
          </View>
        </View>
      ) : null}

      {/* ---- Step 4: Confirmation ---- */}
      {step === 4 && confirmedBooking ? (
        <View style={styles.confirm}>
          <TokenDisplay
            token={confirmedBooking.token}
            label={t('book.confirmed')}
            subtitle={t('book.showToken')}
          />
          <InfoCard title={t('book.confirmed')}>
            <MetaRow label={t('dash.centre')} value={confirmedBooking.centreName} />
            <MetaRow label={t('dash.date')} value={formatDateLong(confirmedBooking.date)} />
            <MetaRow
              label={t('dash.time')}
              value={slotRange(confirmedBooking.slotStart, confirmedBooking.slotEnd)}
            />
            <MetaRow label={t('book.crop')} value={produce || confirmedBooking.produce} />
            <MetaRow label={t('book.variety')} value={variety || '—'} />
            <MetaRow
              label={t('book.quantity')}
              value={`${quantityKg || confirmedBooking.quantityKg} kg`}
            />
            <MetaRow label={t('book.bags')} value={bagCount || '—'} />
            {needsMoisture ? (
              <MetaRow label={t('book.moisture')} value={moisture ? `${moisture}%` : '—'} />
            ) : null}
            <MetaRow
              label={t('book.transport')}
              value={t(transportModeLabelKey(transportMode) as TranslationKey)}
            />
            {needsVehicle ? (
              <MetaRow label={t('book.vehicle')} value={vehicleNumber || '—'} />
            ) : null}
          </InfoCard>
          <DemoBadge />

          <View style={styles.confirmActions}>
            <TokenPdfButton
              booking={confirmedBooking}
              farmer={farmer}
              centre={centres.find((c) => c.id === confirmedBooking.centreId)}
            />
            <Button
              label={t('book.viewQueue')}
              onPress={() => router.replace(path.queue as never)}
              variant="success"
            />
            <Button variant="outline-primary"
              label={`📅 ${t('book.addCalendar')}`}
              onPress={() =>
                Alert.alert(t('book.addCalendar'), t('book.calendarNote'), [
                  { text: t('common.close') },
                ])
              }
            />
            <Button variant="outline-primary" label={t('book.backDash')} onPress={() => router.replace(path.dashboard as never)} />
          </View>
        </View>
      ) : null}
    </ScreenShell>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  /* ---- Produce-declaration step ---- */
  produceTitle: {
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  produceBody: {
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  produceMeta: {
    fontWeight: '700',
    color: Colors.primary,
  },
  produceWarn: {
    color: Colors.warning,
    fontWeight: '700',
    lineHeight: 20,
  },
  fieldHint: {
    color: Colors.textMuted,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    minWidth: 120,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  chipText: {
    color: Colors.text,
    fontWeight: '800',
  },
  chipTextActive: {
    color: Colors.primary,
  },
  chipHint: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  centreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  centreStack: {
    flexDirection: 'column',
  },
  centreWrap: {
    flexGrow: 1,
    minWidth: 280,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dateChip: {
    flexGrow: 1,
    flexBasis: 64,
    maxWidth: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dateChipActive: {
    borderColor: Colors.saffron,
    backgroundColor: Colors.saffronLight,
  },
  dateDay: {
    color: Colors.textMuted,
    fontWeight: '700',
  },
  dateNum: {
    color: Colors.text,
    fontWeight: '800',
    marginTop: 2,
  },
  dateMonth: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  dateTextActive: {
    color: Colors.saffronDark,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  slotBtn: {
    width: '31%',
    minWidth: 100,
    borderWidth: 2,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  slotActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  slotDisabled: {
    opacity: 0.6,
  },
  slotTime: {
    color: Colors.text,
    fontWeight: '800',
    textAlign: 'center',
  },
  slotMeta: {
    marginTop: 4,
    fontWeight: '700',
    textAlign: 'center',
  },
  error: {
    color: Colors.danger,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
  },
  confirm: {
    alignItems: 'center',
  },
  confirmActions: {
    alignSelf: 'stretch',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
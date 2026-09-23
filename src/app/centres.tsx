import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import CentreCard from '../components/CentreCard';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SearchableSelect from '../components/SearchableSelect';
import SectionHeading from '../components/SectionHeading';
import { Colors, Radius, Spacing } from '../constants/theme';
import { getDistrictOptions, getStateOptions } from '../data/indiaLocations';
import { crops, type CentreStatus } from '../data/mockData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { useStore } from '../store/AppStore';
import { APP_ICONS, AppIcon, type AppIconName } from '../components/AppIcon';

const STATUS_FILTERS: ('All' | CentreStatus)[] = ['All', 'Open', 'Closed'];

/** Values that actually drive the location/crop/status results (Search button). */
type AppliedFilters = {
  state: string | null;
  district: string | null;
  centreId: string | null;
  crop: string;
  status: string;
};

export default function CentresScreen() {
  const { t, fs } = useI18n();
  const { centres, slots } = useStore();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  // ---- draft selectors (what the user is picking) ----
  const [draftState, setDraftState] = useState<string | null>(null);
  const [draftDistrict, setDraftDistrict] = useState<string | null>(null);
  const [draftCentre, setDraftCentre] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // ---- applied filters (what the location/crop/status results actually use;
  //      the free-text search filters live on top of these) ----
  const [applied, setApplied] = useState<AppliedFilters>({
    state: null,
    district: null,
    centreId: null,
    crop: 'All',
    status: 'All',
  });

  // ---- cascading option lists (single source of truth: indiaLocations) ----
  const stateOptions = useMemo(() => getStateOptions(), []);
  const districtOptions = useMemo(
    () => (draftState ? getDistrictOptions(draftState) : []),
    [draftState]
  );

  const centreOptions = useMemo(() => {
    if (!draftState || !draftDistrict) return [];
    return centres
      .filter((centre) => centre.state === draftState && centre.district === draftDistrict)
      .map((centre) => ({ value: centre.id, label: centre.name }));
  }, [centres, draftState, draftDistrict]);

  // ---- cascade reset rules ----
  const handleState = (value: string) => {
    setDraftState(value || null);
    setDraftDistrict(null);
    setDraftCentre(null);
  };

  const handleDistrict = (value: string) => {
    setDraftDistrict(value || null);
    setDraftCentre(null);
  };

  const applySearch = () => {
    setApplied({
      state: draftState,
      district: draftDistrict,
      centreId: draftCentre,
      crop: cropFilter,
      status: statusFilter,
    });
  };

  const resetAll = () => {
    setDraftState(null);
    setDraftDistrict(null);
    setDraftCentre(null);
    setQuery('');
    setCropFilter('All');
    setStatusFilter('All');
    setApplied({
      state: null,
      district: null,
      centreId: null,
      crop: 'All',
      status: 'All',
    });
  };

  const filtered = useMemo(() => {
    // Free-text search is LIVE: it applies as the user types, on top of the
    // applied location/crop/status filters. Case-insensitive partial match
    // across name, district, state, full address (town/landmark) and crops.
    const q = query.trim().toLowerCase();
    return centres.filter((centre) => {
      if (applied.state && centre.state !== applied.state) return false;
      if (applied.district && centre.district !== applied.district) return false;
      if (applied.centreId && centre.id !== applied.centreId) return false;
      if (applied.crop !== 'All' && !centre.crops.includes(applied.crop)) return false;
      if (applied.status !== 'All') {
        const isOpen =
          centre.status === 'Open' || centre.status === 'Busy' || centre.status === 'Full';
        if (applied.status === 'Open' && !isOpen) return false;
        if (applied.status === 'Closed' && isOpen) return false;
      }
      if (q) {
        const haystack =
          `${centre.name} ${centre.district} ${centre.state} ${centre.address} ${centre.crops.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [centres, applied, query]);

  const slotsOpenToday = useMemo(
    () => slots.filter((s) => !s.closed && s.booked < s.capacity).length,
    [slots]
  );

  const appliedCentre = applied.centreId
    ? centres.find((centre) => centre.id === applied.centreId)
    : undefined;

  const locationSummary = applied.state
    ? `${applied.state}${applied.district ? ` › ${applied.district}` : ''}${
        appliedCentre ? ` › ${appliedCentre.name}` : ''
      }`
    : t('centres.allIndia');

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.centres') }]}>
      <SectionHeading
        title={t('centres.title')}
        subtitle={t('centres.subtitle')}
        right={
          <View style={styles.liveNotice}>
            <View style={styles.liveDot} />
            <AppIcon name={APP_ICONS.time} size={14} color={Colors.green} />
            <Text style={[styles.liveText, { fontSize: fs(11) }]}>
              {slotsOpenToday} {t('book.availableSlots')}
            </Text>
          </View>
        }
      />

      {/* Location search panel */}
      <View style={styles.panel}>
        <View style={styles.panelTitleRow}>
          <AppIcon name={APP_ICONS.location} size={15} color={Colors.primary} />
          <Text style={[styles.panelTitle, { fontSize: fs(14) }]}>{t('centres.findTitle')}</Text>
          <Text style={[styles.panelStep, { fontSize: fs(12) }]}>{t('centres.stepGuide')}</Text>
        </View>

        <View style={[styles.selectRow, !wide && styles.stack]}>
          <SearchableSelect
            label={t('centres.labelState')}
            placeholder={t('centres.selectState')}
            searchPlaceholder={t('centres.searchState')}
            icon={APP_ICONS.flag}
            value={draftState}
            options={stateOptions}
            onSelect={handleState}
            onClear={() => handleState('')}
            required
          />
          <SearchableSelect
            label={t('centres.labelDistrict')}
            placeholder={t('centres.selectDistrict')}
            searchPlaceholder={t('centres.searchDistrict')}
            icon={APP_ICONS.location}
            value={draftDistrict}
            options={districtOptions}
            onSelect={handleDistrict}
            onClear={() => handleDistrict('')}
            disabled={!draftState}
            hint={draftState ? undefined : t('centres.pickStateFirst')}
            emptyMessage={t('centres.noDistricts')}
            required
          />
          <SearchableSelect
            label={t('centres.labelCentre')}
            placeholder={t('centres.selectCentre')}
            searchPlaceholder={t('centres.searchCentre')}
            icon={APP_ICONS.business}
            value={draftCentre}
            options={centreOptions}
            onSelect={(value) => setDraftCentre(value || null)}
            onClear={() => setDraftCentre(null)}
            disabled={!draftDistrict}
            hint={draftDistrict ? undefined : t('centres.pickDistrictFirst')}
            emptyMessage={t('centres.noCentresInDistrict')}
          />
        </View>

        <View style={styles.panelDivider} />

        <View style={styles.searchFieldWrap}>
          <Text style={[styles.searchLabel, { fontSize: fs(14) }]} nativeID="centre-search-label">
            {t('centres.searchBy')}
          </Text>
          <View style={styles.searchBar}>
            <AppIcon name={APP_ICONS.search} size={17} color={Colors.textMuted} />
            <TextInput
              accessibilityLabel={t('centres.searchBy')}
              accessibilityRole="search"
              value={query}
              onChangeText={setQuery}
              placeholder={t('centres.searchBy')}
              placeholderTextColor={Colors.textMuted}
              returnKeyType="search"
              onSubmitEditing={applySearch}
              style={[styles.searchInput, { fontSize: fs(15) }]}
            />
            {query.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('centres.clearSearch')}
                onPress={() => setQuery('')}
                style={styles.searchClear}
                hitSlop={8}
              >
                <AppIcon name={APP_ICONS.close} size={13} color={Colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={[styles.chipRow, !wide && styles.stack]}>
          <FilterChips
            icon={APP_ICONS.leaf}
            label={t('centres.filterCrop')}
            options={['All', ...crops]}
            value={cropFilter}
            onChange={setCropFilter}
          />
          <FilterChips
            icon={APP_ICONS.clipboard}
            label={t('centres.filterStatus')}
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.actionGrow}>
            <Button
              label={t('centres.searchBtn')}
              onPress={applySearch}
              icon={APP_ICONS.search}
              accessibilityHint={t('centres.searchBtnHint')}
            />
          </View>
          <Button variant="outline-primary"
            label={t('centres.reset')}
            onPress={resetAll}
            icon={APP_ICONS.refresh}
            accessibilityHint={t('centres.resetHint')}
          />
        </View>
      </View>

      {/* Results */}
      <View style={styles.resultsHeader}>
        <View style={styles.resultsTitleRow}>
          <AppIcon name={APP_ICONS.business} size={15} color={Colors.primaryDark} />
          <Text style={[styles.resultsTitle, { fontSize: fs(16) }]}>{t('centres.results')}</Text>
        </View>
        <View style={styles.resultsMeta}>
          <AppIcon name={APP_ICONS.location} size={13} color={Colors.textMuted} />
          <Text style={[styles.locationSummary, { fontSize: fs(12) }]}>{locationSummary}</Text>
          <Text style={[styles.resultCount, { fontSize: fs(12) }]}>
            {filtered.length === 1
              ? t('centres.oneResult')
              : t('centres.resultsCount', { n: filtered.length })}
          </Text>
        </View>
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon={APP_ICONS.search}
          title={t('centres.noResults')}
          message={t('centres.noResultsBody')}
          action={
            <View style={styles.emptyActions}>
              {query.trim() ? (
                <Button
                  variant="outline-primary"
                  label={t('centres.clearSearch')}
                  onPress={() => setQuery('')}
                  small
                  icon={APP_ICONS.close}
                />
              ) : null}
              <Button
                variant="outline-primary"
                label={t('centres.reset')}
                onPress={resetAll}
                small
                icon={APP_ICONS.refresh}
              />
            </View>
          }
        />
      ) : (
        <View style={[styles.grid, !wide && styles.gridStack]}>
          {filtered.map((centre) => (
            <CentreCard
              key={centre.id}
              centre={centre}
              action={
                <Button
                  label={t('centres.bookHere')}
                  onPress={() => router.push(path.booking as never)}
                  small
                />
              }
            />
          ))}
        </View>
      )}
    </ScreenShell>
  );
}
  function FilterChips({
  icon,
  label,
  options,
  value,
  onChange,
}: {
  icon?: AppIconName;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { t, fs } = useI18n();
  const displayFor = (option: string) => {
    if (option === 'All') return t('centres.all');
    if (option === 'Open') return t('centres.open');
    if (option === 'Closed') return t('centres.closed');
    return option;
  };
  return (
    <View style={styles.chipGroup}>
      <View style={styles.chipGroupLabel}>
        {icon ? <AppIcon name={icon} size={13} color={Colors.textMuted} /> : null}
        <Text style={[styles.chipLabel, { fontSize: fs(12) }]}>{label}</Text>
      </View>
      <View style={styles.chipPillRow}>
        {options.map((option) => {
          const active = option === value;
          return (
            <Button
              key={option}
              variant="outline-primary"
              small
              active={active}
              label={displayFor(option)}
              accessibilityLabel={`${label}: ${displayFor(option)}`}
              onPress={() => onChange(option)}
            />
          );
        })}
      </View>
    </View>
  );
}
  const styles = StyleSheet.create({
  liveNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.greenLight,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
  liveText: {
    color: Colors.green,
    fontWeight: '800',
  },
  panel: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  panelTitle: {
    color: Colors.primaryDark,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  panelStep: {
    color: Colors.textMuted,
    fontWeight: '600',
    flexShrink: 1,
    marginLeft: 'auto',
    textAlign: 'right',
  },
  selectRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  stack: {
    flexDirection: 'column',
    width: '100%',
  },
  panelDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  searchFieldWrap: {
    width: '100%',
  },
  /* Search bar: single flex row — icon, input and clear button are all
     alignItems-centred siblings, so alignment holds at every width, font
     size and translation length (no absolute positioning). */
  searchLabel: {
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    padding: 0,
    minWidth: 0,
  },
  searchClear: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
  },
  emptyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
  },
  chipGroup: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  chipGroupLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  chipLabel: {
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  chipPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  actionGrow: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultsTitle: {
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.4,
  },
  resultsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  locationSummary: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  resultCount: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridStack: {
    flexDirection: 'column',
  },
});
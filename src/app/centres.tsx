import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import InfoCard, { MetaRow } from '../components/InfoCard';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SearchableSelect from '../components/SearchableSelect';
import SectionHeading from '../components/SectionHeading';
import StatusBadge from '../components/StatusBadge';
import { Colors, Radius, Spacing } from '../constants/theme';
import { getStateOptions, getDistrictOptions } from '../data/indiaLocations';
import { ALL_PROJECTS, type LandProject, type ProjectStatus } from '../data/landAcquisitionData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

const SECTORS = ['All', 'Highways', 'Railways', 'Industrial', 'Energy', 'Irrigation', 'Urban Infra'];
const STATUS_OPTIONS: ('All' | ProjectStatus)[] = ['All', 'Active', 'Delayed', 'Completed', 'Pending Approval'];

export default function NationalProjectsScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  // Filters state
  const [draftState, setDraftState] = useState<string | null>(null);
  const [draftDistrict, setDraftDistrict] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<LandProject | null>(ALL_PROJECTS[0]);

  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'land' | 'comp'>('name');

  const stateOptions = useMemo(() => getStateOptions(), []);
  const districtOptions = useMemo(
    () => (draftState ? getDistrictOptions(draftState) : []),
    [draftState]
  );

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_PROJECTS.filter((p) => {
      if (draftState && p.state !== draftState) return false;
      if (draftDistrict && p.district !== draftDistrict) return false;
      if (sectorFilter !== 'All' && p.sector !== sectorFilter) return false;
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (q) {
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesAgency = p.agency.toLowerCase().includes(q);
        const matchesDist = p.district.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesAgency && !matchesDist) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'land') return b.landProposedHa - a.landProposedHa;
      if (sortBy === 'comp') return b.compensationDisbursedCr - a.compensationDisbursedCr;
      return a.name.localeCompare(b.name);
    });
  }, [draftState, draftDistrict, sectorFilter, statusFilter, query, sortBy]);

  const resetFilters = () => {
    setDraftState(null);
    setDraftDistrict(null);
    setSectorFilter('All');
    setStatusFilter('All');
    setQuery('');
  };

  // Table columns as specified in prompt: Project | State | District | Land Proposed | Acquired | Compensation | Possession | Status
  const columns = [
    {
      key: 'project',
      header: 'Project',
      render: (p: LandProject) => (
        <Pressable onPress={() => setSelectedProject(p)}>
          <Text style={[styles.projName, { fontSize: fs(13) }]}>{p.name}</Text>
          <Text style={[styles.projMeta, { fontSize: fs(11) }]}>{p.code} · {p.agency}</Text>
        </Pressable>
      ),
    },
    {
      key: 'state',
      header: 'State',
      width: 100,
      render: (p: LandProject) => <Text style={[styles.cellText, { fontSize: fs(12) }]}>{p.state}</Text>,
    },
    {
      key: 'district',
      header: 'District',
      width: 110,
      render: (p: LandProject) => <Text style={[styles.cellText, { fontSize: fs(12) }]}>{p.district}</Text>,
    },
    {
      key: 'proposed',
      header: 'Proposed',
      width: 90,
      render: (p: LandProject) => <Text style={[styles.cellBold, { fontSize: fs(12) }]}>{p.landProposedHa} ha</Text>,
    },
    {
      key: 'acquired',
      header: 'Acquired',
      width: 90,
      render: (p: LandProject) => (
        <Text style={[styles.cellBold, { color: Colors.green, fontSize: fs(12) }]}>
          {p.landAcquiredHa} ha
        </Text>
      ),
    },
    {
      key: 'compensation',
      header: 'Compensation',
      width: 110,
      render: (p: LandProject) => (
        <Text style={[styles.cellText, { fontSize: fs(12) }]}>
          ₹{p.compensationDisbursedCr} / ₹{p.compensationBudgetCr} Cr
        </Text>
      ),
    },
    {
      key: 'possession',
      header: 'Possession',
      width: 90,
      render: (p: LandProject) => (
        <Text style={[styles.cellBold, { color: Colors.primaryDark, fontSize: fs(12) }]}>
          {p.possessionPercent}%
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 105,
      render: (p: LandProject) => (
        <StatusBadge
          status={p.status === 'Delayed' ? 'Cancelled' : p.status === 'Completed' ? 'Completed' : 'Upcoming'}
          translatedLabel={p.status}
          small
        />
      ),
    },
  ];

  return (
    <ScreenShell wide breadcrumbs={[{ label: 'Home', href: path.home }, { label: 'National Projects' }]}>
      <SectionHeading
        title="National Land Acquisition Projects"
        subtitle="End-to-End monitoring of central and state infrastructure corridors under RFCTLARR Act 2013."
      />

      {/* Filter Card */}
      <View style={styles.filterCard}>
        <View style={styles.filterCardHeader}>
          <Text style={[styles.filterTitle, { fontSize: fs(14) }]}>Search & Sector Filters</Text>
          <Button variant="ghost" label="Clear Filters" onPress={resetFilters} small />
        </View>

        {/* Live search input */}
        <View style={styles.searchRow}>
          <AppIcon name={APP_ICONS.search} size={16} color={Colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { fontSize: fs(13) }]}
            placeholder="Search projects by name, code, implementing agency or district..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')}>
              <AppIcon name={APP_ICONS.closeCircle} size={16} color={Colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* Cascading State & District Selectors */}
        <View style={[styles.selectRow, !wide && styles.selectRowStack]}>
          <View style={{ flex: 1 }}>
            <SearchableSelect
              label="Filter by State"
              value={draftState}
              placeholder="All States"
              options={stateOptions}
              onSelect={(val) => {
                setDraftState(val || null);
                setDraftDistrict(null);
              }}
              onClear={() => {
                setDraftState(null);
                setDraftDistrict(null);
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SearchableSelect
              label="Filter by District"
              value={draftDistrict}
              placeholder="All Districts"
              options={districtOptions}
              disabled={!draftState}
              onSelect={(val) => setDraftDistrict(val || null)}
              onClear={() => setDraftDistrict(null)}
            />
          </View>
        </View>

        {/* Sector and Status Pills */}
        <View style={styles.pillWrap}>
          <Text style={[styles.pillLabel, { fontSize: fs(11) }]}>Sector:</Text>
          <View style={styles.pills}>
            {SECTORS.map((sec) => (
              <Pressable
                key={sec}
                onPress={() => setSectorFilter(sec)}
                style={[styles.pill, sectorFilter === sec && styles.pillActive]}
              >
                <Text style={[styles.pillText, sectorFilter === sec && styles.pillTextActive, { fontSize: fs(11) }]}>
                  {sec}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.pillWrap}>
          <Text style={[styles.pillLabel, { fontSize: fs(11) }]}>Status:</Text>
          <View style={styles.pills}>
            {STATUS_OPTIONS.map((st) => (
              <Pressable
                key={st}
                onPress={() => setStatusFilter(st)}
                style={[styles.pill, statusFilter === st && styles.pillActive]}
              >
                <Text style={[styles.pillText, statusFilter === st && styles.pillTextActive, { fontSize: fs(11) }]}>
                  {st}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Selected Project Detail Modal/Card (Requirement 7: Project Detail) */}
      {selectedProject ? (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailCode, { fontSize: fs(11) }]}>
                {selectedProject.code} · {selectedProject.sector}
              </Text>
              <Text style={[styles.detailTitle, { fontSize: fs(18) }]}>
                {selectedProject.name}
              </Text>
              <Text style={[styles.detailSub, { fontSize: fs(12) }]}>
                {selectedProject.agency} · {selectedProject.tehsil}, {selectedProject.district}, {selectedProject.state}
              </Text>
            </View>
            <StatusBadge
              status={selectedProject.status === 'Delayed' ? 'Cancelled' : 'Completed'}
              translatedLabel={selectedProject.status}
            />
          </View>

          {/* 9-Stage Acquisition Progress Timeline (Proposal to Closure) */}
          <Text style={[styles.sectionSubTitle, { fontSize: fs(12) }]}>
            Acquisition Stage Progress: Proposal → Scrutiny → Approval → Notification → Award → Compensation → Possession → R&R → Closure
          </Text>
          <View style={styles.stageTrackWrap}>
            {[
              'Proposal',
              'Scrutiny',
              'Approval',
              'Notification',
              'Award',
              'Compensation',
              'Possession',
              'R&R',
              'Closure',
            ].map((stg, i) => {
              const stages = [
                'Proposal',
                'Scrutiny',
                'Approval',
                'Notification',
                'Award',
                'Compensation',
                'Possession',
                'R&R',
                'Closure',
              ];
              const curIdx = stages.indexOf(selectedProject.currentStage);
              const isPast = curIdx > i;
              const isCurrent = curIdx === i;

              return (
                <View key={stg} style={styles.stageItem}>
                  <View style={[styles.stageDot, isPast && styles.stageDotDone, isCurrent && styles.stageDotCurrent]}>
                    <Text style={[styles.stageDotText, (isPast || isCurrent) && styles.stageDotTextWhite]}>
                      {isPast ? '✓' : i + 1}
                    </Text>
                  </View>
                  <Text style={[styles.stageName, isCurrent && styles.stageNameCurrent, { fontSize: fs(10) }]}>
                    {stg}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <Text style={[styles.metricVal, { fontSize: fs(16) }]}>{selectedProject.landProposedHa} ha</Text>
              <Text style={[styles.metricLbl, { fontSize: fs(11) }]}>Land Proposed</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={[styles.metricVal, { color: Colors.green, fontSize: fs(16) }]}>
                {selectedProject.landAcquiredHa} ha
              </Text>
              <Text style={[styles.metricLbl, { fontSize: fs(11) }]}>Land Acquired</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={[styles.metricVal, { fontSize: fs(16) }]}>₹{selectedProject.compensationDisbursedCr} Cr</Text>
              <Text style={[styles.metricLbl, { fontSize: fs(11) }]}>Disbursed</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={[styles.metricVal, { color: Colors.primaryDark, fontSize: fs(16) }]}>
                {selectedProject.possessionPercent}%
              </Text>
              <Text style={[styles.metricLbl, { fontSize: fs(11) }]}>Possession</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={[styles.metricVal, { color: Colors.saffronDark, fontSize: fs(16) }]}>
                {selectedProject.rrPercent}%
              </Text>
              <Text style={[styles.metricLbl, { fontSize: fs(11) }]}>R&R Completed</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Projects Listing Table (Requirement 6) */}
      <View style={styles.tableHeaderRow}>
        <Text style={[styles.tableCount, { fontSize: fs(13) }]}>
          Showing {filteredProjects.length} Infrastructure Projects
        </Text>
        <View style={styles.sortRow}>
          <Text style={[styles.sortLabel, { fontSize: fs(12) }]}>Sort by:</Text>
          <Button
            variant={sortBy === 'name' ? 'primary' : 'outline-primary'}
            label="Name"
            onPress={() => setSortBy('name')}
            small
          />
          <Button
            variant={sortBy === 'land' ? 'primary' : 'outline-primary'}
            label="Land"
            onPress={() => setSortBy('land')}
            small
          />
          <Button
            variant={sortBy === 'comp' ? 'primary' : 'outline-primary'}
            label="Compensation"
            onPress={() => setSortBy('comp')}
            small
          />
        </View>
      </View>

      <DataTable
        columns={columns}
        rows={filteredProjects}
        rowKey={(p) => p.id}
        emptyLabel="No infrastructure projects found matching the selected filters."
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  filterCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  filterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  filterTitle: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    color: Colors.text,
  },
  selectRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  selectRowStack: {
    flexDirection: 'column',
    gap: 0,
  },
  pillWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
    gap: 8,
  },
  pillLabel: {
    color: Colors.textMuted,
    fontWeight: '700',
    minWidth: 50,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  pillActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  pillText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: Colors.white,
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderLeftWidth: 4,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  detailCode: {
    color: Colors.saffronDark,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  detailTitle: {
    color: Colors.primaryDark,
    fontWeight: '800',
    marginTop: 2,
  },
  detailSub: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionSubTitle: {
    color: Colors.textMuted,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  stageTrackWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    gap: 4,
    flexWrap: 'wrap',
  },
  stageItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 55,
  },
  stageDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stageDotDone: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  stageDotCurrent: {
    backgroundColor: Colors.saffron,
    borderColor: Colors.saffronDark,
  },
  stageDotText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  stageDotTextWhite: {
    color: Colors.white,
  },
  stageName: {
    color: Colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  stageNameCurrent: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCol: {
    alignItems: 'center',
    minWidth: 80,
  },
  metricVal: {
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  metricLbl: {
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tableCount: {
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortLabel: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  projName: {
    color: Colors.primary,
    fontWeight: '800',
  },
  projMeta: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  cellText: {
    color: Colors.text,
  },
  cellBold: {
    fontWeight: '800',
    color: Colors.text,
  },
});

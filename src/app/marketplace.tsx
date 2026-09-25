import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import InfoCard, { MetaRow } from '../components/InfoCard';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatusBadge from '../components/StatusBadge';
import { Colors, Radius, Spacing } from '../constants/theme';
import { MOCK_PARCELS, type LandParcel, type ParcelStatus } from '../data/landAcquisitionData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

const LAND_TYPES = ['All', 'Agricultural', 'Commercial', 'Residential', 'Government/Forest'];
const STATUSES: ('All' | ParcelStatus)[] = [
  'All',
  'Identified',
  'Surveyed',
  'Notified (Sec 11)',
  'Award Declared (Sec 23)',
  'Compensation Disbursed',
  'Possession Taken',
  'Transferred',
];

export default function LandParcelsScreen() {
  const { t, fs } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(MOCK_PARCELS[0]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_PARCELS.filter((p) => {
      if (selectedType !== 'All' && p.landType !== selectedType) return false;
      if (selectedStatus !== 'All' && p.acquisitionStatus !== selectedStatus) return false;
      if (q) {
        const matchSurvey = p.surveyNumber.toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        const matchVillage = p.village.toLowerCase().includes(q);
        const matchProject = p.projectName.toLowerCase().includes(q);
        if (!matchSurvey && !matchId && !matchVillage && !matchProject) return false;
      }
      return true;
    });
  }, [query, selectedType, selectedStatus]);

  // Fields: Parcel ID | Survey Number | Project | State | District | Area | Acquisition Status | Compensation Status | Possession Status | R&R Status
  const columns = [
    {
      key: 'id',
      header: 'Parcel ID',
      width: 140,
      render: (p: LandParcel) => (
        <Pressable onPress={() => setSelectedParcel(p)}>
          <Text style={[styles.parcelId, { fontSize: fs(12) }]}>{p.id}</Text>
          <Text style={[styles.villageSub, { fontSize: fs(11) }]}>{p.village}</Text>
        </Pressable>
      ),
    },
    {
      key: 'survey',
      header: 'Survey No.',
      width: 100,
      render: (p: LandParcel) => (
        <Text style={[styles.cellBold, { fontSize: fs(13) }]}>{p.surveyNumber}</Text>
      ),
    },
    {
      key: 'project',
      header: 'Project',
      render: (p: LandParcel) => (
        <View>
          <Text style={[styles.projTitle, { fontSize: fs(12) }]}>{p.projectName}</Text>
          <Text style={[styles.locationSub, { fontSize: fs(11) }]}>{p.district}, {p.state}</Text>
        </View>
      ),
    },
    {
      key: 'area',
      header: 'Area',
      width: 80,
      render: (p: LandParcel) => (
        <Text style={[styles.cellBold, { fontSize: fs(12) }]}>{p.areaHa} ha</Text>
      ),
    },
    {
      key: 'status',
      header: 'Acquisition',
      width: 130,
      render: (p: LandParcel) => (
        <StatusBadge
          status={p.acquisitionStatus.includes('Possession') || p.acquisitionStatus.includes('Transferred') ? 'Completed' : 'Upcoming'}
          translatedLabel={p.acquisitionStatus}
          small
        />
      ),
    },
    {
      key: 'comp',
      header: 'Compensation',
      width: 110,
      render: (p: LandParcel) => (
        <StatusBadge
          status={p.compensationStatus === 'Disbursed' ? 'Completed' : p.compensationStatus === 'Approved' ? 'Processing' : 'Waiting'}
          translatedLabel={p.compensationStatus}
          small
        />
      ),
    },
    {
      key: 'possession',
      header: 'Possession',
      width: 120,
      render: (p: LandParcel) => (
        <StatusBadge
          status={p.possessionStatus === 'Possession Taken' ? 'Completed' : 'Waiting'}
          translatedLabel={p.possessionStatus}
          small
        />
      ),
    },
    {
      key: 'rr',
      header: 'R&R Status',
      width: 120,
      render: (p: LandParcel) => (
        <StatusBadge
          status={p.rrStatus === 'Rehabilitated' ? 'Completed' : p.rrStatus === 'Not Applicable' ? 'On Hold' : 'Upcoming'}
          translatedLabel={p.rrStatus}
          small
        />
      ),
    },
  ];

  return (
    <ScreenShell wide breadcrumbs={[{ label: 'Home', href: path.home }, { label: 'Land Parcels' }]}>
      <SectionHeading
        title="Cadastral Land Parcels Directory"
        subtitle="Revenue survey numbers, land titles, valuation and acquisition status per parcel."
      />

      {/* Filter and Search Bar */}
      <View style={styles.filterCard}>
        <View style={styles.searchRow}>
          <AppIcon name={APP_ICONS.search} size={16} color={Colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { fontSize: fs(13) }]}
            placeholder="Search by survey number (e.g. 142/3A), parcel ID, village or project..."
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

        <View style={styles.filterRow}>
          <View style={styles.pillGroup}>
            <Text style={[styles.pillLabel, { fontSize: fs(11) }]}>Land Type:</Text>
            {LAND_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setSelectedType(t)}
                style={[styles.pill, selectedType === t && styles.pillActive]}
              >
                <Text style={[styles.pillText, selectedType === t && styles.pillTextActive, { fontSize: fs(11) }]}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Selected Parcel Inspector Panel */}
      {selectedParcel ? (
        <View style={styles.inspectorCard}>
          <View style={styles.inspectorHeader}>
            <View>
              <Text style={[styles.inspectorTag, { fontSize: fs(11) }]}>
                SURVEY NO: {selectedParcel.surveyNumber} · {selectedParcel.landType}
              </Text>
              <Text style={[styles.inspectorTitle, { fontSize: fs(18) }]}>
                Parcel {selectedParcel.id} ({selectedParcel.areaHa} ha)
              </Text>
              <Text style={[styles.inspectorSub, { fontSize: fs(12) }]}>
                {selectedParcel.village}, Tehsil {selectedParcel.tehsil}, {selectedParcel.district}, {selectedParcel.state} · Project: {selectedParcel.projectName}
              </Text>
            </View>
            <Button
              variant="outline-primary"
              label="Inspect on GIS Map"
              onPress={() => router.push(path.gis as never)}
              small
            />
          </View>

          <View style={styles.inspectorGrid}>
            <View style={styles.metaCell}>
              <Text style={[styles.metaVal, { fontSize: fs(14) }]}>{selectedParcel.landownersCount}</Text>
              <Text style={[styles.metaLbl, { fontSize: fs(11) }]}>Titleholders</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={[styles.metaVal, { color: Colors.green, fontSize: fs(14) }]}>
                ₹{selectedParcel.compensationAmountLakhs} L
              </Text>
              <Text style={[styles.metaLbl, { fontSize: fs(11) }]}>Sanctioned Valuation</Text>
            </View>
            <View style={styles.metaCell}>
              <StatusBadge status={selectedParcel.compensationStatus === 'Disbursed' ? 'Completed' : 'Waiting'} translatedLabel={selectedParcel.compensationStatus} small />
              <Text style={[styles.metaLbl, { fontSize: fs(11) }]}>Compensation Status</Text>
            </View>
            <View style={styles.metaCell}>
              <StatusBadge status={selectedParcel.possessionStatus === 'Possession Taken' ? 'Completed' : 'Waiting'} translatedLabel={selectedParcel.possessionStatus} small />
              <Text style={[styles.metaLbl, { fontSize: fs(11) }]}>Possession Status</Text>
            </View>
            <View style={styles.metaCell}>
              <StatusBadge status={selectedParcel.rrStatus === 'Rehabilitated' ? 'Completed' : 'Upcoming'} translatedLabel={selectedParcel.rrStatus} small />
              <Text style={[styles.metaLbl, { fontSize: fs(11) }]}>R&R Entitlement</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Table of Parcels */}
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.id}
        emptyLabel="No cadastral parcels match your filters."
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  pillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pillLabel: {
    color: Colors.textMuted,
    fontWeight: '700',
    marginRight: 4,
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
  inspectorCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
    borderLeftWidth: 4,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  inspectorTag: {
    color: Colors.saffronDark,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  inspectorTitle: {
    color: Colors.primaryDark,
    fontWeight: '800',
    marginTop: 2,
  },
  inspectorSub: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inspectorGrid: {
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
  metaCell: {
    alignItems: 'center',
    minWidth: 90,
  },
  metaVal: {
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  metaLbl: {
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  parcelId: {
    color: Colors.primary,
    fontWeight: '800',
  },
  villageSub: {
    color: Colors.textMuted,
  },
  cellBold: {
    fontWeight: '800',
    color: Colors.text,
  },
  projTitle: {
    fontWeight: '700',
    color: Colors.text,
  },
  locationSub: {
    color: Colors.textMuted,
  },
});

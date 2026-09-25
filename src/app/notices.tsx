import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import DataTable from '../components/DataTable';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatusBadge from '../components/StatusBadge';
import { Colors, Radius, Spacing } from '../constants/theme';
import { MOCK_DOCUMENTS, type LandDocument } from '../data/landAcquisitionData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { APP_ICONS, AppIcon } from '../components/AppIcon';

const DOC_TYPES = [
  'All',
  'Notification',
  'Award',
  'Legal',
  'Compensation',
  'Map',
  'R&R',
  'Project Document',
];

export default function DocumentManagementScreen() {
  const { t, fs } = useI18n();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_DOCUMENTS.filter((d) => {
      if (typeFilter !== 'All' && d.type !== typeFilter) return false;
      if (q) {
        const mName = d.name.toLowerCase().includes(q);
        const mProj = d.projectName.toLowerCase().includes(q);
        if (!mName && !mProj) return false;
      }
      return true;
    });
  }, [query, typeFilter]);

  // Fields: Document | Project | Type | Version | Date | Status
  const columns = [
    {
      key: 'doc',
      header: 'Document Name & ID',
      render: (d: LandDocument) => (
        <View style={styles.docCell}>
          <AppIcon name={APP_ICONS.documentText} size={18} color={Colors.primary} />
          <View>
            <Text style={[styles.docName, { fontSize: fs(13) }]}>{d.name}</Text>
            <Text style={[styles.docMeta, { fontSize: fs(11) }]}>{d.id} · {d.fileSize}</Text>
          </View>
        </View>
      ),
    },
    {
      key: 'project',
      header: 'Project Corridor',
      render: (d: LandDocument) => (
        <Text style={[styles.projText, { fontSize: fs(12) }]}>{d.projectName}</Text>
      ),
    },
    {
      key: 'type',
      header: 'Category Type',
      width: 130,
      render: (d: LandDocument) => (
        <Text style={[styles.typeBadge, { fontSize: fs(11) }]}>{d.type}</Text>
      ),
    },
    {
      key: 'version',
      header: 'Version',
      width: 80,
      render: (d: LandDocument) => (
        <Text style={[styles.versionText, { fontSize: fs(12) }]}>{d.version}</Text>
      ),
    },
    {
      key: 'date',
      header: 'Gazetted Date',
      width: 110,
      render: (d: LandDocument) => (
        <Text style={[styles.dateText, { fontSize: fs(11) }]}>{d.date}</Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 120,
      render: (d: LandDocument) => (
        <StatusBadge
          status={d.status === 'Verified' ? 'Completed' : 'Waiting'}
          translatedLabel={d.status}
          small
        />
      ),
    },
  ];

  return (
    <ScreenShell wide breadcrumbs={[{ label: 'Home', href: path.home }, { label: 'Documents & Gazette' }]}>
      <SectionHeading
        title="National Document & Gazette Management"
        subtitle="Repository of preliminary notifications, declaration orders, award statements, High Court orders and R&R schemes."
      />

      {/* Filter and Search Bar */}
      <View style={styles.filterCard}>
        <View style={styles.searchRow}>
          <AppIcon name={APP_ICONS.search} size={16} color={Colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { fontSize: fs(13) }]}
            placeholder="Search gazette notifications, awards, SIA reports or project documents..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.pillRow}>
          <Text style={[styles.pillLabel, { fontSize: fs(11) }]}>Category:</Text>
          {DOC_TYPES.map((type) => (
            <Pressable
              key={type}
              onPress={() => setTypeFilter(type)}
              style={[styles.pill, typeFilter === type && styles.pillActive]}
            >
              <Text style={[styles.pillText, typeFilter === type && styles.pillTextActive, { fontSize: fs(11) }]}>
                {type}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(d) => d.id}
        emptyLabel="No documents found."
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
    gap: Spacing.sm,
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
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    color: Colors.text,
  },
  pillRow: {
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
  docCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  docName: {
    fontWeight: '700',
    color: Colors.primary,
  },
  docMeta: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  projText: {
    color: Colors.text,
    fontWeight: '600',
  },
  typeBadge: {
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  versionText: {
    color: Colors.textMuted,
    fontWeight: '700',
  },
  dateText: {
    color: Colors.textSecondary,
  },
});

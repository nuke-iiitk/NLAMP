import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import ChoiceChips from '../components/ChoiceChips';
import InfoCard, { MetaRow } from '../components/InfoCard';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatusBadge from '../components/StatusBadge';
import { Colors, Radius, Spacing } from '../constants/theme';
import { LANGUAGES, useI18n, type LanguageCode, type TextSizeLevel } from '../i18n';
import { path } from '../navigation';
import { useStore } from '../store/AppStore';

/**
 * Authority Node Profile — role configuration, jurisdiction scope,
 * language/accessibility preferences. Same layout as before, new domain.
 */
export default function ProfileScreen() {
  const { t, fs, language, setLanguage, textSize, setTextSize } = useI18n();
  const { farmer, auth, logout } = useStore();
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const [activeScope, setActiveScope] = useState('Central Ministry');

  const officerName = farmer?.name ?? 'Demo Nodal Officer';
  const scopes = ['Central Ministry', 'State Government', 'District Authority', 'Project Implementing Agency', 'Policy Maker'];

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.profile') }]}>
      <SectionHeading title="Authority Node Profile & Administration Scope" subtitle="Nodal officer identity, jurisdiction scope and portal preferences." />

      <View style={[styles.grid, wide && styles.gridRow]}>
        <View style={styles.col}>
          <InfoCard title="Nodal Officer Identity" accent={Colors.saffron}>
            <MetaRow label="Officer Name" value={officerName} />
            <MetaRow label="Service ID" value={farmer?.id ?? 'NLAMS-OFF-2026-0142'} />
            <MetaRow label="Official Mobile" value={farmer?.mobile ?? '9876543210'} />
            <MetaRow label="Jurisdiction State" value={farmer?.state ?? 'Kerala'} />
            <MetaRow label="Jurisdiction District" value={farmer?.district ?? 'Kottayam'} />
            <View style={styles.spacer} />
            <StatusBadge status="Completed" translatedLabel="Verified via Parichay" small />
          </InfoCard>

          <InfoCard title="Active Monitoring Scope (Role Switcher)">
            <Text style={[styles.hint, { fontSize: fs(13) }]}>Same role switcher as the national dashboard — changing scope re-filters KPIs, projects and reports.</Text>
            <View style={styles.scopeWrap}>
              {scopes.map((s) => (
                <Button key={s} label={s} small variant={activeScope === s ? 'primary' : 'outline-secondary'} onPress={() => setActiveScope(s)} />
              ))}
            </View>
            <MetaRow label="Active Scope" value={activeScope} />
            <MetaRow label="Data Visibility" value={activeScope === 'Central Ministry' ? 'All 8 national corridor projects' : activeScope === 'State Government' ? 'State-filtered corridor subset' : 'District / agency filtered subset'} />
          </InfoCard>
        </View>

        <View style={styles.col}>
          <InfoCard title={t('profile.preferences')}>
            <Text style={[styles.section, { fontSize: fs(13) }]}>{t('profile.language')}</Text>
            <ChoiceChips
              items={LANGUAGES.map((lang) => ({ id: lang.code, label: lang.native }))}
              value={language}
              onChange={(id) => setLanguage(id as LanguageCode)}
            />
            <Text style={[styles.section, { fontSize: fs(13) }]}>{t('profile.textSize')}</Text>
            <ChoiceChips
              items={[
                { id: 'small', label: `A- ${t('profile.textSmall')}` },
                { id: 'normal', label: `A ${t('profile.textNormal')}` },
                { id: 'large', label: `A+ ${t('profile.textLarge')}` },
              ]}
              value={textSize}
              onChange={(id) => setTextSize(id as TextSizeLevel)}
            />
          </InfoCard>

          <View style={styles.spacer} />
          <Button label={t('nav.logout')} onPress={() => { logout(); router.replace('/'); }} variant="danger" />
          <View style={styles.spacer} />
          <Button label={t('dash.qaBook')} onPress={() => router.push(path.booking as never)} />
        </View>
      </View>
      {auth.role}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: { gap: Spacing.md },
  gridRow: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { flex: 1 },
  body: { color: Colors.textSecondary, lineHeight: 22 },
  hint: { color: Colors.textSecondary, marginBottom: Spacing.sm },
  section: { fontWeight: '700', color: Colors.text, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  spacer: { height: Spacing.md },
  scopeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  option: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.white, minHeight: 36, justifyContent: 'center' },
});

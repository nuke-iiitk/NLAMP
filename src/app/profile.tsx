import { router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import ChoiceChips from '../components/ChoiceChips';
import InfoCard, { MetaRow } from '../components/InfoCard';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import { Colors, Radius, Spacing } from '../constants/theme';
import { LANGUAGES, useI18n, type LanguageCode, type TextSizeLevel } from '../i18n';
import { path } from '../navigation';
import { useStore } from '../store/AppStore';

export default function ProfileScreen() {
  const { t, fs, language, setLanguage, textSize, setTextSize } = useI18n();
  const { farmer, auth, logout, centres } = useStore();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  const centre = farmer ? centres.find((c) => c.id === farmer.preferredCentreId) : undefined;

  if (auth.role !== 'farmer' || !farmer) {
    return (
      <ScreenShell breadcrumbs={[{ label: t('nav.profile') }]}>
        <SectionHeading title={t('profile.title')} />
        <InfoCard>
          <Text style={[styles.body, { fontSize: fs(15) }]}>{t('profile.needLogin')}</Text>
          <View style={styles.spacer} />
          <Button label={t('nav.login')} onPress={() => router.push(path.login as never)} />
        </InfoCard>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.profile') }]}>
      <SectionHeading title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <View style={[styles.grid, wide && styles.gridRow]}>
        <View style={styles.col}>
          <InfoCard title={t('profile.personal')} accent={Colors.saffron}>
            <MetaRow label={t('reg.name')} value={farmer.name} />
            <MetaRow label={t('reg.mobile')} value={farmer.mobile} />
            <MetaRow label="Farmer ID" value={farmer.id} />
            <MetaRow label={t('reg.aadhaar')} value={`•••• •••• ${farmer.aadhaar.slice(-4)}`} />
            <MetaRow label={t('reg.dob')} value={farmer.dateOfBirth} />
          </InfoCard>

          <InfoCard title={t('profile.address')}>
            <MetaRow label={t('reg.state')} value={farmer.state} />
            <MetaRow label={t('reg.district')} value={farmer.district} />
            <MetaRow label={t('reg.village')} value={farmer.village} />
            <MetaRow label={t('reg.address')} value={farmer.address || '—'} />
          </InfoCard>
        </View>

<View style={styles.col}>
          <InfoCard title={t('profile.farm')}>
            <MetaRow label={t('reg.crop')} value={farmer.crop} />
            <MetaRow label={t('reg.quantity')} value={`${farmer.quantityKg} kg`} />
            <MetaRow label={t('reg.land')} value={`${farmer.landSizeAcres} acres`} />
            <MetaRow label={t('reg.centre')} value={centre?.name ?? '—'} />
          </InfoCard>

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
                { id: 'small', label: `A− ${t('profile.textSmall')}` },
                { id: 'normal', label: `A ${t('profile.textNormal')}` },
                { id: 'large', label: `A+ ${t('profile.textLarge')}` },
              ]}
              value={textSize}
              onChange={(id) => setTextSize(id as TextSizeLevel)}
            />
          </InfoCard>

          <View style={styles.spacer} />
          <Button
            label={t('nav.logout')}
            onPress={() => {
              logout();
              router.replace('/');
            }}
            variant="danger"
          />

          <View style={styles.spacer} />
          <Button label={t('dash.qaBook')} onPress={() => router.push(path.booking as never)} />
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  col: {
    flex: 1,
  },
  body: {
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    minHeight: 36,
    justifyContent: 'center',
  },
  optionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  optionText: {
    color: Colors.text,
    fontWeight: '700',
  },
  optionTextActive: {
    color: Colors.primary,
  },
  spacer: {
    height: Spacing.sm,
  },
});
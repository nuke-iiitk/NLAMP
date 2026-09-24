import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AlertBanner from '../components/AlertBanner';
import Button from '../components/Button';
import InfoCard, { MetaRow } from '../components/InfoCard';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import { Colors, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';
import { path } from '../navigation';

const PRICES = [
  { crop: 'Paddy', market: '₹2,300', msp: '₹2,283', centre: 'Kottayam Procurement Centre', unit: 'Quintal', updated: 'Today, 09:30' },
  { crop: 'Wheat', market: '₹2,275', msp: '₹2,275', centre: 'Ludhiana Grain Market Centre', unit: 'Quintal', updated: 'Today, 09:20' },
  { crop: 'Maize', market: '₹2,400', msp: '₹2,100', centre: 'Coimbatore Procurement Centre', unit: 'Quintal', updated: 'Today, 09:10' },
  { crop: 'Coconut', market: '₹11,000', msp: 'Not applicable', centre: 'Alappuzha Procurement Centre', unit: 'Quintal', updated: 'Today, 08:50' },
];

export default function PricesScreen() {
  const { t, fs } = useI18n();
  const [crop, setCrop] = useState('All');
  const shown = crop === 'All' ? PRICES : PRICES.filter((item) => item.crop === crop);
  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.prices') }]}>
      <SectionHeading title={t('prices.title')} subtitle={t('prices.subtitle')} />
      <AlertBanner tone="warning" title={t('common.mockData')} message={t('prices.disclaimer')} />
      <InfoCard title={t('prices.filters')}>
        <View style={styles.chips}>
          {['All', 'Paddy', 'Wheat', 'Maize', 'Coconut'].map((item) => (
            <Button key={item} small label={item} variant={crop === item ? 'primary' : 'outline-secondary'} onPress={() => setCrop(item)} />
          ))}
        </View>
      </InfoCard>
      <View style={styles.list}>
        {shown.map((item) => (
          <InfoCard key={item.crop} accent={Colors.green} title={item.crop}>
            <Text style={[styles.price, { fontSize: fs(30) }]}>{item.market}</Text>
            <Text style={styles.unit}>{item.unit}</Text>
            <MetaRow label={t('prices.msp')} value={item.msp} />
            <MetaRow label={t('prices.centre')} value={item.centre} />
            <MetaRow label={t('prices.updated')} value={item.updated} />
          </InfoCard>
        ))}
      </View>
      <Button label={t('prices.findCentre')} onPress={() => router.push(path.centres)} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  list: { gap: 0 },
  price: { color: Colors.primary, fontWeight: '800' },
  unit: { color: Colors.textSecondary, marginBottom: Spacing.md },
});

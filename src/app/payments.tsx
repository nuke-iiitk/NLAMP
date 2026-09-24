import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import AlertBanner from '../components/AlertBanner';
import Button from '../components/Button';
import InfoCard, { MetaRow } from '../components/InfoCard';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import StatusBadge from '../components/StatusBadge';
import { Colors, Spacing } from '../constants/theme';
import { useI18n } from '../i18n';
import { path } from '../navigation';

export default function PaymentsScreen() {
  const { t, fs } = useI18n();
  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.payments') }]}>
      <SectionHeading title={t('payments.title')} subtitle={t('payments.subtitle')} />
      <AlertBanner tone="warning" title={t('common.mockData')} message={t('payments.disclaimer')} />
      <InfoCard title={t('payments.latest')}>
        <View style={styles.row}>
          <View><Text style={[styles.amount, { fontSize: fs(30) }]}>₹18,450</Text><Text style={styles.status}>{t('payments.processing')}</Text></View>
          <StatusBadge status="Processing" />
        </View>
        <MetaRow label={t('payments.expected')} value={t('payments.expectedValue')} />
      </InfoCard>
      <InfoCard title={t('payments.breakdown')}>
        <MetaRow label={t('payments.value')} value="₹20,000" />
        <MetaRow label={t('payments.deductions')} value="₹1,550" />
        <MetaRow label={t('payments.net')} value="₹18,450" />
      </InfoCard>
      <View style={styles.actions}>
        <Button label={t('payments.details')} onPress={() => router.push(path.bookings)} />
        <Button variant="outline-primary" label={t('payments.receipt')} onPress={() => router.push(path.bookings)} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  amount: { color: Colors.primary, fontWeight: '800' },
  status: { color: Colors.textSecondary, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
});

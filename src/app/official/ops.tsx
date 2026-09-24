import { StyleSheet, Text, View } from 'react-native';

import AlertBanner from '../../components/AlertBanner';
import Button from '../../components/Button';
import InfoCard from '../../components/InfoCard';
import OfficialShell from '../../components/OfficialShell';
import SectionHeading from '../../components/SectionHeading';
import { Colors, Spacing } from '../../constants/theme';
import { useI18n } from '../../i18n';
import { useStore } from '../../store/AppStore';

export default function DemoOperationsPanel() {
  const { t, fs } = useI18n();
  const { pass, setCentreDelay, setCentreClosed, reduceCentreCapacity, recoverQueue, markPassNoShow, advanceQueue, officerCentreId } = useStore();
  if (!pass) return <OfficialShell><SectionHeading title={t('pass.operator')} /><AlertBanner tone="neutral" message={t('queue.noActive')} /></OfficialShell>;
  return <OfficialShell>
    <SectionHeading title={t('pass.operator')} subtitle={t('pass.operatorHint')} />
    <AlertBanner tone="warning" message={t('common.demoNote')} />
    <InfoCard title={`${pass.centreName} · ${pass.token}`}>
      <Text style={[styles.meta, { fontSize: fs(13) }]}>{t('pass.arrival')}: {pass.arrivalStart}–{pass.arrivalEnd}</Text>
      <Text style={[styles.meta, { fontSize: fs(13) }]}>{t('pass.position')}: {pass.position} · {t('pass.wait')}: {pass.waitMinutes} min</Text>
      <Text style={[styles.meta, { fontSize: fs(13) }]}>{t('pass.next')}: {pass.nextAction}</Text>
    </InfoCard>
    <View style={styles.actions}>
      <Button label={t('pass.serve')} onPress={() => advanceQueue(officerCentreId)} />
      <Button label={`${t('pass.delay')} +30`} onPress={() => setCentreDelay(30)} />
      <Button label={`${t('pass.closeCentre')}: ${pass.operations.closed ? 'ON' : 'OFF'}`} onPress={() => setCentreClosed(!pass.operations.closed)} />
      <Button label={`${t('pass.reduce')} −10`} onPress={() => reduceCentreCapacity(10)} />
      <Button label={t('pass.recover')} onPress={recoverQueue} />
      <Button variant="danger" label={t('pass.noShow')} onPress={markPassNoShow} />
    </View>
  </OfficialShell>;
}

const styles = StyleSheet.create({ actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }, meta: { color: Colors.text, marginBottom: 6 } });

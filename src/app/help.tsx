import { Linking, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import AlertBanner from '../components/AlertBanner';
import InfoCard from '../components/InfoCard';
import Button from '../components/Button';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import FormField from '../components/FormField';
import { APP_ICONS, AppIcon } from '../components/AppIcon';
import { Colors, Spacing } from '../constants/theme';
import { HELPLINE } from '../data/mockData';
import { useI18n } from '../i18n';

const FAQS = [
  { q: 'help.faq1Q' as const, a: 'help.faq1A' as const },
  { q: 'help.faq2Q' as const, a: 'help.faq2A' as const },
  { q: 'help.faq3Q' as const, a: 'help.faq3A' as const },
];

export default function HelpScreen() {
  const { t, fs } = useI18n();
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.help') }]}>
      <SectionHeading title={t('help.title')} subtitle={t('help.subtitle')} />

      <InfoCard title={t('help.helpline')} accent={Colors.saffron}>
        <Text style={[styles.headline, { fontSize: fs(24) }]}>{HELPLINE}</Text>
        <Text style={[styles.bodyText, { fontSize: fs(13) }]}>{t('help.hours')}</Text>
        <View style={styles.callAction}>
          <Button
            variant="primary"
            icon={APP_ICONS.phonePortrait}
            label={t('help.call')}
            onPress={() => Linking.openURL(`tel:${HELPLINE.replace(/[^0-9]/g, '')}`)}
          />
        </View>
      </InfoCard>

      <InfoCard title={t('help.docs')}>
        {['help.doc1', 'help.doc2', 'help.doc3', 'help.doc4'].map((key) => (
          <View key={key} style={styles.docRow}>
            <AppIcon name={APP_ICONS.checkmark} size={14} color={Colors.green} />
            <Text style={[styles.bodyText, { fontSize: fs(14) }]}>{t(key as never)}</Text>
          </View>
        ))}
      </InfoCard>

      <SectionHeading title={t('help.faq')} />
      {FAQS.map((faq) => (
        <InfoCard key={faq.q}>
          <Text style={[styles.faqQ, { fontSize: fs(15) }]}>{t(faq.q)}</Text>
          <Text style={[styles.bodyText, { fontSize: fs(14) }]}>{t(faq.a)}</Text>
        </InfoCard>
      ))}

      <SectionHeading title={t('help.feedback')} />
      <InfoCard>
        <FormField
          label={t('help.feedbackMsg')}
          value={message}
          onChangeText={setMessage}
          placeholder="…"
          multiline
        />
        <Button
          label={t('help.feedback')}
          onPress={() => {
            setSent(true);
            setMessage('');
          }}
          disabled={!message.trim()}
        />
        {sent ? (
          <View style={styles.spacerTop}>
            <AlertBanner tone="success" message={t('help.feedbackSent')} />
          </View>
        ) : null}
      </InfoCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headline: {
    color: Colors.primary,
    fontWeight: '800',
    marginBottom: 4,
  },
  bodyText: {
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  callAction: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  faqQ: {
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  spacerTop: {
    marginTop: Spacing.md,
  },
});

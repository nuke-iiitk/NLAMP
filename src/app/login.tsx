import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import AlertBanner from '../components/AlertBanner';
import FormField from '../components/FormField';
import Button from '../components/Button';
import ChoiceChips from '../components/ChoiceChips';
import ScreenShell from '../components/ScreenShell';
import SectionHeading from '../components/SectionHeading';
import { Colors, Radius, Spacing } from '../constants/theme';
import { DEMO_MOBILE } from '../data/mockData';
import { useI18n } from '../i18n';
import { path } from '../navigation';
import { useStore } from '../store/AppStore';
import { APP_ICONS } from '../components/AppIcon';

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCaptcha(): string {
  let out = '';
  for (let i = 0; i < 5; i += 1) {
    out += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return out;
}

export default function LoginScreen() {
  const { t, fs } = useI18n();
  const { loginFarmer, loginDemoFarmer } = useStore();

  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [mobile, setMobile] = useState(DEMO_MOBILE);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [errors, setErrors] = useState<{ mobile?: string; secret?: string; captcha?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    const nextErrors: typeof errors = {};
    if (!/^[6-9]\d{9}$/.test(mobile)) nextErrors.mobile = t('login.errMobile');
    if (mode === 'password' && password.length < 4) nextErrors.secret = t('login.errPassword');
    if (mode === 'otp' && otp.length !== 6) nextErrors.secret = t('login.errOtp');
    if (captchaInput.trim().toUpperCase() !== captcha) {
      nextErrors.captcha = t('login.errCaptcha');
    }
    setErrors(nextErrors);
    setSubmitted(true);
    if (Object.keys(nextErrors).length > 0) return;

    void (async () => {
      const result = await loginFarmer(
        mobile,
        mode === 'password' ? password : undefined,
        mode === 'otp' ? otp : undefined
      );
      if (!result.ok) {
        const key = result.error ?? 'login.errOtp';
        setErrors({ secret: t(key as never) });
        return;
      }
      router.replace(path.dashboard as never);
    })();
  }

  return (
    <ScreenShell breadcrumbs={[{ label: t('nav.login') }]}>
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardHeaderText, { fontSize: fs(14) }]}>{t('common.appName')}</Text>
            <Text style={[styles.cardHeaderSub, { fontSize: fs(11) }]}>{t('common.gov')}</Text>
          </View>
          <View style={styles.cardBody}>
            <SectionHeading title={t('login.title')} subtitle={t('login.subtitle')} />

          {/* Sign-in method */}
          <ChoiceChips
            items={[
              { id: 'password', label: t('login.modePassword') },
              { id: 'otp', label: t('login.modeOtp') },
            ]}
            value={mode}
            onChange={(id) => setMode(id as 'password' | 'otp')}
          />

          <FormField
            label={t('login.mobile')}
            value={mobile}
            onChangeText={(value) => setMobile(value.replace(/\D/g, '').slice(0, 10))}
            placeholder={t('login.mobilePlaceholder')}
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.mobile}
            required
          />

          {mode === 'password' ? (
            <FormField
              label={t('login.password')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('login.passwordPlaceholder')}
              secure
              error={errors.secret}
              required
            />
          ) : (
            <>
              <FormField
                label={t('login.otp')}
                value={otp}
                onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
                keyboardType="numeric"
                maxLength={6}
                placeholder="••••••"
                error={errors.secret}
                required
              />
              {otpSent ? <AlertBanner tone="info" message={t('login.otpSent')} /> : null}
              <Button variant="outline-primary"
                label={otpSent ? t('login.otpResend') : t('login.otpSend')}
                onPress={() => setOtpSent(true)}
                small
              />
              <View style={styles.spacerSm} />
            </>
          )}

{/* Mock captcha */}
          <View style={styles.captchaBlock}>
            <Text style={[styles.captchaLabel, { fontSize: fs(13) }]}>{t('login.captcha')}</Text>
            <View style={styles.captchaRow}>
              <Text style={[styles.captchaCode, { fontSize: fs(18) }]}>{captcha}</Text>
              <Button
                variant="outline-secondary"
                icon={APP_ICONS.refresh}
                iconOnly
                label={t('login.captchaRefresh')}
                accessibilityLabel={t('login.captchaRefresh')}
                onPress={() => setCaptcha(generateCaptcha())}
              />
            </View>
            <FormField
              label={t('login.captchaInput')}
              value={captchaInput}
              onChangeText={(value) =>
                setCaptchaInput(value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5))
              }
              placeholder="•••••"
              error={errors.captcha}
              hint={t('login.captchaNote')}
            />
          </View>

          {submitted && Object.keys(errors).length > 0 ? (
            <AlertBanner tone="error" message={t('common.required')} />
          ) : null}

          <View style={styles.spacerSm} />
          <Button label={t('login.btn')} onPress={submit} />

          <Button
            variant="link"
            small
            label={t('login.forgot')}
            onPress={() => Alert.alert(t('login.forgot'), t('login.forgotNote'))}
          />
          <Text style={[styles.forgotNote, { fontSize: fs(11) }]}>{t('login.forgotNote')}</Text>

          <View style={styles.divider} />
          <Button variant="outline-primary"
            label={t('login.demoBtn')}
            onPress={() => {
              loginDemoFarmer();
              router.replace(path.dashboard as never);
            }}
          />
          <Text style={[styles.demoHint, { fontSize: fs(11) }]}>{t('login.demoHint')}</Text>

          <Button variant="link" href={path.register} label={t('login.newFarmer')} />
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    padding: 0,
  },
  cardHeader: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  cardHeaderText: {
    color: Colors.white,
    fontWeight: '800',
    letterSpacing: 2,
  },
  cardHeaderSub: {
    color: Colors.saffronLight,
    marginTop: 2,
    textAlign: 'center',
  },
  cardBody: {
    padding: Spacing.xl,
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  captchaBlock: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  captchaLabel: {
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  captchaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  captchaCode: {
    fontWeight: '800',
    color: Colors.saffronDark,
    backgroundColor: '#fff7e6',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    letterSpacing: 6,
  },
  forgotNote: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  demoHint: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 16,
  },
  spacerSm: {
    height: Spacing.sm,
  },
});
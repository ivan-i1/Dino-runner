import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';

import { Button } from '@/components/Button';
import { ChoiceRow } from '@/components/Rows';
import { Screen, Section } from '@/components/Screen';
import { Text } from '@/components/Text';
import { radius, spacing } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { getProvider, isApiConfigured, RateLimitError, type ProviderKind } from '@/engines/api';

export default function ApiDemo() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [kind, setKind] = useState<ProviderKind>(isApiConfigured() ? 'http' : 'fake');
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const send = async () => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setAnswer('');
    setError(null);
    setBusy(true);
    try {
      const provider = getProvider(kind);
      const stream = provider.stream({ messages: [{ role: 'user', content: prompt }], locale: i18n.language }, controller.signal);
      for await (const chunk of stream) setAnswer((a) => a + chunk);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError(
        err instanceof RateLimitError
          ? t('api.rateLimited', { seconds: Math.ceil((err.retryAfterMs ?? 60_000) / 1000) })
          : t('api.error', { message: (err as Error).message })
      );
    } finally {
      if (abort.current === controller) setBusy(false);
    }
  };

  return (
    <Screen>
      <Section>
        <ChoiceRow
          label={t('api.provider')}
          value={kind}
          onChange={setKind}
          options={[
            { value: 'fake', label: t('api.fake') },
            { value: 'http', label: t('api.http') },
          ]}
        />
        {kind === 'http' && !isApiConfigured() && <Text variant="caption">{t('api.notConfigured')}</Text>}
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder={t('api.prompt')}
          placeholderTextColor={colors.textMuted}
          style={{ color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: radius.sm, padding: spacing.sm + 4 }}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Button label={busy ? t('common.loading') : t('api.send')} disabled={busy || (kind === 'http' && !isApiConfigured())} onPress={send} />
      </Section>
      {(answer || error) && (
        <Section>
          {answer ? <Text>{answer}</Text> : null}
          {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        </Section>
      )}
    </Screen>
  );
}

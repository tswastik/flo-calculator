import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/gradient-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUser } from '@/hooks/use-user-store';

export function UserOnboarding() {
  const theme = useTheme();
  const { addUser } = useUser();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addUser(name);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Welcome
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.intro}>
            Let&apos;s set up your profile. Up to 3 people can share this device, each with their
            own private calculator and history.
          </ThemedText>

          <View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              What should we call you?
            </ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.textSecondary}
              autoFocus={Platform.OS !== 'web'}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            />
          </View>

          <GradientButton
            label={submitting ? 'Setting up…' : 'Get started'}
            onPress={handleSubmit}
            disabled={!name.trim() || submitting}
          />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.five,
    gap: Spacing.four,
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
  },
  intro: {
    lineHeight: 20,
  },
  label: {
    marginBottom: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
});

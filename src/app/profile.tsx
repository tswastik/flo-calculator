import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/gradient-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUser } from '@/hooks/use-user-store';
import { MAX_USERS } from '@/lib/storage';
import { UserProfile } from '@/lib/types';

export default function ProfileScreen() {
  const theme = useTheme();
  const { users, activeUser, addUser, switchUser, removeUser } = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const atLimit = users.length >= MAX_USERS;

  const handleAdd = async () => {
    if (!newName.trim() || submitting || atLimit) return;
    setSubmitting(true);
    try {
      await addUser(newName);
      setNewName('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await removeUser(id);
    setConfirmDeleteId(null);
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.scrollContent, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Profiles</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Up to {MAX_USERS} people can share this device. Each profile keeps its own calculator
          defaults and cycle history, private from the others.
        </ThemedText>

        <View style={styles.list}>
          {users.map((user) => (
            <ProfileRow
              key={user.id}
              user={user}
              isActive={user.id === activeUser?.id}
              confirming={confirmDeleteId === user.id}
              onSelect={() => switchUser(user.id)}
              onRequestDelete={() => setConfirmDeleteId(user.id)}
              onCancelDelete={() => setConfirmDeleteId(null)}
              onConfirmDelete={() => handleDelete(user.id)}
            />
          ))}
        </View>

        {atLimit ? (
          <ThemedView type="backgroundElement" style={styles.limitNotice}>
            <ThemedText type="small" themeColor="textSecondary">
              You&apos;ve reached the {MAX_USERS} profile limit on this device. Delete a profile to
              add a new one.
            </ThemedText>
          </ThemedView>
        ) : (
          <View style={styles.addSection}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.addLabel}>
              Add a profile
            </ThemedText>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Name"
              placeholderTextColor={theme.textSecondary}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            />
            <GradientButton
              label={submitting ? 'Adding…' : 'Add profile'}
              onPress={handleAdd}
              disabled={!newName.trim() || submitting}
            />
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

type ProfileRowProps = {
  user: UserProfile;
  isActive: boolean;
  confirming: boolean;
  onSelect: () => void;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
};

function ProfileRow({
  user,
  isActive,
  confirming,
  onSelect,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: ProfileRowProps) {
  const theme = useTheme();

  return (
    <ThemedView
      type="card"
      style={[styles.row, { borderColor: isActive ? theme.primary : theme.border }]}>
      <Pressable style={styles.rowMain} onPress={onSelect} disabled={isActive}>
        <View style={[styles.avatar, { backgroundColor: isActive ? theme.primary : theme.backgroundElement }]}>
          <ThemedText type="smallBold" style={isActive ? { color: '#ffffff' } : undefined}>
            {user.name.trim().charAt(0).toUpperCase() || '?'}
          </ThemedText>
        </View>
        <View style={styles.rowText}>
          <ThemedText type="smallBold">{user.name}</ThemedText>
          <ThemedText type="small" themeColor={isActive ? 'primary' : 'textSecondary'}>
            {isActive ? 'Active profile' : 'Tap to switch'}
          </ThemedText>
        </View>
      </Pressable>

      {confirming ? (
        <View style={styles.confirmRow}>
          <Pressable onPress={onCancelDelete} style={styles.confirmButton}>
            <ThemedText type="small" themeColor="textSecondary">
              Cancel
            </ThemedText>
          </Pressable>
          <Pressable onPress={onConfirmDelete} style={styles.confirmButton}>
            <ThemedText type="small" style={{ color: theme.irregular }}>
              Delete
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onRequestDelete} hitSlop={12} style={({ pressed }) => pressed && styles.pressed}>
          <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={18} tintColor={theme.textSecondary} />
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  list: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    gap: 2,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  confirmButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  pressed: {
    opacity: 0.6,
  },
  limitNotice: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
  },
  addSection: {
    gap: Spacing.three,
  },
  addLabel: {
    marginBottom: -Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
});

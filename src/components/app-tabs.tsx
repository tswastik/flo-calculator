import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="calculator" href="/" asChild>
            <TabButton icon={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}>
              Calculator
            </TabButton>
          </TabTrigger>
          <TabTrigger name="history" href="/history" asChild>
            <TabButton icon={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }}>
              History
            </TabButton>
          </TabTrigger>
          <TabTrigger name="faq" href="/faq" asChild>
            <TabButton icon={{ ios: 'questionmark.circle', android: 'help', web: 'help' }}>FAQ</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: SymbolViewProps['name'] };

export function TabButton({ children, isFocused, icon, ...props }: TabButtonProps) {
  const theme = useTheme();

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <SymbolView name={icon} size={20} tintColor={isFocused ? theme.primary : theme.textSecondary} />
      <ThemedText type="small" themeColor={isFocused ? 'primary' : 'textSecondary'}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const theme = useTheme();

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="card" style={[styles.innerContainer, { borderColor: theme.border }]}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderRadius: Spacing.five,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  tabButton: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});

import { useEffect, type ComponentType } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import { useMenu, useTopMenu } from './menuStore';
import type { MenuId } from './menuModel';

/** A menu is a plain component; it closes or navigates through useMenu(). */
export type MenuRegistry = Record<MenuId, ComponentType>;

/**
 * View for the menu system. Mount one per screen that has menus, with that screen's
 * registry. Renders the top of the stack as a modal card over the screen; Android back
 * and tapping the scrim go back one level. Unmounting closes everything, so a menu never
 * leaks onto the next screen.
 */
export function MenuHost({ menus, dismissible = true }: { menus: MenuRegistry; dismissible?: boolean }) {
  const top = useTopMenu();
  const back = useMenu((s) => s.back);
  const { colors } = useTheme();

  useEffect(() => () => useMenu.getState().closeAll(), []);
  useEffect(() => {
    if (!top) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      back();
      return true;
    });
    return () => sub.remove();
  }, [top, back]);

  const Menu = top ? menus[top] : undefined;
  if (!Menu) return null;
  return (
    <View style={[StyleSheet.absoluteFill, styles.center]} accessibilityViewIsModal>
      <Pressable
        accessibilityLabel="Close menu"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
        onPress={dismissible ? back : undefined}
      />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Menu />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 420, maxHeight: '85%', borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.md },
});

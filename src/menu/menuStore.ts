import { create } from 'zustand';

import { initialMenuState, menuReducer, topMenu, type MenuAction, type MenuId, type MenuState } from './menuModel';

type MenuStore = MenuState & {
  dispatch: (action: MenuAction) => void;
  open: (id: MenuId) => void;
  replace: (id: MenuId) => void;
  back: () => void;
  closeAll: () => void;
};

/**
 * Controller for in-app menus (pause, options, confirm dialogs…). Screens and game
 * loops call open/back/closeAll; MenuHost renders whatever is on top. Game loops can
 * check `isMenuOpen()` synchronously to pause themselves.
 */
export const useMenu = create<MenuStore>()((set, get) => ({
  ...initialMenuState,
  dispatch: (action) => set((s) => menuReducer(s, action)),
  open: (id) => get().dispatch({ type: 'push', id }),
  replace: (id) => get().dispatch({ type: 'replace', id }),
  back: () => get().dispatch({ type: 'pop' }),
  closeAll: () => get().dispatch({ type: 'closeAll' }),
}));

export const isMenuOpen = () => useMenu.getState().stack.length > 0;
export const useTopMenu = () => useMenu((s) => topMenu(s));

// Model of the in-app menu system: a stack of menu ids. Pure reducer, no React, so the
// navigation rules are unit-tested. The store (controller) and MenuHost (view) sit on top.

export type MenuId = string;
export type MenuState = { readonly stack: readonly MenuId[] };
export type MenuAction =
  | { type: 'push'; id: MenuId }
  | { type: 'replace'; id: MenuId }
  | { type: 'pop' }
  | { type: 'closeAll' };

export const initialMenuState: MenuState = { stack: [] };

export function menuReducer(state: MenuState, action: MenuAction): MenuState {
  const { stack } = state;
  switch (action.type) {
    case 'push':
      return stack[stack.length - 1] === action.id ? state : { stack: [...stack, action.id] };
    case 'replace':
      return { stack: [...stack.slice(0, -1), action.id] };
    case 'pop':
      return stack.length === 0 ? state : { stack: stack.slice(0, -1) };
    case 'closeAll':
      return stack.length === 0 ? state : initialMenuState;
  }
}

export const topMenu = (state: MenuState): MenuId | undefined => state.stack[state.stack.length - 1];

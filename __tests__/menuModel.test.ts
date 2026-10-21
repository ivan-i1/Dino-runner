import { initialMenuState, menuReducer } from '@/menu/menuModel';

describe('menuReducer', () => {
  it('opens, stacks and pops menus in order', () => {
    let s = menuReducer(initialMenuState, { type: 'push', id: 'pause' });
    s = menuReducer(s, { type: 'push', id: 'options' });
    expect(s.stack).toEqual(['pause', 'options']);
    s = menuReducer(s, { type: 'pop' });
    expect(s.stack).toEqual(['pause']);
  });
  it('does not push the menu that is already on top twice', () => {
    const s = menuReducer({ stack: ['pause'] }, { type: 'push', id: 'pause' });
    expect(s.stack).toEqual(['pause']);
  });
  it('replace swaps only the top entry', () => {
    expect(menuReducer({ stack: ['a', 'b'] }, { type: 'replace', id: 'c' }).stack).toEqual(['a', 'c']);
  });
  it('popping an empty stack is a no-op', () => {
    expect(menuReducer(initialMenuState, { type: 'pop' })).toBe(initialMenuState);
  });
  it('closeAll empties the stack', () => {
    expect(menuReducer({ stack: ['a', 'b'] }, { type: 'closeAll' }).stack).toEqual([]);
  });
});

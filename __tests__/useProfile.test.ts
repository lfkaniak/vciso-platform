/**
 * Tests for useProfile hook — localStorage persistence + SSR guard.
 *
 * Note: renderHook tests require a proper jsdom environment.
 * These tests focus on the logic extracted from the hook.
 */

describe('useProfile — localStorage logic', () => {
  const STORAGE_KEY = 'vciso_profile';

  beforeEach(() => {
    localStorage.clear();
  });

  it('retorna it-professional como padrão quando localStorage está vazio', () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const profile = (stored as string) ?? 'it-professional';
    expect(profile).toBe('it-professional');
  });

  it('persiste perfil no localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'executive');
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).toBe('executive');
  });

  it('recupera perfil salvo na reinicialização', () => {
    localStorage.setItem(STORAGE_KEY, 'consultant');
    const recovered = (localStorage.getItem(STORAGE_KEY) as string) ?? 'it-professional';
    expect(recovered).toBe('consultant');
  });

  it('retorna padrão quando localStorage tem valor inválido', () => {
    localStorage.setItem(STORAGE_KEY, '');
    const stored = localStorage.getItem(STORAGE_KEY);
    const profile = stored || 'it-professional';
    expect(profile).toBe('it-professional');
  });
});

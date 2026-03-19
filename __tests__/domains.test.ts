// Task 8.2 — getDomainContext unit test
// Note: getDomainContext uses fs — must run in Node.js test env (jest, not jsdom)
// jest.config.ts uses jsdom, so we test the pure logic via a custom testEnvironment override.
// Since jest.config.ts is global jsdom, we need to use @jest-environment node.

/**
 * @jest-environment node
 */
import { getDomainContext, getDomain, getAllDomains } from '@/lib/knowledge/domains';

describe('getDomainContext', () => {
  it('retorna string não-vazia para cissp-01', () => {
    const ctx = getDomainContext(['cissp-01']);
    expect(typeof ctx).toBe('string');
    expect(ctx.length).toBeGreaterThan(0);
  });

  it('contém o título do domínio no contexto', () => {
    const ctx = getDomainContext(['cissp-01']);
    expect(ctx).toContain('cissp-01');
  });

  it('retorna string vazia para domínio inexistente', () => {
    const ctx = getDomainContext(['cissp-99-nonexistent']);
    expect(ctx).toBe('');
  });

  it('combina múltiplos domínios com separador', () => {
    const ctx = getDomainContext(['cissp-01', 'cissp-07']);
    expect(ctx).toContain('cissp-01');
    expect(ctx).toContain('cissp-07');
    expect(ctx).toContain('---');
  });
});

describe('getDomain', () => {
  it('retorna domínio válido para cissp-07', () => {
    const domain = getDomain('cissp-07');
    expect(domain).not.toBeNull();
    expect(domain?.id).toBe('cissp-07');
    expect(domain?.certification).toBe('CISSP');
  });

  it('retorna null para domínio inexistente', () => {
    const domain = getDomain('cissp-99');
    expect(domain).toBeNull();
  });
});

describe('getAllDomains', () => {
  it('retorna pelo menos 4 domínios (os stubs MVP)', () => {
    const domains = getAllDomains();
    expect(domains.length).toBeGreaterThanOrEqual(4);
  });

  it('todos os domínios têm campos obrigatórios', () => {
    const domains = getAllDomains();
    for (const d of domains) {
      expect(d.id).toBeTruthy();
      expect(d.title).toBeTruthy();
      expect(d.certification).toMatch(/^(CISSP|ISSMP)$/);
    }
  });
});

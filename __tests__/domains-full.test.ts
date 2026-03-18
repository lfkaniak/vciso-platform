/**
 * @jest-environment node
 */
// Task 4 — Full knowledge base tests (Story 3.1)
// Tests run against the actual MDX files in content/domains/

jest.mock('server-only', () => ({}));

import { getDomain, getAllDomains, getDomainContext, searchDomains } from '@/lib/knowledge/domains';

describe('getDomain', () => {
  it('4.1 — retorna ISC2Domain completo para cissp-01', () => {
    const domain = getDomain('cissp-01');
    expect(domain).not.toBeNull();
    expect(domain?.id).toBe('cissp-01');
    expect(domain?.certification).toBe('CISSP');
    expect(domain?.domainNumber).toBe(1);
    expect(domain?.keyFrameworks).toHaveLength(3);
    expect(domain?.keywords.length).toBeGreaterThan(0);
    expect(domain?.content?.length).toBeGreaterThan(100);
  });

  it('retorna null para domínio inexistente', () => {
    expect(getDomain('cissp-99')).toBeNull();
  });

  it('retorna todos os 8 campos obrigatórios do frontmatter', () => {
    const domain = getDomain('cissp-07');
    expect(domain?.id).toBeTruthy();
    expect(domain?.title).toBeTruthy();
    expect(domain?.certification).toMatch(/^(CISSP|ISSMP)$/);
    expect(typeof domain?.domainNumber).toBe('number');
    expect(Array.isArray(domain?.keyFrameworks)).toBe(true);
    expect(Array.isArray(domain?.relatedDomains)).toBe(true);
    expect(Array.isArray(domain?.keywords)).toBe(true);
    expect(Array.isArray(domain?.situationClusters)).toBe(true);
  });
});

describe('getAllDomains', () => {
  it('4.2 — retorna exatamente 14 domínios', () => {
    const domains = getAllDomains();
    expect(domains).toHaveLength(14);
  });

  it('contém 8 domínios CISSP', () => {
    const domains = getAllDomains();
    const cissp = domains.filter((d) => d.certification === 'CISSP');
    expect(cissp).toHaveLength(8);
  });

  it('contém 6 domínios ISSMP', () => {
    const domains = getAllDomains();
    const issmp = domains.filter((d) => d.certification === 'ISSMP');
    expect(issmp).toHaveLength(6);
  });

  it('todos os domínios têm exatamente 3 keyFrameworks', () => {
    const domains = getAllDomains();
    for (const d of domains) {
      expect(d.keyFrameworks).toHaveLength(3);
    }
  });

  it('todos os domínios têm conteúdo não-vazio', () => {
    const domains = getAllDomains();
    for (const d of domains) {
      expect(d.content?.length).toBeGreaterThan(100);
    }
  });
});

describe('searchDomains', () => {
  it('4.3 — "ransomware" retorna cissp-07', () => {
    const results = searchDomains('ransomware');
    const ids = results.map((d) => d.id);
    expect(ids).toContain('cissp-07');
  });

  it('4.6 — query vazia retorna array vazio', () => {
    expect(searchDomains('')).toHaveLength(0);
    expect(searchDomains('   ')).toHaveLength(0);
  });

  it('4.7 — busca case-insensitive: "RANSOMWARE" retorna cissp-07', () => {
    const results = searchDomains('RANSOMWARE');
    expect(results.map((d) => d.id)).toContain('cissp-07');
  });

  it('"risco" retorna cissp-01', () => {
    const results = searchDomains('risco');
    expect(results.map((d) => d.id)).toContain('cissp-01');
  });

  it('"ISO 27001" retorna issmp-03', () => {
    const results = searchDomains('ISO 27001');
    expect(results.map((d) => d.id)).toContain('issmp-03');
  });
});

describe('getDomainContext', () => {
  it('4.4 — retorna contexto com conteúdo de cissp-01 e cissp-07', () => {
    const ctx = getDomainContext(['cissp-01', 'cissp-07']);
    expect(ctx).toContain('cissp-01');
    expect(ctx).toContain('cissp-07');
    expect(ctx).toContain('---');
    expect(ctx.length).toBeGreaterThan(200);
  });

  it('retorna string vazia para IDs inexistentes', () => {
    expect(getDomainContext(['cissp-99'])).toBe('');
  });

  it('4.5 — domínio com frontmatter inválido é ignorado (não lança)', () => {
    // getDomain returns null for invalid files — getDomainContext filters nulls
    expect(() => getDomainContext(['invalid-id'])).not.toThrow();
  });
});

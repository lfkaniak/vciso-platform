/**
 * @jest-environment jsdom
 */
// Story 3.2 — Domain Navigation UI tests
// Tasks: 4.1 (14 cards), 4.2 (domain detail), 4.3 (404), 4.4 (busca)

jest.mock('server-only', () => ({}));

// Mock next-mdx-remote/rsc (ESM-only, not compatible with Jest)
jest.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source }: { source: string }) => (
    <div data-testid="mdx-content">{source}</div>
  ),
}));

// Mock next/navigation
const mockNotFound = jest.fn();
jest.mock('next/navigation', () => ({
  notFound: () => mockNotFound(),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock lib/knowledge/domains
const mockDomains = Array.from({ length: 14 }, (_, i) => {
  const isCISSP = i < 8;
  const cert = isCISSP ? 'CISSP' : 'ISSMP';
  const num = isCISSP ? i + 1 : i - 7;
  const id = isCISSP ? `cissp-0${i + 1}` : `issmp-0${i - 7}`;
  return {
    id,
    title: `Domain ${i + 1}`,
    certification: cert as 'CISSP' | 'ISSMP',
    domainNumber: num,
    keyFrameworks: ['Framework A', 'Framework B', 'Framework C'],
    relatedDomains: [],
    keywords: i === 6 ? ['ransomware', 'incident response'] : ['governance'],
    situationClusters: [],
    content: `Content for ${id}`,
  };
});

jest.mock('@/lib/knowledge/domains', () => ({
  getAllDomains: jest.fn(() => mockDomains),
  getDomain: jest.fn((id: string) => mockDomains.find((d) => d.id === id) ?? null),
  searchDomains: jest.fn((keyword: string) => {
    const lower = keyword.toLowerCase();
    return mockDomains.filter(
      (d) =>
        d.title.toLowerCase().includes(lower) ||
        d.keywords.some((k) => k.toLowerCase().includes(lower)) ||
        d.id.toLowerCase().includes(lower)
    );
  }),
}));

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { DomainCard } from '@/components/domains/DomainCard';
import { DomainGrid } from '@/components/domains/DomainGrid';
import DomainsPage from '@/app/domains/page';
import DomainPage from '@/app/domains/[id]/page';

// ── Task 4.1 — /domains renderiza 14 cards ────────────────────────────────────

describe('DomainsPage', () => {
  it('4.1 — renderiza 14 cards sem erro', async () => {
    const page = await DomainsPage({ searchParams: Promise.resolve({}) });
    render(page);
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(14);
  });

  it('4.1 — agrupa por certificação (CISSP e ISSMP)', async () => {
    const page = await DomainsPage({ searchParams: Promise.resolve({}) });
    render(page);
    expect(screen.getByText(/8 domínios/)).toBeInTheDocument();
    expect(screen.getByText(/6 domínios/)).toBeInTheDocument();
  });

  it('4.4 — busca por "ransomware" retorna cissp-07', async () => {
    const page = await DomainsPage({ searchParams: Promise.resolve({ q: 'ransomware' }) });
    render(page);
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(1);
    expect(articles[0]).toHaveAttribute('aria-label', expect.stringContaining('Domain 7'));
  });

  it('4.4 — exibe mensagem quando busca não retorna resultados', async () => {
    const page = await DomainsPage({ searchParams: Promise.resolve({ q: 'xyznotfound' }) });
    render(page);
    expect(screen.getByRole('status')).toHaveTextContent('Nenhum domínio encontrado para');
  });
});

// ── Task 4.2 — /domains/cissp-01 renderiza conteúdo ──────────────────────────

describe('DomainPage', () => {
  it('4.2 — renderiza conteúdo do domínio cissp-01', async () => {
    const page = await DomainPage({ params: Promise.resolve({ id: 'cissp-01' }) });
    render(page);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Domain 1');
    expect(screen.getByTestId('mdx-content')).toBeInTheDocument();
  });

  it('4.2 — renderiza breadcrumb com Home > Domínios > {nome}', async () => {
    const page = await DomainPage({ params: Promise.resolve({ id: 'cissp-01' }) });
    render(page);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toHaveTextContent('Home');
    expect(nav).toHaveTextContent('Domínios');
    expect(nav).toHaveTextContent('Domain 1');
  });

  it('4.2 — link "Ver situações relacionadas" aponta para /situations?domain=cissp-01', async () => {
    const page = await DomainPage({ params: Promise.resolve({ id: 'cissp-01' }) });
    render(page);
    const link = screen.getByRole('link', { name: /ver situações relacionadas/i });
    expect(link).toHaveAttribute('href', '/situations?domain=cissp-01');
  });

  it('4.3 — chama notFound() para domínio inválido', async () => {
    await DomainPage({ params: Promise.resolve({ id: 'invalido' }) });
    expect(mockNotFound).toHaveBeenCalled();
  });
});

// ── DomainCard unit tests ─────────────────────────────────────────────────────

describe('DomainCard', () => {
  const cisssDomain = mockDomains[0]; // cissp-01

  it('renderiza nome, número e certificação CISSP (badge azul)', () => {
    render(<DomainCard domain={cisssDomain} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByText('CISSP')).toBeInTheDocument();
    expect(screen.getByText('Domínio 1')).toBeInTheDocument();
    expect(screen.getByText('Domain 1')).toBeInTheDocument();
  });

  it('renderiza 3 frameworks-chave', () => {
    render(<DomainCard domain={cisssDomain} />);
    expect(screen.getByText('Framework A')).toBeInTheDocument();
    expect(screen.getByText('Framework B')).toBeInTheDocument();
    expect(screen.getByText('Framework C')).toBeInTheDocument();
  });

  it('renderiza badge verde para ISSMP', () => {
    const issmpDomain = mockDomains[8]; // issmp-01
    render(<DomainCard domain={issmpDomain} />);
    const badge = screen.getByText('ISSMP');
    expect(badge.className).toContain('green');
  });

  it('link aponta para /domains/{id}', () => {
    render(<DomainCard domain={cisssDomain} />);
    const article = screen.getByRole('article');
    expect(article.tagName).toBe('ARTICLE');
    const link = within(article).getByRole('link');
    expect(link).toHaveAttribute('href', '/domains/cissp-01');
  });
});

// ── DomainGrid unit tests ─────────────────────────────────────────────────────

describe('DomainGrid', () => {
  it('renderiza seções CISSP e ISSMP separadas', () => {
    render(<DomainGrid domains={mockDomains} />);
    expect(screen.getByText(/8 domínios/)).toBeInTheDocument();
    expect(screen.getByText(/6 domínios/)).toBeInTheDocument();
  });

  it('renderiza exatamente 14 articles', () => {
    render(<DomainGrid domains={mockDomains} />);
    expect(screen.getAllByRole('article')).toHaveLength(14);
  });
});

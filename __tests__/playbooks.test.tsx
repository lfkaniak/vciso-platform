/**
 * @jest-environment jsdom
 */
// Story 4.2 — Crisis Playbooks tests

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock react-markdown (ESM-only)
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ShieldAlert: () => <svg data-testid="shield-alert" />,
  ChevronDown: () => <svg data-testid="chevron-down" />,
  Info: () => <svg data-testid="info-icon" />,
}));

// Mock Collapsible components
jest.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CollapsibleContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { usePlaybook } from '@/hooks/usePlaybook';
import ransomwareData from '@/content/playbooks/ransomware.json';
import dataBreachData from '@/content/playbooks/data-breach.json';

// ── Playbook JSON validation ──────────────────────────────────────────────────

describe('Playbook JSON data', () => {
  it('6.1 — ransomware.json tem pelo menos 15 ações (≥5 por fase)', () => {
    expect(ransomwareData.length).toBeGreaterThanOrEqual(15);
  });

  it('6.1 — data-breach.json tem pelo menos 15 ações (≥5 por fase)', () => {
    expect(dataBreachData.length).toBeGreaterThanOrEqual(15);
  });

  it('todas as ações de ransomware têm os campos obrigatórios', () => {
    for (const action of ransomwareData) {
      expect(action.id).toBeTruthy();
      expect(['0-30min', '24h', '72h']).toContain(action.phase);
      expect(action.order).toBeGreaterThan(0);
      expect(action.title).toBeTruthy();
      expect(action.description).toBeTruthy();
      expect(['CISO', 'TI', 'Jurídico', 'Comunicação', 'Executivo']).toContain(action.owner);
      expect(action.completionCriteria).toBeTruthy();
      expect(action.relatedDomain).toBeTruthy();
    }
  });

  it('ransomware cobre as 3 fases com mínimo 5 ações cada', () => {
    const phases = ['0-30min', '24h', '72h'] as const;
    for (const phase of phases) {
      const count = ransomwareData.filter((a) => a.phase === phase).length;
      expect(count).toBeGreaterThanOrEqual(5);
    }
  });

  it('data-breach cobre as 3 fases com mínimo 5 ações cada', () => {
    const phases = ['0-30min', '24h', '72h'] as const;
    for (const phase of phases) {
      const count = dataBreachData.filter((a) => a.phase === phase).length;
      expect(count).toBeGreaterThanOrEqual(5);
    }
  });
});

// ── usePlaybook hook ──────────────────────────────────────────────────────────

describe('usePlaybook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('6.2 — persiste ação concluída no localStorage', () => {
    const { result } = renderHook(() => usePlaybook('ransomware'));

    act(() => {
      result.current.toggleAction('ransomware-00-01');
    });

    expect(result.current.completedActions).toContain('ransomware-00-01');

    const stored = JSON.parse(localStorage.getItem('vciso_playbook_ransomware') ?? '{}');
    expect(stored.completedActions).toContain('ransomware-00-01');
  });

  it('6.3 — resetProgress() limpa todas as ações concluídas', () => {
    const { result } = renderHook(() => usePlaybook('ransomware'));

    act(() => {
      result.current.toggleAction('ransomware-00-01');
      result.current.toggleAction('ransomware-00-02');
    });

    expect(result.current.completedActions).toHaveLength(2);

    act(() => {
      result.current.resetProgress();
    });

    expect(result.current.completedActions).toHaveLength(0);
    expect(localStorage.getItem('vciso_playbook_ransomware')).toBeNull();
  });

  it('6.3 — resetProgress() NÃO limpa o outro playbook', () => {
    const { result: ransomwareResult } = renderHook(() => usePlaybook('ransomware'));
    const { result: dataBreachResult } = renderHook(() => usePlaybook('data-breach'));

    act(() => {
      ransomwareResult.current.toggleAction('ransomware-00-01');
      dataBreachResult.current.toggleAction('data-breach-00-01');
    });

    act(() => {
      ransomwareResult.current.resetProgress();
    });

    // data-breach should still have its data
    const stored = localStorage.getItem('vciso_playbook_data-breach');
    expect(stored).not.toBeNull();
  });

  it('6.4 — progressPercent calcula corretamente (3/15 = 20%)', () => {
    const { result } = renderHook(() => usePlaybook('ransomware'));

    act(() => {
      result.current.toggleAction('ransomware-00-01');
      result.current.toggleAction('ransomware-00-02');
      result.current.toggleAction('ransomware-00-03');
    });

    expect(result.current.progressPercent(15)).toBe(20);
  });

  it('progressPercent retorna 0 quando nenhuma ação concluída', () => {
    const { result } = renderHook(() => usePlaybook('ransomware'));
    expect(result.current.progressPercent(15)).toBe(0);
  });

  it('progressPercent retorna 100 quando todas as ações concluídas (1/1)', () => {
    const { result } = renderHook(() => usePlaybook('ransomware'));
    act(() => {
      result.current.toggleAction('ransomware-00-01');
    });
    expect(result.current.progressPercent(1)).toBe(100);
  });

  it('persistir startedAt na primeira ação marcada', () => {
    const { result } = renderHook(() => usePlaybook('ransomware'));

    expect(result.current.startedAt).toBeUndefined();

    act(() => {
      result.current.toggleAction('ransomware-00-01');
    });

    expect(result.current.startedAt).toBeInstanceOf(Date);
  });

  it('toggle desfaz ação já concluída', () => {
    const { result } = renderHook(() => usePlaybook('ransomware'));

    act(() => {
      result.current.toggleAction('ransomware-00-01');
    });
    expect(result.current.completedActions).toContain('ransomware-00-01');

    act(() => {
      result.current.toggleAction('ransomware-00-01');
    });
    expect(result.current.completedActions).not.toContain('ransomware-00-01');
  });
});

// ── PlaybookAction component ──────────────────────────────────────────────────

import { PlaybookAction } from '@/components/playbooks/PlaybookAction';

describe('PlaybookAction component', () => {

  const mockAction = {
    id: 'ransomware-00-01',
    phase: '0-30min' as const,
    order: 1,
    title: 'Isolar sistemas comprometidos',
    description: 'Desconecte os sistemas da rede.',
    owner: 'TI',
    completionCriteria: 'Sistemas isolados.',
    relatedDomain: 'cissp-07',
  };

  it('renderiza título e descrição', () => {
    render(<PlaybookAction action={mockAction} isCompleted={false} onToggle={jest.fn()} />);
    expect(screen.getByText('Isolar sistemas comprometidos')).toBeInTheDocument();
    expect(screen.getByText('Desconecte os sistemas da rede.')).toBeInTheDocument();
  });

  it('renderiza badge de owner', () => {
    render(<PlaybookAction action={mockAction} isCompleted={false} onToggle={jest.fn()} />);
    expect(screen.getByText('TI')).toBeInTheDocument();
  });

  it('link de domínio aponta para /domains/cissp-07', () => {
    render(<PlaybookAction action={mockAction} isCompleted={false} onToggle={jest.fn()} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/domains/cissp-07');
  });

  it('texto riscado quando isCompleted=true', () => {
    render(<PlaybookAction action={mockAction} isCompleted={true} onToggle={jest.fn()} />);
    const label = screen.getByText('Isolar sistemas comprometidos');
    expect(label.className).toContain('line-through');
  });
});

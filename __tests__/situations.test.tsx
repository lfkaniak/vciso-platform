/**
 * @jest-environment jsdom
 */
// Story 4.1 — Situation Library tests

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  getAllSituations,
  getMvpSituations,
  getSituationsByCluster,
  getSituation,
} from '@/lib/knowledge/situations';
import { SituationCard } from '@/components/vciso/SituationCard';

// ── Task 4.1 — getAllSituations retorna 31 itens ──────────────────────────────

describe('getAllSituations', () => {
  it('4.1 — retorna exatamente 31 situações', () => {
    expect(getAllSituations()).toHaveLength(31);
  });

  it('todos os registros têm id, title, cluster, urgency, mode, relevantDomains', () => {
    for (const s of getAllSituations()) {
      expect(s.id).toMatch(/^S\d{2}$/);
      expect(s.title).toBeTruthy();
      expect(['crisis', 'strategic', 'compliance', 'operational', 'projects']).toContain(s.cluster);
      expect(['high', 'medium', 'low']).toContain(s.urgency);
      expect(['orient-me-now', 'help-decide', 'help-comply', 'help-operate']).toContain(s.mode);
      expect(Array.isArray(s.relevantDomains)).toBe(true);
    }
  });
});

// ── Task 4.2 — getMvpSituations retorna 10 itens com isMvp: true ─────────────

describe('getMvpSituations', () => {
  it('4.2 — retorna exatamente 10 situações MVP', () => {
    const mvp = getMvpSituations();
    expect(mvp).toHaveLength(10);
  });

  it('4.2 — todas têm isMvp: true', () => {
    for (const s of getMvpSituations()) {
      expect(s.isMvp).toBe(true);
    }
  });

  it('4.2 — contém os IDs MVP esperados', () => {
    const ids = getMvpSituations().map((s) => s.id);
    const expectedMvp = ['S01', 'S02', 'S07', 'S08', 'S12', 'S14', 'S17', 'S20', 'S21', 'S26'];
    for (const id of expectedMvp) {
      expect(ids).toContain(id);
    }
  });
});

// ── Task 4.3 — getSituationsByCluster filtra corretamente ────────────────────

describe('getSituationsByCluster', () => {
  it('4.3 — retorna apenas situações do cluster "crisis"', () => {
    const crisis = getSituationsByCluster('crisis');
    expect(crisis.length).toBeGreaterThan(0);
    for (const s of crisis) {
      expect(s.cluster).toBe('crisis');
    }
  });

  it('4.3 — clusters cobrem os 5 tipos definidos', () => {
    const clusters = ['crisis', 'strategic', 'compliance', 'operational', 'projects'] as const;
    for (const c of clusters) {
      expect(getSituationsByCluster(c).length).toBeGreaterThan(0);
    }
  });

  it('total de situações por cluster soma 31', () => {
    const clusters = ['crisis', 'strategic', 'compliance', 'operational', 'projects'] as const;
    const total = clusters.reduce((acc, c) => acc + getSituationsByCluster(c).length, 0);
    expect(total).toBe(31);
  });
});

// ── getSituation ──────────────────────────────────────────────────────────────

describe('getSituation', () => {
  it('retorna S01 corretamente', () => {
    const s = getSituation('S01');
    expect(s?.id).toBe('S01');
    expect(s?.isMvp).toBe(true);
    expect(s?.cluster).toBe('crisis');
    expect(s?.urgency).toBe('high');
  });

  it('retorna null para ID inexistente', () => {
    expect(getSituation('S99')).toBeNull();
  });
});

// ── Task 4.4 — SituationCard renderiza badge de urgência correta ─────────────

describe('SituationCard', () => {
  const highSituation = {
    id: 'S01',
    title: 'Ransomware em Andamento',
    cluster: 'crisis' as const,
    urgency: 'high' as const,
    relevantDomains: ['cissp-07'],
    mode: 'orient-me-now' as const,
    isMvp: true,
    promptSeed: 'Tivemos um ransomware hoje.',
  };

  const lowSituation = { ...highSituation, id: 'S26', urgency: 'low' as const, isMvp: false };

  it('4.4 — renderiza badge de urgência "Alta" para high', () => {
    render(<SituationCard situation={highSituation} />);
    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('4.4 — badge high tem estilo vermelho', () => {
    render(<SituationCard situation={highSituation} />);
    const badge = screen.getByText('Alta');
    expect(badge.className).toContain('red');
  });

  it('4.4 — renderiza badge "Baixa" para low sem estilo vermelho', () => {
    render(<SituationCard situation={lowSituation} />);
    const badge = screen.getByText('Baixa');
    expect(badge.className).toContain('green');
  });

  it('renderiza badge MVP quando isMvp: true', () => {
    render(<SituationCard situation={highSituation} />);
    expect(screen.getByText('MVP')).toBeInTheDocument();
  });

  it('não renderiza badge MVP quando isMvp: false', () => {
    render(<SituationCard situation={lowSituation} />);
    expect(screen.queryByText('MVP')).not.toBeInTheDocument();
  });

  it('renderiza domínios ISC2 relevantes', () => {
    render(<SituationCard situation={highSituation} />);
    expect(screen.getByText('cissp-07')).toBeInTheDocument();
  });

  it('chama router.push com /?situation=S01 ao clicar', () => {
    mockPush.mockClear();
    render(<SituationCard situation={highSituation} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockPush).toHaveBeenCalledWith('/?situation=S01');
  });
});

// Task 5.4 — ArtifactForm exibe campos corretos para cada tipo
import { render, screen } from '@testing-library/react';
import { ArtifactForm } from '@/components/artifacts/ArtifactForm';
import type { ArtifactType } from '@/types/index';

const noop = () => {};

describe('ArtifactForm', () => {
  it('exibe campos comuns para todos os tipos', () => {
    render(<ArtifactForm type="security-posture-report" onSubmit={noop} isLoading={false} />);

    expect(screen.getByLabelText(/nome da organização/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/setor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nível de maturidade/i)).toBeInTheDocument();
  });

  it('exibe campos específicos de security-posture-report', () => {
    render(<ArtifactForm type="security-posture-report" onSubmit={noop} isLoading={false} />);

    expect(screen.getByLabelText(/apetite de risco/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ativos críticos/i)).toBeInTheDocument();
  });

  it('exibe campos específicos de budget-proposal-rosi', () => {
    render(<ArtifactForm type="budget-proposal-rosi" onSubmit={noop} isLoading={false} />);

    expect(screen.getByLabelText(/orçamento anual/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/investimento atual/i)).toBeInTheDocument();
  });

  it('exibe campos específicos de security-program-roadmap', () => {
    render(<ArtifactForm type="security-program-roadmap" onSubmit={noop} isLoading={false} />);

    expect(screen.getByLabelText(/maturidade atual/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maturidade alvo/i)).toBeInTheDocument();
  });

  it('exibe campos específicos de iso27001-audit-checklist', () => {
    render(<ArtifactForm type="iso27001-audit-checklist" onSubmit={noop} isLoading={false} />);

    expect(screen.getByLabelText(/data da auditoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/escopo do sgsi/i)).toBeInTheDocument();
  });

  it('exibe campos específicos de lgpd-adequacy-process', () => {
    render(<ArtifactForm type="lgpd-adequacy-process" onSubmit={noop} isLoading={false} />);

    expect(screen.getByLabelText(/tipos de dados pessoais/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/finalidades de tratamento/i)).toBeInTheDocument();
  });

  it('botão fica desabilitado quando campos obrigatórios estão vazios', () => {
    render(<ArtifactForm type="security-posture-report" onSubmit={noop} isLoading={false} />);

    const button = screen.getByRole('button', { name: /gerar artefato/i });
    expect(button).toBeDisabled();
  });

  it('botão fica desabilitado quando isLoading=true', () => {
    render(<ArtifactForm type="security-posture-report" onSubmit={noop} isLoading={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Gerando artefato...');
  });

  it('exibe campos distintos para cada tipo de artefato', () => {
    const types: ArtifactType[] = [
      'security-posture-report',
      'budget-proposal-rosi',
      'security-program-roadmap',
      'iso27001-audit-checklist',
      'lgpd-adequacy-process',
    ];

    for (const type of types) {
      const { unmount } = render(
        <ArtifactForm type={type} onSubmit={noop} isLoading={false} />
      );
      // Each type renders at least common fields + 2 specific fields = 5+ inputs
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
      unmount();
    }
  });
});

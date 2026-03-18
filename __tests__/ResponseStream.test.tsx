// Task 8.4 — ResponseStream component tests
import { render, screen, fireEvent } from '@testing-library/react';

// react-markdown v10 is ESM-only; mock it for Jest (jsdom environment)
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

import { ResponseStream } from '@/components/vciso/ResponseStream';

const mockContent = `## Orientação Imediata

Isole os sistemas afetados imediatamente.

## Contexto Técnico

Análise forense digital conforme ISO 27035.

## Frameworks e Referências

NIST CSF, MITRE ATT&CK, ISO 27035.

## Métricas e KPIs

MTTR < 4h para incidentes críticos.

## Próximos Passos

1. Plano de recuperação
2. Comunicação stakeholders`;

describe('ResponseStream', () => {
  it('renderiza seções H2 do markdown', () => {
    render(
      <ResponseStream
        content={mockContent}
        isStreaming={false}
        isComplete={true}
        error={null}
      />
    );
    expect(screen.getByText('Orientação Imediata')).toBeInTheDocument();
    expect(screen.getByText('Contexto Técnico')).toBeInTheDocument();
    expect(screen.getByText('Frameworks e Referências')).toBeInTheDocument();
    expect(screen.getByText('Métricas e KPIs')).toBeInTheDocument();
    expect(screen.getByText('Próximos Passos')).toBeInTheDocument();
  });

  it('mostra skeleton durante streaming sem conteúdo', () => {
    render(
      <ResponseStream
        content=""
        isStreaming={true}
        isComplete={false}
        error={null}
      />
    );
    expect(screen.getByRole('status', { name: 'Gerando resposta' })).toBeInTheDocument();
  });

  it('não renderiza nada quando sem conteúdo e não streaming', () => {
    const { container } = render(
      <ResponseStream
        content=""
        isStreaming={false}
        isComplete={false}
        error={null}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('exibe indicador de truncamento quando stream interrompido', () => {
    render(
      <ResponseStream
        content="Conteúdo parcial com mais de dez caracteres aqui"
        isStreaming={false}
        isComplete={false}
        error={null}
      />
    );
    expect(screen.getByText(/Resposta truncada/)).toBeInTheDocument();
  });

  it('seções podem ser colapsadas ao clicar no header', () => {
    render(
      <ResponseStream
        content={mockContent}
        isStreaming={false}
        isComplete={true}
        error={null}
      />
    );

    const sectionBtn = screen.getByRole('button', { name: /Orientação Imediata/ });
    // Initially expanded — body text visible
    expect(screen.getByText(/Isole os sistemas/)).toBeInTheDocument();

    // Collapse
    fireEvent.click(sectionBtn);
    expect(screen.queryByText(/Isole os sistemas/)).not.toBeInTheDocument();

    // Expand again
    fireEvent.click(sectionBtn);
    expect(screen.getByText(/Isole os sistemas/)).toBeInTheDocument();
  });
});

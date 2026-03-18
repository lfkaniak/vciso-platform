// Task 6.1 — TenthManBlock renders label and icon
// Task 6.2 — error state renders graceful message
// Task 6.3 — toggle updates aria-expanded

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

// Mock base-ui components — Collapsible shares open/onOpenChange via context
const CollapsibleContext = React.createContext<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
}>({ open: true, onOpenChange: () => {} });

jest.mock('@/components/ui/collapsible', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const CollapsibleContext = React.createContext({ open: true, onOpenChange: () => {} });

  return {
    Collapsible: ({ children, open, onOpenChange }: {
      children: React.ReactNode;
      open: boolean;
      onOpenChange: (v: boolean) => void;
    }) => (
      <CollapsibleContext.Provider value={{ open, onOpenChange }}>
        <div data-testid="collapsible">{children}</div>
      </CollapsibleContext.Provider>
    ),
    CollapsibleTrigger: ({
      children,
      'aria-expanded': ariaExpanded,
      ...rest
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & { 'aria-expanded'?: boolean }) => {
      const ctx = React.useContext(CollapsibleContext);
      return (
        <button
          onClick={() => ctx.onOpenChange(!ctx.open)}
          aria-expanded={ariaExpanded}
          data-testid="collapsible-trigger"
          {...rest}
        >
          {children}
        </button>
      );
    },
    CollapsibleContent: ({ children, ...rest }: { children: React.ReactNode; id?: string }) => (
      <div data-testid="collapsible-content" {...rest}>{children}</div>
    ),
  };
});

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <span data-testid="tooltip-trigger">{children}</span>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
}));

// CollapsibleContext declared above for use in mock — suppress unused warning
void CollapsibleContext;

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TenthManBlock } from '@/components/vciso/TenthManBlock';
import type { TenthManState } from '@/types/index';

const baseState: TenthManState = {
  isStreaming: false,
  isComplete: false,
  content: '',
};

describe('TenthManBlock', () => {
  it('não renderiza quando sem conteúdo e não streaming', () => {
    const { container } = render(<TenthManBlock state={baseState} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza label e ícone quando há conteúdo', () => {
    render(
      <TenthManBlock
        state={{ ...baseState, isComplete: true, content: '## Cenário Alternativo\n\nTexto adversarial.' }}
      />
    );
    expect(screen.getByText(/Perspectiva Adversarial — Mecanismo do 10º Homem/)).toBeInTheDocument();
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('exibe tooltip com explicação do conceito', () => {
    render(
      <TenthManBlock
        state={{ ...baseState, isComplete: true, content: 'Conteúdo adversarial de teste aqui.' }}
      />
    );
    expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-content').textContent).toContain('doutrina israelense');
  });

  it('exibe mensagem de indisponibilidade no estado error: unavailable', () => {
    render(
      <TenthManBlock
        state={{ ...baseState, isStreaming: false, error: 'unavailable' }}
      />
    );
    expect(screen.getByText(/indisponível no momento/)).toBeInTheDocument();
  });

  it('exibe mensagem de indisponibilidade no estado error: timeout', () => {
    render(
      <TenthManBlock
        state={{ ...baseState, isStreaming: false, error: 'timeout' }}
      />
    );
    expect(screen.getByText(/indisponível no momento/)).toBeInTheDocument();
  });

  it('exibe skeleton quando isStreaming=true sem conteúdo', () => {
    render(
      <TenthManBlock
        state={{ ...baseState, isStreaming: true }}
      />
    );
    expect(screen.getByRole('status', { name: /Gerando perspectiva adversarial/ })).toBeInTheDocument();
  });

  it('toggle atualiza aria-expanded', () => {
    render(
      <TenthManBlock
        state={{ ...baseState, isComplete: true, content: 'Texto adversarial' }}
        defaultExpanded={true}
      />
    );
    const trigger = screen.getByTestId('collapsible-trigger');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('defaultExpanded=false inicia colapsado', () => {
    render(
      <TenthManBlock
        state={{ ...baseState, isComplete: true, content: 'Texto adversarial' }}
        defaultExpanded={false}
      />
    );
    const trigger = screen.getByTestId('collapsible-trigger');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

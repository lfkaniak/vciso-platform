import { render, screen, fireEvent } from '@testing-library/react';
import { SituationInput } from '@/components/vciso/SituationInput';

const noop = () => {};

describe('SituationInput', () => {
  it('renderiza textarea e 4 cards de modo', () => {
    render(<SituationInput profile="it-professional" onClassification={noop} />);

    expect(screen.getByRole('textbox', { name: /situação/i })).toBeInTheDocument();
    expect(screen.getByText('Oriente-me agora')).toBeInTheDocument();
    expect(screen.getByText('Ajude-me a decidir')).toBeInTheDocument();
    expect(screen.getByText('Ajude-me a cumprir')).toBeInTheDocument();
    expect(screen.getByText('Ajude-me a operar')).toBeInTheDocument();
  });

  it('exibe erro inline para input com menos de 10 caracteres', async () => {
    render(<SituationInput profile="it-professional" onClassification={noop} />);

    const textarea = screen.getByRole('textbox', { name: /situação/i });
    fireEvent.change(textarea, { target: { value: 'curto' } });

    const form = textarea.closest('form')!;
    fireEvent.submit(form);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert').textContent).toContain('Pode descrever melhor');
  });

  it('não exibe erro quando input tem 10 ou mais caracteres', () => {
    render(<SituationInput profile="it-professional" onClassification={noop} />);

    const textarea = screen.getByRole('textbox', { name: /situação/i });
    fireEvent.change(textarea, { target: { value: 'situação com mais de dez caracteres' } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('seleciona modo ao clicar em card', () => {
    render(<SituationInput profile="it-professional" onClassification={noop} />);

    const card = screen.getByRole('button', { name: /oriente-me agora/i });
    fireEvent.click(card);

    expect(card).toHaveAttribute('aria-pressed', 'true');
  });
});

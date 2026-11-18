import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from './app.js';

afterEach(() => vi.unstubAllGlobals());

function stubValidationError(message: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: [message] }), { status: 400 })),
  );
}

it('renders the form', () => {
  render(<App />);
  expect(screen.getByLabelText('Name')).toBeInTheDocument();
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
  expect(screen.getByLabelText('Message')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
});

it('shows a field error from a 400 response', async () => {
  stubValidationError('name should not be empty');
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
  expect(await screen.findByText('name should not be empty')).toBeInTheDocument();
});

it('shows the server email error under the Email field', async () => {
  stubValidationError('email must be an email');
  render(<App />);
  const email = screen.getByLabelText('Email');
  await userEvent.type(email, 'not-an-email');
  await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
  const error = await screen.findByText('email must be an email');
  expect(email.closest('label')).toContainElement(error);
  expect(email).toHaveAttribute('aria-invalid', 'true');
});

it('shows a spinner and disables the button while submitting', async () => {
  let resolve!: (res: Response) => void;
  vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise<Response>((r) => (resolve = r))));
  render(<App />);
  const button = screen.getByRole('button', { name: 'Send message' });
  await userEvent.click(button);
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
  expect(button.querySelector('.spinner')).toBeInTheDocument();
  resolve(new Response(null, { status: 201 }));
  expect(await screen.findByRole('status')).toHaveTextContent('Thanks! Your message was sent.');
  expect(button).toBeEnabled();
  expect(button.querySelector('.spinner')).not.toBeInTheDocument();
});

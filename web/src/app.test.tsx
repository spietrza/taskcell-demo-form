import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { App } from './app.js';

afterEach(() => vi.unstubAllGlobals());

it('renders the form', () => {
  render(<App />);
  expect(screen.getByLabelText('Name')).toBeInTheDocument();
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
  expect(screen.getByLabelText('Message')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
});

it('shows a field error from a 400 response', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: ['name should not be empty'] }), { status: 400 }),
    ),
  );
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
  expect(await screen.findByText('name should not be empty')).toBeInTheDocument();
});

it('disables the submit button while sending and re-enables it on success', async () => {
  let resolve!: (res: Response) => void;
  const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((r) => (resolve = r)));
  vi.stubGlobal('fetch', fetchMock);
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
  const sending = screen.getByRole('button', { name: 'Sending…' });
  expect(sending).toBeDisabled();
  await userEvent.click(sending);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  resolve(new Response(null, { status: 201 }));
  expect(await screen.findByRole('button', { name: 'Send message' })).toBeEnabled();
});

it('re-enables the submit button after an error', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled();
});

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

it('trims spaces around the name before sending', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
  vi.stubGlobal('fetch', fetchMock);
  render(<App />);
  await userEvent.type(screen.getByLabelText('Name'), ' Ann ');
  await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
  expect(fetchMock).toHaveBeenCalledOnce();
  const init: RequestInit = fetchMock.mock.calls[0]![1];
  expect(JSON.parse(init.body as string)).toMatchObject({ name: 'Ann' });
});

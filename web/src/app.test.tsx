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

it('posts the email trimmed and lowercased', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }));
  vi.stubGlobal('fetch', fetchMock);
  render(<App />);
  await userEvent.type(screen.getByLabelText('Email'), '  Jane.Doe@Example.COM  ');
  await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
  expect(fetchMock).toHaveBeenCalledOnce();
  const init = fetchMock.mock.calls[0]![1] as RequestInit;
  expect(JSON.parse(init.body as string)).toMatchObject({ email: 'jane.doe@example.com' });
});

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

it('shows a message character counter that turns red over the limit', async () => {
  render(<App />);
  const message = screen.getByLabelText('Message');
  expect(screen.getByText('0 / 1000')).not.toHaveClass('over');

  await userEvent.type(message, 'Hello');
  expect(screen.getByText('5 / 1000')).not.toHaveClass('over');

  await userEvent.clear(message);
  await userEvent.paste('a'.repeat(1001));
  expect(screen.getByText('1001 / 1000')).toHaveClass('over');
});

it('counts emoji as single characters, like the API', async () => {
  render(<App />);
  await userEvent.click(screen.getByLabelText('Message'));
  await userEvent.paste('😀'.repeat(600) + '❤️');
  expect(screen.getByText('601 / 1000')).not.toHaveClass('over');
});

it('resets the counter after a successful submit', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 201 })));
  render(<App />);
  await userEvent.type(screen.getByLabelText('Message'), 'Hello');
  expect(screen.getByText('5 / 1000')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
  await screen.findByRole('status');
  expect(screen.getByText('0 / 1000')).toBeInTheDocument();
});

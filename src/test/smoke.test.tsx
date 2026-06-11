import { describe, expect, it } from 'vitest';
import { renderApp, resetAppState, screen } from './helpers';

describe('app smoke test', () => {
  it('renders onboarding on a fresh install', async () => {
    await resetAppState();
    renderApp('/');
    expect(await screen.findByText("Let's set up your family's Latin app")).toBeInTheDocument();
  });
});

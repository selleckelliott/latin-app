import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../app/App';

describe('app smoke test', () => {
  it('renders the app shell', () => {
    render(<App />);
    expect(screen.getByText('Latin Learning App')).toBeInTheDocument();
  });
});

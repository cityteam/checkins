import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders nav bar title', () => {
  render(<App />);
  const linkElement = screen.getByText("Guests Checkin");
  expect(linkElement).toBeInTheDocument();
});

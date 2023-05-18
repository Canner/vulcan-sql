import React from 'react';
import { render } from '@testing-library/react';
import { useRouter } from 'next/router';

import Index from '../pages/index';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('Index', () => {
  it('should render successfully', () => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });

    const { baseElement } = render(<Index />);
    expect(baseElement).toBeTruthy();
  });
});

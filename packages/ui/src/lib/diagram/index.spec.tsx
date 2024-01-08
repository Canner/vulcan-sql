import { render } from '@testing-library/react';

import Diagram from '.';

describe('Diagram', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Diagram
        jsonData="{}"
        onInfoIconClick={() => {
          console.log('clicked');
        }}
      />
    );
    expect(baseElement).toBeTruthy();
  });
});

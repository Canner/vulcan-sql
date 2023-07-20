import { createHuggingFaceInference } from '../src/lib/utils';

describe('Test createHuggingFaceInference', () => {
  it('Should failed when not provide token', () => {
    // Act, Assert
    expect(() => createHuggingFaceInference()).toThrow(
      'please given access token'
    );
  });

  it('Should failed when provide empty token', () => {
    expect(() => createHuggingFaceInference({ accessToken: '' })).toThrow(
      'please given access token'
    );
  });
});

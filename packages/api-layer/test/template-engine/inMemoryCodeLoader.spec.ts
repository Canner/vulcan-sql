import { InMemoryCodeLoader } from '@vulcan-sql/api-layer/template-engine';
import * as nunjucks from 'nunjucks';

it('Should set/load compiled code correctly', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader({}, '');
  // Act
  loader.setSource('test', '(() => "test")()');
  const source = loader.getSource('test');
  // Assert
  const src = source?.src as nunjucks.LoadSourceSrc;
  expect(src.type).toBe('code');
  expect(src.obj).toBe('test');
});

it('If there is no source with the target name, the loader should return null', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader({}, '');
  // Act
  const source = loader.getSource('test');
  // Assert
  expect(source).toBeNull();
});

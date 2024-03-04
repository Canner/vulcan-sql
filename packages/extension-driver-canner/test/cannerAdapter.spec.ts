import { CannerServer } from './cannerServer';
import { CannerAdapter } from '../src/lib/cannerAdapter';

const pg = new CannerServer();

it.skip('CannerAdapter should get urls without throw any error when connection and sql are valid', async () => {
  // Arrange
  const { connection } = pg.getProfile('profile1');
  const adapter = new CannerAdapter(connection);
  // Act, Assert
  await expect(
    adapter.createAsyncQueryResultUrls('select 1')
  ).resolves.not.toThrow();
}, 50000);
it.skip('CannerAdapter should throw error when connection or sql are invalid', async () => {
  // Arrange
  const { connection } = pg.getProfile('profile1');
  const adapter = new CannerAdapter(connection);
  // Act, Assert
  await expect(adapter.createAsyncQueryResultUrls('wrong')).rejects.toThrow(); //
}, 50000);

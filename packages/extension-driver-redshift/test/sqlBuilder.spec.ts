import * as builder from '../src/lib/sqlBuilder';

describe('SQL builders components test', () => {
  it('removeEndingSemiColon', async () => {
    // Arrange
    const statement = `SELECT * FROM users;   \n    `;
    // Act
    const result = builder.removeEndingSemiColon(statement);
    // Arrange
    expect(result).toBe('SELECT * FROM users');
  });

  it('addLimit - string value', async () => {
    // Arrange
    const statement = `SELECT * FROM users`;
    // Act
    const result = builder.addLimit(statement, ':1');
    // Arrange
    expect(result).toBe('SELECT * FROM users LIMIT :1');
  });

  it('addLimit - null value', async () => {
    // Arrange
    const statement = `SELECT * FROM users`;
    // Act
    const result = builder.addLimit(statement, null);
    // Arrange
    expect(result).toBe('SELECT * FROM users');
  });

  it('addOffset - string value', async () => {
    // Arrange
    const statement = `SELECT * FROM users`;
    // Act
    const result = builder.addOffset(statement, ':1');
    // Arrange
    expect(result).toBe('SELECT * FROM users OFFSET :1');
  });

  it('addOffset - null value', async () => {
    // Arrange
    const statement = `SELECT * FROM users`;
    // Act
    const result = builder.addOffset(statement, null);
    // Arrange
    expect(result).toBe('SELECT * FROM users');
  });

  it('isNoOP - empty operation', async () => {
    // Act
    const result = builder.isNoOP({});
    // Arrange
    expect(result).toBe(true);
  });

  it('isNoOP - some operations', async () => {
    // Act
    const results = [{ limit: ':1' }, { offset: ':1' }].map(builder.isNoOP);
    // Arrange
    expect(results.every((result) => result === false)).toBeTruthy();
  });
});

it('BuildSQL function should build sql with operations', async () => {
  // Arrange
  const statement = `SELECT * FROM users;`;
  // Act
  const result = builder.buildSQL(statement, { limit: ':1', offset: ':2' });
  // Arrange
  expect(result).toBe(
    'SELECT * FROM (SELECT * FROM users) LIMIT :1 OFFSET :2;'
  );
});

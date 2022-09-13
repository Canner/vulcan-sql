const { DataSource, EXTENSION_IDENTIFIER_METADATA_KEY } = require('@vulcan-sql/core');
const { Stream } = require('stream');
const duckdb = require('duckdb');
const path = require('path');
const db = new duckdb.Database(path.resolve(__dirname, '..', 'test-data', 'moma.db'));
const _ = require('lodash');
// TODO: create logger from core package;
const { Logger } = require('tslog');
const logger = new Logger({
  name: 'duckdb',
  minLevel: 'info',
  exposeErrorCodeFrame: false,
  displayFilePath: 'hidden',
  displayFunctionName: false,
});

const getType = (value) => {
  const jsType = typeof (value);
  switch (jsType) {
    case 'boolean': return 'boolean';
    case 'number': return 'number';
    default: return 'string';
  }
}

class MockDataSource extends DataSource {
  async execute(options) {
    const { statement, bindParams } = options;
    // handle parameterized query statement
    let query = statement;

    const parameters = Array.from(bindParams.values());

    return new Promise((resolve, reject) => {
      logger.info(query, parameters);
      db.all(query, ...parameters, function (err, res) {
        if (err) {
          return reject(err)
        }
        const readStream = new Stream.Readable({
          objectMode: true,
          read: () => null,
        });
        res.forEach((r) => readStream.push(r));
        readStream.push(null);

        return resolve({
          getColumns: () => {
            if (!res[0]) return [];
            return Object.keys(res[0]).map(name => ({
              name, type: getType(res[0][name])
            }))
          },
          getData: () => {
            return readStream;
          },
        })

      });
    })

  }

  async prepare(params) {
    return `$${params.parameterIndex}`
  }
}

Reflect.defineMetadata(EXTENSION_IDENTIFIER_METADATA_KEY, 'duck', MockDataSource);

exports.MockDataSource = MockDataSource
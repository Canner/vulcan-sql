const { DataSource, EXTENSION_IDENTIFIER_METADATA_KEY } = require('@vulcan-sql/core');
const { Stream } = require('stream');
const duckdb = require('duckdb');
const path = require('path');
const db = new duckdb.Database(path.resolve(__dirname, '..', 'test-data', 'moma.db'));

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
    for (const identifier of Object.keys(bindParams)) {
      query = query.replace(
        // escape special char '$'
        new RegExp(identifier.replace('$', '\\$'), 'g'),
        bindParams[identifier]
      );
    }

    return new Promise((resolve, reject) => {
      console.log(query);
      db.all(query, function (err, res) {
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
    const identifiers = {};
    const binds = {};
    let index = 1;
    for (const key of Object.keys(params)) {
      const identifier = `$${index}`;
      identifiers[key] = identifier;
      binds[identifier] = params[key];
      index += 1;
    }
    return {
      identifiers,
      binds,
    };
  }
}

Reflect.defineMetadata(EXTENSION_IDENTIFIER_METADATA_KEY, 'duck', MockDataSource);

exports.MockDataSource = MockDataSource
#!/usr/bin/env node

const fs = require('fs');
const duckdb = require('duckdb');

console.log('remove db file');
if (fs.existsSync('moma.db'))
  fs.unlinkSync('moma.db');

const db = new duckdb.Database('moma.db');

async function runQuery(query) {
  return new Promise((resolve, reject) => {
    db.run(query, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  })
}

(async () => {
  console.log('inserting artists.csv ...');
  await runQuery(`create table artists as select * from "artists.csv"`);
  console.log('done.');

  console.log('inserting artworks.csv ...');
  await runQuery(`create table artworks as select * from "artworks.csv"`);
  console.log('done.');
})();

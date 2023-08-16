import { getTestCompiler } from '@vulcan-sql/test-utility';
import * as path from 'path';

describe('Test "rest_api" filter', () => {
  it(
    'Should throw error when not pass the "url" argument',
    async () => {
      const { compileAndLoad, execute } = await getTestCompiler({
        extensions: { rest_api: path.join(__dirname, '..', 'src') },
      });

      const sql = `{% set result = 1990 %}SELECT {{ result | rest_api(url='', arg='begin_date') }}`;

      // Act
      await compileAndLoad(sql);

      // Assert
      await expect(execute({})).rejects.toThrow(
        'url is required'
      );
    },
    50 * 1000
  );

  it(
    'The rest_api function should work with template engine',
    async () => {
      const { compileAndLoad, execute, getExecutedQueries, getCreatedBinding } = await getTestCompiler({
        extensions: { rest_api: path.join(__dirname, '..', 'src') },
      });

      const sql = `{% set result = 1990 %}SELECT {{ result | rest_api(url='http://localhost:3000/api/artists', arg='begin_date') }}`;

      // Act
      await compileAndLoad(sql);
      await execute({});

      // Assert
      const queries = await getExecutedQueries();
      const bindings = await getCreatedBinding();

      const expected = JSON.stringify(
        [
          {
            ConstituentID: 11159,
            DisplayName: 'Lexon, France',
            ArtistBio: 'est. 1990',
            Nationality: null,
            Gender: null,
            BeginDate: 1990,
            EndDate: 0,
            'Wiki QID': null,
            ULAN: null
          },
          {
            ConstituentID: 29566,
            DisplayName: 'OFFECCT',
            ArtistBio: 'Sweden, est. 1990',
            Nationality: 'Swedish',
            Gender: null,
            BeginDate: 1990,
            EndDate: 0,
            'Wiki QID': null,
            ULAN: null
          },
          {
            ConstituentID: 34168,
            DisplayName: 'Kengo Kuma & Associates',
            ArtistBio: 'Japan, est. 1990',
            Nationality: null,
            Gender: null,
            BeginDate: 1990,
            EndDate: 0,
            'Wiki QID': null,
            ULAN: null
          },
          {
            ConstituentID: 37888,
            DisplayName: 'Werkplaats Martin van Oel',
            ArtistBio: 'Dutch, est. 1990',
            Nationality: 'Dutch',
            Gender: null,
            BeginDate: 1990,
            EndDate: 0,
            'Wiki QID': null,
            ULAN: null
          },
          {
            ConstituentID: 46529,
            DisplayName: 'Joseph Pleass',
            ArtistBio: 'British, born 1990',
            Nationality: 'British',
            Gender: 'Male',
            BeginDate: 1990,
            EndDate: 0,
            'Wiki QID': null,
            ULAN: null
          },
          {
            ConstituentID: 48039,
            DisplayName: 'Jacqueline Yuan Quinn',
            ArtistBio: null,
            Nationality: 'American',
            Gender: 'Female',
            BeginDate: 1990,
            EndDate: 0,
            'Wiki QID': null,
            ULAN: null
          },
          {
            ConstituentID: 69266,
            DisplayName: 'Richard Malone',
            ArtistBio: 'Irish, born 1990',
            Nationality: 'Irish',
            Gender: 'Male',
            BeginDate: 1990,
            EndDate: 0,
            'Wiki QID': null,
            ULAN: null
          },
          {
            ConstituentID: 132997,
            DisplayName: 'Mohammed Iman Fayaz',
            ArtistBio: 'American, born 1990',
            Nationality: 'American',
            Gender: 'Male',
            BeginDate: 1990,
            EndDate: 0,
            'Wiki QID': null,
            ULAN: null
          },
          {
            ConstituentID: 133404,
            DisplayName: 'Zhang Han',
            ArtistBio: 'Chinese, born 1990',
            Nationality: 'Chinese',
            Gender: 'Female',
            BeginDate: 1990,
            EndDate: 0,
            'Wiki QID': null,
            ULAN: null
          },
          {
            ConstituentID: 134038,
            DisplayName: 'Diamond Stingily',
            ArtistBio: 'American, born 1990',
            Nationality: 'American',
            Gender: 'Female',
            BeginDate: 1990,
            EndDate: 0,
            'Wiki QID': null,
            ULAN: null
          }
        ]
      );

      expect(queries[0]).toBe('SELECT $1');
      expect(bindings[0].get('$1')).toEqual(expected);
    },
    50 * 1000
  );

  it(
    'The rest_api function should work with HTTP Post request',
    async () => {
      const { compileAndLoad, execute, getExecutedQueries, getCreatedBinding } = await getTestCompiler({
        extensions: { rest_api: path.join(__dirname, '..', 'src') },
      });

      const sql = `{% set body = '{"title": "BMW Pencil"}' %}SELECT {{ body | rest_api(url='https://dummyjson.com/products/add', method='POST', arg='body') }}`;

      // Act
      await compileAndLoad(sql);
      await execute({});

      // Assert
      const queries = await getExecutedQueries();
      const bindings = await getCreatedBinding();

      const expected = JSON.stringify({
        "id": 101
      });

      expect(queries[0]).toBe('SELECT $1');
      expect(bindings[0].get('$1')).toEqual(expected);
    },
    50 * 1000
  )
});
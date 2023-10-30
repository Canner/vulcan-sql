import { getTestCompiler } from '@vulcan-sql/test-utility';
import * as path from 'path';


describe('Test "rest_api" filter', () => {
  it(
    'Should throw error when not pass the "url" argument',
    async () => {
      const { compileAndLoad, execute } = await getTestCompiler({
        extensions: { rest_api: path.join(__dirname, '..', 'src') },
      });

      const sql = `SELECT {{ '' | rest_api(url='') }}`;

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
    'Should work with template engine and issue a GET request using the path parameter in value',
    async () => {
      const expected = JSON.stringify({
        id: 1,
        title: 'iPhone 9',
        description: 'An apple mobile which is nothing like apple',
        price: 549,
        discountPercentage: 12.96,
        rating: 4.69,
        stock: 94,
        brand: 'Apple',
        category: 'smartphones',
        thumbnail: 'https://i.dummyjson.com/data/products/1/thumbnail.jpg',
        images: [
          'https://i.dummyjson.com/data/products/1/1.jpg',
          'https://i.dummyjson.com/data/products/1/2.jpg',
          'https://i.dummyjson.com/data/products/1/3.jpg',
          'https://i.dummyjson.com/data/products/1/4.jpg',
          'https://i.dummyjson.com/data/products/1/thumbnail.jpg'
        ]
      });

      const { compileAndLoad, execute, getExecutedQueries, getCreatedBinding } = await getTestCompiler({
        extensions: { rest_api: path.join(__dirname, '..', 'src') },
      });

      const sql = `{% set value = { "path": { "id": 1 } } %}SELECT {{ value | rest_api(url='https://dummyjson.com/products/:id') | dump }}`;

      // Act
      await compileAndLoad(sql);
      await execute({});

      // Assert
      const queries = await getExecutedQueries();
      const bindings = await getCreatedBinding();

      expect(queries[0]).toBe('SELECT $1');
      expect(bindings[0].get('$1')).toEqual(expected);
    },
    50 * 1000
  )

  it(
    'Should work with template engine and issue a GET request using the query parameter in value',
    async () => {
      const expected = JSON.stringify({
        "products": [
          {
            "id": 1,
            "title": "iPhone 9",
            "description": "An apple mobile which is nothing like apple",
            "price": 549,
            "discountPercentage": 12.96,
            "rating": 4.69,
            "stock": 94,
            "brand": "Apple",
            "category": "smartphones",
            "thumbnail": "https://i.dummyjson.com/data/products/1/thumbnail.jpg",
            "images": [
              "https://i.dummyjson.com/data/products/1/1.jpg",
              "https://i.dummyjson.com/data/products/1/2.jpg",
              "https://i.dummyjson.com/data/products/1/3.jpg",
              "https://i.dummyjson.com/data/products/1/4.jpg",
              "https://i.dummyjson.com/data/products/1/thumbnail.jpg"
            ]
          },
          {
            "id": 2,
            "title": "iPhone X",
            "description": "SIM-Free, Model A19211 6.5-inch Super Retina HD display with OLED technology A12 Bionic chip with ...",
            "price": 899,
            "discountPercentage": 17.94,
            "rating": 4.44,
            "stock": 34,
            "brand": "Apple",
            "category": "smartphones",
            "thumbnail": "https://i.dummyjson.com/data/products/2/thumbnail.jpg",
            "images": [
              "https://i.dummyjson.com/data/products/2/1.jpg",
              "https://i.dummyjson.com/data/products/2/2.jpg",
              "https://i.dummyjson.com/data/products/2/3.jpg",
              "https://i.dummyjson.com/data/products/2/thumbnail.jpg"
            ]
          },
          {
            "id": 71,
            "title": "Women Shoulder Bags",
            "description": "LouisWill Women Shoulder Bags Long Clutches Cross Body Bags Phone Bags PU Leather Hand Bags Large Capacity Card Holders Zipper Coin Purses Fashion Crossbody Bags for Girls Ladies",
            "price": 46,
            "discountPercentage": 14.65,
            "rating": 4.71,
            "stock": 17,
            "brand": "LouisWill",
            "category": "womens-bags",
            "thumbnail": "https://i.dummyjson.com/data/products/71/thumbnail.jpg",
            "images": [
              "https://i.dummyjson.com/data/products/71/1.jpg",
              "https://i.dummyjson.com/data/products/71/2.jpg",
              "https://i.dummyjson.com/data/products/71/3.webp",
              "https://i.dummyjson.com/data/products/71/thumbnail.jpg"
            ]
          },
          {
            "id": 86,
            "title": "Bluetooth Aux",
            "description": "Bluetooth Aux Bluetooth Car Aux Car Bluetooth Transmitter Aux Audio Receiver Handfree Car Bluetooth Music Receiver Universal 3.5mm Streaming A2DP Wireless Auto AUX Audio Adapter With Mic For Phone MP3",
            "price": 25,
            "discountPercentage": 10.56,
            "rating": 4.57,
            "stock": 22,
            "brand": "Car Aux",
            "category": "automotive",
            "thumbnail": "https://i.dummyjson.com/data/products/86/thumbnail.jpg",
            "images": [
              "https://i.dummyjson.com/data/products/86/1.jpg",
              "https://i.dummyjson.com/data/products/86/2.webp",
              "https://i.dummyjson.com/data/products/86/3.jpg",
              "https://i.dummyjson.com/data/products/86/4.jpg",
              "https://i.dummyjson.com/data/products/86/thumbnail.jpg"
            ]
          }
        ],
        "total": 4,
        "skip": 0,
        "limit": 4
      });

      const { compileAndLoad, execute, getExecutedQueries, getCreatedBinding } = await getTestCompiler({
        extensions: { rest_api: path.join(__dirname, '..', 'src') },
      });

      const sql = `{% set value = { "query": { "q": "phone" }  } %}SELECT {{ value | rest_api(url='https://dummyjson.com/products/search') | dump }}`;

      // Act
      await compileAndLoad(sql);
      await execute({});

      // Assert
      const queries = await getExecutedQueries();
      const bindings = await getCreatedBinding();

      expect(queries[0]).toBe('SELECT $1');
      expect(bindings[0].get('$1')).toEqual(expected);
    },
    50 * 1000
  )

  it(
    'Should work with template engine and issue a POST request with body and header in value',
    async () => {
      const expected = JSON.stringify({
        id: 101,
        title: 'BMW Pencil'
      });

      const { compileAndLoad, execute, getExecutedQueries, getCreatedBinding } = await getTestCompiler({
        extensions: { rest_api: path.join(__dirname, '..', 'src') },
      });

      const sql = `{% set value = { "body": { "title": "BMW Pencil" }, "headers": { "Content-Type": "application/json" } } %}SELECT {{ value | rest_api(url='https://dummyjson.com/products/add', method='POST') | dump }}`;

      // Act
      await compileAndLoad(sql);
      await execute({});

      // Assert
      const queries = await getExecutedQueries();
      const bindings = await getCreatedBinding();

      expect(queries[0]).toBe('SELECT $1');
      expect(bindings[0].get('$1')).toEqual(expected);
    },
    50 * 1000
  )

  it(
    'Should work with template engine with field access',
    async () => {
      const expected = {
        id: 101,
        title: 'BMW Pencil'
      }.id;

      const { compileAndLoad, execute, getExecutedQueries, getCreatedBinding } = await getTestCompiler({
        extensions: { rest_api: path.join(__dirname, '..', 'src') },
      });

      const sql = `{% set value = { "body": { "title": "BMW Pencil" }, "headers": { "Content-Type": "application/json" } } %}SELECT {{ (value | rest_api(url='https://dummyjson.com/products/add', method='POST')).id }}`;

      // Act
      await compileAndLoad(sql);
      await execute({});

      // Assert
      const queries = await getExecutedQueries();
      const bindings = await getCreatedBinding();

      expect(queries[0]).toBe('SELECT $1');
      expect(bindings[0].get('$1')).toEqual(expected);
    },
    50 * 1000
  )
});

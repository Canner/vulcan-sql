import { DocumentOptions, ProjectOptions } from '@vulcan-sql/core';
import { RedocDocumentServer } from '../../src/lib/document-server';
import * as Koa from 'koa';
import * as supertest from 'supertest';
import faker from '@faker-js/faker';
import { Server } from 'http';

let http: Server;

afterEach(() => {
  http?.close();
});

it('Should serve redoc server with all the required contents', async () => {
  // Arrange
  const server = new RedocDocumentServer(
    {},
    '',
    new DocumentOptions({
      folderPath: __dirname,
    }),
    new ProjectOptions()
  );
  await server.activate();
  const app = new Koa();
  http = app.listen(faker.datatype.number({ min: 20000, max: 30000 }));
  app.use(server.handle.bind(server));
  const agent = supertest.agent(http);

  // Act
  const doc = await agent.get('/doc');
  const redocBundle = await agent.get('/doc/redoc');
  const spec = await agent.get('/doc/spec');

  // Assert
  expect(doc.text.startsWith(`<!DOCTYPE html>`)).toBeTruthy();
  expect(
    redocBundle.text.startsWith(
      `/*! For license information please see redoc.standalone.js.LICENSE.txt */`
    )
  ).toBeTruthy();
  expect(spec.body.toString()).toEqual(`name: "123"`);
});

it('Should follow the url path we set', async () => {
  // Arrange
  const server = new RedocDocumentServer(
    {
      url: 'some-path-other-than-doc',
    },
    '',
    new DocumentOptions(),
    new ProjectOptions()
  );
  await server.activate();
  const app = new Koa();
  http = app.listen(faker.datatype.number({ min: 20000, max: 30000 }));
  app.use(server.handle.bind(server));
  const agent = supertest.agent(http);

  // Act
  const doc = await agent.get('/some-path-other-than-doc');
  const redocBundle = await agent.get('/some-path-other-than-doc/redoc');

  // Assert
  expect(doc.text.startsWith(`<!DOCTYPE html>`)).toBeTruthy();
  expect(
    redocBundle.text.startsWith(
      `/*! For license information please see redoc.standalone.js.LICENSE.txt */`
    )
  ).toBeTruthy();
});

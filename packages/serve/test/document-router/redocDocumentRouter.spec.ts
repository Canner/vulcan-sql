import { ArtifactBuilder, ProjectOptions } from '@vulcan-sql/core';
import { RedocDocumentRouters } from '../../src/lib/document-router';
import * as Koa from 'koa';
import * as supertest from 'supertest';
import faker from '@faker-js/faker';
import { Server } from 'http';
import * as sinon from 'ts-sinon';

let http: Server;

afterEach(() => {
  http?.close();
});

it('Should serve redoc server with all the required contents', async () => {
  // Arrange
  const mockArtifactBuilder = sinon.stubInterface<ArtifactBuilder>();
  mockArtifactBuilder.getArtifact.returns({ oas3: { name: 123 } });
  const server = new RedocDocumentRouters(
    {},
    '',
    mockArtifactBuilder,
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
  expect(spec.body).toEqual({ name: 123 });
});

it('Should follow the url path we set', async () => {
  // Arrange
  const mockArtifactBuilder = sinon.stubInterface<ArtifactBuilder>();
  mockArtifactBuilder.getArtifact.returns({ oas3: { name: 123 } });
  const server = new RedocDocumentRouters(
    {
      url: 'some-path-other-than-doc',
    },
    '',
    mockArtifactBuilder,
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

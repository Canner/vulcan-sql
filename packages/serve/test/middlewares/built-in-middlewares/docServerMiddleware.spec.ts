import { DocumentOptions } from '@vulcan-sql/core';
import { DocRouterMiddleware, DocumentRouter } from '@vulcan-sql/serve';
import * as compose from 'koa-compose';
import * as sinon from 'ts-sinon';

describe('Test doc server middlewares', () => {
  let mockDocServer: Record<string, sinon.StubbedInstance<DocumentRouter<any>>>;
  let mockOption: DocumentOptions;
  const mockDocServerFactory = (name: string) => mockDocServer[name];

  beforeEach(() => {
    mockDocServer = {
      m1: sinon.stubInterface<DocumentRouter>(),
      m2: sinon.stubInterface<DocumentRouter>(),
      m3: sinon.stubInterface<DocumentRouter>(),
    };
    mockOption = new DocumentOptions({
      router: ['m1', 'm2'],
    });
  });

  it('Should active corresponding document router', async () => {
    // Arrange
    const middleware = new DocRouterMiddleware(
      {},
      '',
      mockDocServerFactory,
      mockOption
    );
    // Act
    await middleware.activate();
    // Assert
    expect(mockDocServer['m1'].activate?.called).toBeTruthy();
    expect(mockDocServer['m2'].activate?.called).toBeTruthy();
    expect(mockDocServer['m3'].activate?.called).toBeFalsy();
  });

  it('Should execute middleware with correct order', async () => {
    // mid1 -> mid2(m1 -> m2) -> mid3  -> | next | -> mid3 -> mid2(m2 -> m1) -> mid1
    // 1    ->      2  -> 3   -> 4     ->          -> 5    ->      6  -> 7   -> 8
    // Arrange
    const executeOrder: number[] = [];
    const mid1 = async (context: any, next: any) => {
      executeOrder.push(1);
      await next();
      executeOrder.push(8);
    };
    mockDocServer['m1'].handle.callsFake(async (context, next) => {
      executeOrder.push(2);
      await next();
      executeOrder.push(7);
    });
    mockDocServer['m2'].handle.callsFake(async (context, next) => {
      executeOrder.push(3);
      await next();
      executeOrder.push(6);
    });
    const mid2 = new DocRouterMiddleware(
      {},
      '',
      mockDocServerFactory,
      mockOption
    );
    const mid3 = async (context: any, next: any) => {
      executeOrder.push(4);
      await next();
      executeOrder.push(5);
    };
    // Act
    const execute = compose<any>([mid1, mid2.handle.bind(mid2), mid3]);
    await execute({});
    // Assert
    expect(executeOrder).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

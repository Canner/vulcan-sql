import { ContainerModule } from 'inversify';
import {
  IPaginationTransformer,
  IRequestTransformer,
  IRequestValidator,
  PaginationTransformer,
  RequestTransformer,
  RequestValidator,
  RouteGenerator,
} from '@vulcan/serve';
import { TYPES } from '../types';
import { TemplateEngine, TYPES as CORE_TYPES } from '@vulcan/core';

export const routeGeneratorModule = () =>
  new ContainerModule((bind) => {
    // Request Transformer
    bind<IRequestTransformer>(TYPES.IRequestTransformer)
      .to(RequestTransformer)
      .inSingletonScope();

    // Request Transformer
    bind<IRequestValidator>(TYPES.IRequestValidator)
      .to(RequestValidator)
      .inSingletonScope();

    // Pagination Transformer
    bind<IPaginationTransformer>(TYPES.IPaginationTransformer)
      .to(PaginationTransformer)
      .inSingletonScope();

    // Roue Generator
    bind<RouteGenerator>(TYPES.RouteGenerator)
      .to(RouteGenerator)
      .inSingletonScope();
  });

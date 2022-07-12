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

export const routeGeneratorModule = () =>
  new ContainerModule((bind) => {
    // Request Transformer
    bind<IRequestTransformer>(TYPES.RequestTransformer)
      .to(RequestTransformer)
      .inSingletonScope();

    // Request Transformer
    bind<IRequestValidator>(TYPES.RequestValidator)
      .to(RequestValidator)
      .inSingletonScope();

    // Pagination Transformer
    bind<IPaginationTransformer>(TYPES.PaginationTransformer)
      .to(PaginationTransformer)
      .inSingletonScope();

    // Roue Generator
    bind<RouteGenerator>(TYPES.RouteGenerator)
      .to(RouteGenerator)
      .inSingletonScope();
  });

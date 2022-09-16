export const TYPES = {
  // Route Generator
  RequestValidator: Symbol.for('RequestValidator'),
  RequestTransformer: Symbol.for('RequestTransformer'),
  PaginationTransformer: Symbol.for('PaginationTransformer'),
  Route: Symbol.for('Route'),
  RouteGenerator: Symbol.for('RouteGenerator'),

  // Application
  VulcanApplication: Symbol.for('VulcanApplication'),
  // Document router
  Factory_DocumentRouter: Symbol.for('Factory_DocumentRouter'),
  // Evaluation
  Evaluator: Symbol.for('Evaluator'),
  // Extensions
  Extension_RouteMiddleware: Symbol.for('Extension_RouteMiddleware'),
  Extension_Authenticator: Symbol.for('Extension_Authenticator'),
  Extension_Formatter: Symbol.for('Extension_Formatter'),
  Extension_DocumentRouter: Symbol.for('Extension_DocumentRouter'),
};

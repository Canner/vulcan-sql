export const TYPES = {
  // Artifact builder
  PersistentStore: Symbol.for('PersistentStore'),
  Factory_PersistentStore: Symbol.for('Factory_PersistentStore'),
  Serializer: Symbol.for('Serializer'),
  Factory_Serializer: Symbol.for('Factory_Serializer'),
  ArtifactBuilderOptions: Symbol.for('ArtifactBuilderOptions'),
  ArtifactBuilderInputOptions: Symbol.for('ArtifactBuilderInputOptions'),
  ArtifactBuilder: Symbol.for('ArtifactBuilder'),
  // Template engine
  TemplateProvider: Symbol.for('TemplateProvider'),
  Factory_TemplateProvider: Symbol.for('Factory_TemplateProvider'),
  CompilerExtension: Symbol.for('CompilerExtension'),
  CompilerLoader: Symbol.for('CompilerLoader'),
  CompilerEnvironment: Symbol.for('CompilerEnvironment'),
  Compiler: Symbol.for('Compiler'),
  TemplateEngine: Symbol.for('TemplateEngine'),
  TemplateEngineOptions: Symbol.for('TemplateEngineOptions'),
  TemplateEngineInputOptions: Symbol.for('TemplateEngineInputOptions'),
  // Executor
  Executor: Symbol.for('Executor'),
  // Data Query Builder
  IDataQueryBuilder: Symbol.for('IDataQueryBuilder'),
  // Data Source
  IDataSource: Symbol.for('IDataSource'),
  // Validator
  IValidatorLoader: Symbol.for('IValidatorLoader'),
  // source of extensions
  SourceOfExtensions: Symbol.for('SourceOfExtensions'),
};

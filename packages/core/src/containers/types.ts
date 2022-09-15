export const TYPES = {
  // Root options
  ProjectOptions: Symbol.for('ProjectOptions'),
  ProjectInputOptions: Symbol.for('ProjectInputOptions'),
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
  Factory_CompilerLoader: Symbol.for('Factory_CompilerLoader'),
  CompilerEnvironment: Symbol.for('CompilerEnvironment'),
  Compiler: Symbol.for('Compiler'),
  TemplateEngine: Symbol.for('TemplateEngine'),
  TemplateEngineOptions: Symbol.for('TemplateEngineOptions'),
  TemplateEngineInputOptions: Symbol.for('TemplateEngineInputOptions'),
  // Executor
  Executor: Symbol.for('Executor'),
  ExecutorOptions: Symbol.for('ExecutorOptions'),
  ExecutorInputOptions: Symbol.for('ExecutorInputOptions'),
  DataQueryBuilder: Symbol.for('DataQueryBuilder'),
  DataSource: Symbol.for('DataSource'),
  Factory_DataSource: Symbol.for('Factory_DataSource'),
  // Validator
  ValidatorLoader: Symbol.for('ValidatorLoader'),
  // Document
  DocumentInputOptions: Symbol.for('DocumentInputOptions'),
  DocumentOptions: Symbol.for('DocumentOptions'),
  // Profiles
  ProfilesInputOptions: Symbol.for('ProfilesInputOptions'),
  ProfilesOptions: Symbol.for('ProfilesOptions'),
  // Extensions
  ExtensionConfig: Symbol.for('ExtensionConfig'),
  ExtensionName: Symbol.for('ExtensionName'),
  Extension_TemplateEngine: Symbol.for('Extension_TemplateEngine'),
  Extension_InputValidator: Symbol.for('Extension_InputValidator'),
  Extension_TemplateProvider: Symbol.for('Extension_TemplateProvider'),
  Extension_Serializer: Symbol.for('Extension_Serializer'),
  Extension_PersistentStore: Symbol.for('Extension_PersistentStore'),
  Extension_CompilerLoader: Symbol.for('Extension_CompilerLoader'),
  Extension_DataSource: Symbol.for('Extension_DataSource'),
};

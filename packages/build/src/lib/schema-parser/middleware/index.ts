import { ClassType } from '@vulcan-sql/core';
import { GenerateUrl } from './generateUrl';
import { CheckValidator } from './checkValidator';
import { CheckCache } from './checkCache'
import { TransformValidator } from './transformValidator';
import { GenerateTemplateSource } from './generateTemplateSource';
import { AddParameter } from './addParameter';
import { AddMissingErrors } from './addMissingErrors';
import { FallbackErrors } from './fallbackErrors';
import { NormalizeFieldIn } from './normalizeFieldIn';
import { GenerateDataType } from './generateDataType';
import { NormalizeDataType } from './normalizeDataType';
import { GeneratePathParameters } from './generatePathParameters';
import { AddRequiredValidatorForPath } from './addRequiredValidatorForPath';
import { SetConstraints } from './setConstraints';
import { SchemaParserMiddleware } from './middleware';
import { ResponseSampler } from './responseSampler';
import { CheckProfile } from './checkProfile';
import { ExtractPaginationParams } from './extractPaginationParams';
import { TransformPaginationMode } from './transformPaginationMode';

export * from './middleware';

// The order of middleware here indicates the order of their execution, the first one will be executed first, and so on.
export const SchemaParserMiddlewares: ClassType<SchemaParserMiddleware>[] = [
  GenerateUrl,
  CheckValidator,
  TransformValidator,
  GenerateTemplateSource,
  AddParameter,
  AddMissingErrors,
  FallbackErrors,
  NormalizeFieldIn,
  GenerateDataType,
  NormalizeDataType,
  GeneratePathParameters,
  AddRequiredValidatorForPath,
  TransformPaginationMode,
  SetConstraints,
  ExtractPaginationParams, // ExtractPaginationParams should be loaded after SetConstraints
  ResponseSampler,
  CheckProfile,
  CheckCache,
];

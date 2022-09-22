import { ClassType } from '@vulcan-sql/core';
import { GenerateUrl } from './generateUrl';
import { CheckValidator } from './checkValidator';
import { TransformValidator } from './transformValidator';
import { GenerateTemplateSource } from './generateTemplateSource';
import { CheckParameter } from './checkParameter';
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

export * from './middleware';

// The order of middleware here indicates the order of their execution, the first one will be executed first, and so on.
export const SchemaParserMiddlewares: ClassType<SchemaParserMiddleware>[] = [
  GenerateUrl,
  CheckValidator,
  TransformValidator,
  GenerateTemplateSource,
  CheckParameter,
  AddMissingErrors,
  FallbackErrors,
  NormalizeFieldIn,
  GenerateDataType,
  NormalizeDataType,
  GeneratePathParameters,
  AddRequiredValidatorForPath,
  SetConstraints,
  ResponseSampler,
  CheckProfile,
];

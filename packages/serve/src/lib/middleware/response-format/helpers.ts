import { UserError } from '@vulcan-sql/core';
import { KoaContext } from '@vulcan-sql/serve/models';
import { BaseResponseFormatter } from '@vulcan-sql/serve/models';

export type ResponseFormatterMap = {
  [name: string]: BaseResponseFormatter;
};

/**
 *
 * @param context koa context
 * @param formatters the formatters which built-in and loaded extensions.
 * @returns the format name used to format response
 */
export const checkUsableFormat = ({
  context,
  supportedFormats,
  defaultFormat,
}: {
  context: KoaContext;
  supportedFormats: string[];
  defaultFormat: string;
}) => {
  // find last matched value be format
  const pathFormat = context.path.split('.')[1];

  // match result for searching in Accept header.
  const acceptFormat = context.accepts(supportedFormats);

  // if path ending has no format
  if (!pathFormat) {
    // Use the default when "acceptFormat" us array type, because array type only happened when "supportedFormats" is [] and "Accept" header has multiple
    if (Array.isArray(acceptFormat)) return defaultFormat;
    // get default when "Accept" header also not matched or "Accept" header not in request (shows by */*)
    if (!acceptFormat || acceptFormat == '*/*') return defaultFormat;
    // if accept format existed, use "Accept" first matched format by support format order
    return acceptFormat;
  }

  // if path ending has format but not matched
  if (!supportedFormats.includes(pathFormat)) {
    // Throw error if user request with url ending format, but not matched.
    throw new UserError(`Url ending format not matched in "formats" options`, {
      httpCode: 415,
    });
  }
  // if path ending has format and matched, no matter Accept matched or not, use path ending format
  return pathFormat;
};

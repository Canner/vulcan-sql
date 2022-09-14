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
    // get default when "Accept" header also not matched or "Accept" header not in request (shows by */*)
    if (!acceptFormat || acceptFormat == '*/*') return defaultFormat;
    // if accept format existed, use "Accept" first matched format by support format order
    return acceptFormat;
  }

  // if path ending has format but not matched
  if (!supportedFormats.includes(pathFormat)) {
    // throw error if "Accept" header also not matched or "Accept" header not in request (shows by */*)
    if (!acceptFormat || acceptFormat == '*/*')
      throw new Error(
        `Url ending format and "Accept" header both not matched in "formats" options`
      );
    // if accept format existed, use "Accept" first matched format by support format order
    return acceptFormat;
  }
  // if path ending has format and matched, no matter Accept matched or not, use path ending format
  return pathFormat;
};

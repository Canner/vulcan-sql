import { KoaContext } from '@vulcan-sql/serve/models';
import { BaseResponseFormatter } from '@vulcan-sql/serve/models';

export type ResponseFormatterMap = {
  [name: string]: BaseResponseFormatter;
};

/**
 * start to formatting if path is end with the format or "Accept" in the header contains the format
 * @param context koa context
 * @param format the formate name
 * @returns boolean, is received
 */
export const isReceivedFormatRequest = (
  context: KoaContext,
  format: string
) => {
  if (context.request.path.endsWith(`.${format}`)) return true;
  if (context.request.accepts(format)) return true;
  return false;
};

/**
 *
 * @param context koa context
 * @param formatters the formatters which built-in and loaded extensions.
 * @returns the format name used to format response
 */
export const checkUsableFormat = ({
  context,
  formatters,
  supportedFormats,
  defaultFormat,
}: {
  context: KoaContext;
  formatters: ResponseFormatterMap;
  supportedFormats: string[];
  defaultFormat: string;
}) => {
  for (const format of supportedFormats) {
    if (!(format in formatters)) continue;
    if (!isReceivedFormatRequest(context, format)) continue;
    return format;
  }
  // if not found, use default format
  if (!(defaultFormat in formatters))
    throw new Error(`Not find implemented formatters named ${defaultFormat}`);

  return defaultFormat;
};

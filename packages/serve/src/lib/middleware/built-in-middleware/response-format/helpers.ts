import { ClassType, SourceOfExtensions } from '@vulcan-sql/core';
import { loadExtensions } from '@vulcan-sql/serve/loader';
import { KoaRouterContext } from '@vulcan-sql/serve/route';
import {
  BaseResponseFormatter,
  BuiltInFormatters,
} from '@vulcan-sql/serve/response-formatter';

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
  context: KoaRouterContext,
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
  context: KoaRouterContext;
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

/**
 * load all usable formatter classes from built-in and extension to initialized
 * @param extensions
 * @returns formatter
 */
export const loadUsableFormatters = async (
  extensions?: SourceOfExtensions
): Promise<ResponseFormatterMap> => {
  const formatters: { [name: string]: BaseResponseFormatter } = {};
  let classes: ClassType<BaseResponseFormatter>[] = [...BuiltInFormatters];
  // the extensions response formatters
  if (extensions) {
    const extClasses = await loadExtensions('response-formatter', extensions);
    classes = [...classes, ...extClasses];
  }
  for (const cls of classes) {
    const formatter = new cls();
    formatters[formatter.name.toLowerCase()] = formatter;
  }
  return formatters;
};

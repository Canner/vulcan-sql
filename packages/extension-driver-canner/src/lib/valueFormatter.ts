import { isEmpty } from 'lodash';

const OBJECT_ID_TYPE = 'ObjectId';
const isBase64 = (value: string) =>
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(
    value
  );

/**
 * Count the column index locations which type is ObjectId
 * @param columns Columns information
 * @returns number[]: the column index locations of objectId
 */
export function countObjectIdColumnLocations(
  columns?: Array<{
    name: string;
    type: string;
  }>
) {
  // Leave function if column is empty (null, undefined or [])
  if (isEmpty(columns)) return [];
  // If column exist, format the value if the type field is ObjectId of the column
  // Find indexes of type of column if ObjectId
  return columns!.reduce((colCounter, currColumn, index) => {
    if (currColumn.type === OBJECT_ID_TYPE) colCounter.push(index);
    return colCounter;
  }, [] as Array<number>);
}

// format the value of Object Id type from base64 to object ID original value.
export function formatObjectIdTypeValue({
  data,
  objectIdColumns,
}: {
  data: any[][];
  objectIdColumns: Array<number>;
}) {
  // Leave function if ObjectId column indexes is empty
  if (isEmpty(objectIdColumns)) return data;
  // If column exist, format the value if the type field is ObjectId of the column

  // Traversing each row data
  const result = data!.map((rowData) => {
    // Format objectId value if the column of ObjectId type field is base64 format in current row
    for (const colIdx of objectIdColumns) {
      if (isBase64(rowData[colIdx])) {
        // Get Object Id original value (hex)
        const bytes = Buffer.from(rowData[colIdx], 'base64').toString('hex');
        rowData[colIdx] = bytes;
      }
    }
    return rowData;
  });
  return result;
}

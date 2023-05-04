export { default as FilterOutlined } from '@ant-design/icons/FilterOutlined';
export { default as DownOutlined } from '@ant-design/icons/DownOutlined';

enum ColumnType {
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  Datetime = 'DATETIME',
  Number = 'NUMBER',
  String = 'STRING',
}

export interface Column {
  description?: string;
  name: string;
  type: ColumnType;
}

export interface Parameter {
  description?: string;
  key: string;
  name: string;
  required: boolean;
  type: ColumnType;
}

export interface DatasetMetadata {
  currentCount: number;
  totalCount: number;
}

export interface Dataset {
  apiUrl: string;
  csvDownloadUrl: string;
  data: any;
  jsonDownloadUrl: string;
  metadata: DatasetMetadata;
  shareJsonUrl: string;
}

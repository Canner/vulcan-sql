enum ColumnType {
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  Datetime = 'DATETIME',
  Number = 'NUMBER',
  String = 'STRING',
}

export interface Endpoint {
  slug: string;
  name: string;
  description?: string;
  apiDocUrl: string;
  parameters: Parameter[];
  columns: Column[];
}

export interface Column {
  description?: string;
  name: string;
  type: ColumnType | string;
}

export interface Parameter {
  description?: string;
  key: string;
  name: string;
  required: boolean;
  type: ColumnType | string;
}

export interface DatasetMetadata {
  currentCount: number;
  totalCount: number;
}

export interface Dataset {
  apiUrl: string;
  csvDownloadUrl?: string;
  jsonDownloadUrl?: string;
  data: any;
  metadata: DatasetMetadata;
  shareJsonUrl: string;
}

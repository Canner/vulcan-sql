import { APISchema } from '@vulcan-sql/core';

interface IParameter {
  name: string;
  key: string;
  description: string;
  required: boolean;
  type: string;
}

interface IColumn {
  name: string;
  type: string;
  description: string;
}

interface IEndpoint {
  slug: string;
  name: string;
  description: string;
  apiDocUrl: string;
  parameters: IParameter[];
  columns: IColumn[];
}

type APIRawSchema = APISchema & {
  sourceName: string;
  apiDocUrl: string;
  url: string;
  apiUrl: string;
};

export class Endpoint implements IEndpoint {
  private schema: APIRawSchema;
  constructor(schema: APIRawSchema) {
    this.schema = schema;
  }

  get slug() {
    return encodeURIComponent(this.schema.sourceName);
  }

  get name() {
    return this.schema.sourceName;
  }

  get description() {
    return this.schema.description;
  }
  get apiDocUrl() {
    return this.schema.apiDocUrl;
  }
  get parameters() {
    return this.schema.request.map((param) => {
      return {
        name: param.fieldName,
        key: param.fieldName,
        description: param.description,
        required: param.validators.some(
          (validator) => validator.name === 'required'
        ),
        type: param.type,
      };
    });
  }
  get columns() {
    return this.schema.response.map((column) => {
      return {
        name: column.name,
        type: column.type as string,
        description: column?.description || '',
      };
    });
  }
}

interface IDataset {
  data: any[];
  metadata: {
    currentCount: number;
    totalCount: number;
  };
  apiUrl: string;
  csvDownloadUrl: string;
  jsonDownloadUrl: string;
}

export class Dataset implements IDataset {
  private schema: APIRawSchema;
  private originalData: any[];
  public data: any[];

  constructor(schema: APIRawSchema, originalData: any[]) {
    this.schema = schema;
    this.originalData = originalData;

    // get the first 100 rows
    this.data = this.originalData.slice(0, 100);
  }

  get metadata() {
    return {
      totalCount: this.originalData.length,
      currentCount: this.data.length,
    };
  }

  get apiUrl() {
    return this.schema.apiUrl;
  }

  get csvDownloadUrl() {
    return `${this.schema.apiUrl}.csv`;
  }

  get jsonDownloadUrl() {
    return `${this.schema.apiUrl}.json`;
  }
}

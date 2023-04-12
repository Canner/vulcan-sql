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

interface RequestSchema {
  fieldName: string;
  fieldIn: string;
  description: string;
  type: string;
  validators: Array<{ name: string; args: Record<string, any> }>;
  constraints: Array<Record<string, any>>;
}

interface ResponseSchema {
  name: string;
  description: string;
  type: string;
  required: boolean;
}

interface Sample {
  parameters: Record<string, any>;
  profile: string;
  req?: Record<string, any>;
}

interface APISchema {
  sourceName: string;
  urlPath: string;
  templateSource: string;
  request: Array<RequestSchema>;
  response: Array<ResponseSchema>;
  errors: Array<{ code: string; message: string }>;
  description?: string;
  pagination?: {
    mode: string;
    keyName?: string;
  };
  sample?: Array<Sample>;
  profiles?: string[];
}

type Schema = APISchema & {
  apiDocUrl: string;
  // host + urlPath
  url: string;
  // urlPath with actual param values
  actualPath: string;
  // host + urlPath with actual param values
  actualUrl: string;
  // the search key included auth token
  shareKey: string;
};

export class Endpoint implements IEndpoint {
  private schema: Schema;
  constructor(schema: Schema) {
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
        type: param.type,
        key: param.fieldName,
        description: param.description,
        required: param.validators.some(
          (validator) => validator.name === 'required'
        ),
      };
    });
  }
  get columns() {
    return this.schema.response.map((column) => {
      return {
        name: column.name,
        type: column.type as string,
        description: column.description || '',
        required: column.required || false,
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
  shareJsonUrl: string;
}

export class Dataset implements IDataset {
  private schema: Schema;
  private originalData: any[];
  public data: any[];

  constructor(schema: Schema, originalData: any[]) {
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
    return this.schema.actualUrl;
  }

  get csvDownloadUrl() {
    const formatPath = this.getFormatPath(this.schema.actualPath, '.csv');
    return `/api/download${formatPath}${this.getShareKey()}`;
  }

  get jsonDownloadUrl() {
    const formatPath = this.getFormatPath(this.schema.actualPath, '.json');
    return `/api/download${formatPath}${this.getShareKey()}`;
  }

  get shareJsonUrl() {
    const formatUrl = this.getFormatPath(this.schema.actualUrl, '.json');
    return `${formatUrl}${this.getShareKey()}`;
  }

  private getFormatPath(urlPath, format = '') {
    const [path, search] = urlPath.split('?');
    const searchKey = search ? `?${search}` : '';
    return `${path}${format}${searchKey}`;
  }

  private getShareKey() {
    const { shareKey, actualPath } = this.schema;
    const hasQuery = actualPath.includes('?');
    return hasQuery ? shareKey.replace('?', '&') : shareKey;
  }
}

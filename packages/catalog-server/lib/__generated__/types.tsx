import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  JSON: any;
};

export type Column = {
  __typename?: 'Column';
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  type: ColumnType;
};

export enum ColumnType {
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  Datetime = 'DATETIME',
  Number = 'NUMBER',
  String = 'STRING'
}

export type Dataset = {
  __typename?: 'Dataset';
  apiUrl: Scalars['String'];
  csvDownloadUrl?: Maybe<Scalars['String']>;
  data: Scalars['JSON'];
  jsonDownloadUrl?: Maybe<Scalars['String']>;
  metadata: DatasetMetadata;
  shareJsonUrl: Scalars['String'];
};

export type DatasetMetadata = {
  __typename?: 'DatasetMetadata';
  currentCount: Scalars['Int'];
  totalCount: Scalars['Int'];
};

export type Endpoint = {
  __typename?: 'Endpoint';
  apiDocUrl: Scalars['String'];
  columns: Array<Maybe<Column>>;
  description?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  parameters: Array<Maybe<Parameter>>;
  slug: Scalars['String'];
};

export type Parameter = {
  __typename?: 'Parameter';
  description?: Maybe<Scalars['String']>;
  key: Scalars['String'];
  name: Scalars['String'];
  required: Scalars['Boolean'];
  type: ColumnType;
};

export type Query = {
  __typename?: 'Query';
  dataset: Dataset;
  endpoint: Endpoint;
  endpoints: Array<Maybe<Endpoint>>;
};


export type QueryDatasetArgs = {
  endpointSlug?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['JSON']>;
};


export type QueryEndpointArgs = {
  slug?: InputMaybe<Scalars['String']>;
};

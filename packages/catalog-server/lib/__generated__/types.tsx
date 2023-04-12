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
  name?: Maybe<Scalars['String']>;
  type?: Maybe<ColumnType>;
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
  apiUrl?: Maybe<Scalars['String']>;
  csvDownloadUrl?: Maybe<Scalars['String']>;
  data?: Maybe<Scalars['JSON']>;
  jsonDownloadUrl?: Maybe<Scalars['String']>;
  metadata?: Maybe<DatasetMetadata>;
  shareJsonUrl?: Maybe<Scalars['String']>;
};

export type DatasetMetadata = {
  __typename?: 'DatasetMetadata';
  currentCount?: Maybe<Scalars['Int']>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type Endpoint = {
  __typename?: 'Endpoint';
  apiDocUrl?: Maybe<Scalars['String']>;
  columns?: Maybe<Array<Maybe<Column>>>;
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  parameters?: Maybe<Array<Maybe<Parameter>>>;
  slug?: Maybe<Scalars['String']>;
};

export type Parameter = {
  __typename?: 'Parameter';
  description?: Maybe<Scalars['String']>;
  key?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  required?: Maybe<Scalars['Boolean']>;
  type?: Maybe<ColumnType>;
};

export type Query = {
  __typename?: 'Query';
  dataset?: Maybe<Dataset>;
  endpoint?: Maybe<Endpoint>;
  endpoints?: Maybe<Array<Maybe<Endpoint>>>;
};


export type QueryDatasetArgs = {
  endpointSlug?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['JSON']>;
};


export type QueryEndpointArgs = {
  slug?: InputMaybe<Scalars['String']>;
};

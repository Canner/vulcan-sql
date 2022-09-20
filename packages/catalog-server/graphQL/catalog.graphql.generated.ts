import * as Types from '../lib/__generated__/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type EndpointsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type EndpointsQuery = { __typename?: 'Query', endpoints?: Array<{ __typename?: 'Endpoint', slug?: string | null, name?: string | null, description?: string | null, apiDocUrl?: string | null } | null> | null };

export type EndpointQueryVariables = Types.Exact<{
  slug?: Types.InputMaybe<Types.Scalars['String']>;
}>;


export type EndpointQuery = { __typename?: 'Query', endpoint?: { __typename?: 'Endpoint', slug?: string | null, name?: string | null, description?: string | null, apiDocUrl?: string | null, parameters?: Array<{ __typename?: 'Parameter', name?: string | null, key?: string | null, type?: Types.ColumnType | null, description?: string | null, required?: boolean | null } | null> | null, columns?: Array<{ __typename?: 'Column', name?: string | null, type?: Types.ColumnType | null, description?: string | null } | null> | null } | null };

export type DatasetQueryVariables = Types.Exact<{
  endpointSlug?: Types.InputMaybe<Types.Scalars['String']>;
  filter?: Types.InputMaybe<Types.Scalars['JSON']>;
}>;


export type DatasetQuery = { __typename?: 'Query', dataset?: { __typename?: 'Dataset', data?: any | null, apiUrl?: string | null, csvDownloadUrl?: string | null, jsonDownloadUrl?: string | null, metadata?: { __typename?: 'DatasetMetadata', currentCount?: number | null, totalCount?: number | null } | null } | null };


export const EndpointsDocument = gql`
    query Endpoints {
  endpoints {
    slug
    name
    description
    apiDocUrl
  }
}
    `;

/**
 * __useEndpointsQuery__
 *
 * To run a query within a React component, call `useEndpointsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEndpointsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEndpointsQuery({
 *   variables: {
 *   },
 * });
 */
export function useEndpointsQuery(baseOptions?: Apollo.QueryHookOptions<EndpointsQuery, EndpointsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EndpointsQuery, EndpointsQueryVariables>(EndpointsDocument, options);
      }
export function useEndpointsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EndpointsQuery, EndpointsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EndpointsQuery, EndpointsQueryVariables>(EndpointsDocument, options);
        }
export type EndpointsQueryHookResult = ReturnType<typeof useEndpointsQuery>;
export type EndpointsLazyQueryHookResult = ReturnType<typeof useEndpointsLazyQuery>;
export type EndpointsQueryResult = Apollo.QueryResult<EndpointsQuery, EndpointsQueryVariables>;
export const EndpointDocument = gql`
    query Endpoint($slug: String) {
  endpoint(slug: $slug) {
    slug
    name
    description
    apiDocUrl
    parameters {
      name
      key
      type
      description
      required
    }
    columns {
      name
      type
      description
    }
  }
}
    `;

/**
 * __useEndpointQuery__
 *
 * To run a query within a React component, call `useEndpointQuery` and pass it any options that fit your needs.
 * When your component renders, `useEndpointQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEndpointQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useEndpointQuery(baseOptions?: Apollo.QueryHookOptions<EndpointQuery, EndpointQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<EndpointQuery, EndpointQueryVariables>(EndpointDocument, options);
      }
export function useEndpointLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<EndpointQuery, EndpointQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<EndpointQuery, EndpointQueryVariables>(EndpointDocument, options);
        }
export type EndpointQueryHookResult = ReturnType<typeof useEndpointQuery>;
export type EndpointLazyQueryHookResult = ReturnType<typeof useEndpointLazyQuery>;
export type EndpointQueryResult = Apollo.QueryResult<EndpointQuery, EndpointQueryVariables>;
export const DatasetDocument = gql`
    query Dataset($endpointSlug: String, $filter: JSON) {
  dataset(endpointSlug: $endpointSlug, filter: $filter) {
    data
    apiUrl
    csvDownloadUrl
    jsonDownloadUrl
    metadata {
      currentCount
      totalCount
    }
  }
}
    `;

/**
 * __useDatasetQuery__
 *
 * To run a query within a React component, call `useDatasetQuery` and pass it any options that fit your needs.
 * When your component renders, `useDatasetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDatasetQuery({
 *   variables: {
 *      endpointSlug: // value for 'endpointSlug'
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useDatasetQuery(baseOptions?: Apollo.QueryHookOptions<DatasetQuery, DatasetQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DatasetQuery, DatasetQueryVariables>(DatasetDocument, options);
      }
export function useDatasetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DatasetQuery, DatasetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DatasetQuery, DatasetQueryVariables>(DatasetDocument, options);
        }
export type DatasetQueryHookResult = ReturnType<typeof useDatasetQuery>;
export type DatasetLazyQueryHookResult = ReturnType<typeof useDatasetLazyQuery>;
export type DatasetQueryResult = Apollo.QueryResult<DatasetQuery, DatasetQueryVariables>;
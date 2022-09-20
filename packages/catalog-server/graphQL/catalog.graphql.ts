import { gql } from '@apollo/client';

export const Endpoints = gql`
  query Endpoints {
    endpoints {
      slug
      name
      description
      apiDocUrl
    }
  }
`;

export const Endpoint = gql`
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

export const Dataset = gql`
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

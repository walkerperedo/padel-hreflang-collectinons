import { gql } from 'graphql-request'

export const GET_COLLECTION_URL = gql`
  query getCollectionMetafields($id: ID!) {
    collection(id: $id) {
      onlineStoreUrl
    }
  }
`
export const GET_ALL_COLLECTIONS_URL = gql`
  query getAllCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      edges {
        node {
          onlineStoreUrl
          id
        }
      }
      pageInfo {
        endCursor
      }
      totalCount
    }
  }
`

import { gql } from 'graphql-request'

export const GET_COLLECTION_URL = gql`
  query getCollectionMetafields($id: ID!) {
    collection(id: $id) {
      onlineStoreUrl
    }
  }
`

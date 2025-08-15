import { gql } from 'graphql-request'

export const UPDATE_METAFIELD = gql`
  mutation updateMetafields($id: ID!, $value: String!) {
    collectionUpdate(
      input: { id: $id, metafields: [{ namespace: "custom", key: "ocultar_hreflang_del_mercado", value: $value }] }
    ) {
      collection {
        metafield(namespace: "custom", key: "ocultar_hreflang_del_mercado") {
          value
        }
      }
    }
  }
`

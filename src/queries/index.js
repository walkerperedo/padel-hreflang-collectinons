import { gql } from 'graphql-request'

export const getMetafields = `
  query getCollectionMetafields {
  collection(id: "gid://shopify/Collection/460738003249") {
    metafield(namespace: "custom", key: "ocultar_hreflang_del_mercado") {
      value
    }
  }
}
  `

export const updateMetafields = gql`
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

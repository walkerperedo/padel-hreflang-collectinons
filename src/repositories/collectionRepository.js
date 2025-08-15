import { createAdminApiClient } from '@shopify/admin-api-client'
import { createStorefrontApiClient } from '@shopify/storefront-api-client'
import { GET_ALL_COLLECTIONS_URL, GET_COLLECTION_URL } from '../queries/getCollectionUrl.js'
import { UPDATE_METAFIELD } from '../queries/index.js'
import dotenv from 'dotenv'

dotenv.config()

const adminClient = createAdminApiClient({
  storeDomain: process.env.STORE_DOMAIN,
  apiVersion: process.env.API_VERSION,
  accessToken: process.env.ADMIN_ACCESS_TOKEN,
})

const storeFrontClient = createStorefrontApiClient({
  storeDomain: process.env.STORE_DOMAIN,
  apiVersion: process.env.API_VERSION,
  publicAccessToken: process.env.STORE_FRONT_TOKEN,
})

export const collectionRepository = {
  async getCollectionUrl(collectionId) {
    const { data, errors } = await storeFrontClient.request(GET_COLLECTION_URL, {
      variables: { id: collectionId },
    })
    if (errors) throw errors
    return data?.collection?.onlineStoreUrl
  },

  async getAllCollections(endCursor = null) {
    const { data, errors } = await storeFrontClient.request(GET_ALL_COLLECTIONS_URL, {
      variables: {
        first: 250,
        after: endCursor,
      },
    })
    if (errors) throw errors
    return {
      collectionData: data?.collections?.edges.map((edge) => ({ collectionUrl: edge.node.onlineStoreUrl, id: edge.node.id })) || [],
      totalCount: data?.collections?.totalCount || 0,
      endCursor: data?.collections?.pageInfo?.endCursor || null,
    }
  },

  async updateMetafields(collectionId, hreflangs) {
    const { data, errors } = await adminClient.request(UPDATE_METAFIELD, {
      variables: {
        id: collectionId,
        value: JSON.stringify(hreflangs),
      },
    })
    if (errors) throw errors
    return data
  },
}

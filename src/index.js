import { createAdminApiClient } from '@shopify/admin-api-client'
import { getMetafields, updateMetafields } from './queries/index.js'
import dotenv from 'dotenv'
dotenv.config()

const client = createAdminApiClient({
  storeDomain: 'padelproshop-pro.myshopify.com',
  apiVersion: '2025-07',
  accessToken: process.env.ADMIN_ACCESS_TOKEN || '',
})
const value = JSON.stringify([
  'de',
  'en',
  'it',
  'es-sa',
  'en-sa',
  'es-us',
  'en-us',
  'es-eu',
  'de-eu',
  'fr-eu',
  'en-eu',
  'it-eu',
  'es-la',
  'en-la',
  'it-la',
  'es-mx',
  'en-mx',
  'es',
  'en-mt',
  'en-cy',
  'en-my',
  'en-id',
  'en-sg',
  'en-om',
  'en-kw',
  'en-th',
  'en-ph',
  'en-qa',
  'en-ae',
  'en-bh',
])
const variables = {
  id: 'gid://shopify/Collection/460738003249',
  value: value,
}

async function fetchData() {
  const { data, errors } = await client.request(updateMetafields, {
    variables,
  })
  if (errors) {
    console.error(errors)
  }
  console.log('+=========---====================')
  console.log(data.collectionUpdate.collection.metafield)
}

fetchData()

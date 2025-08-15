import { createAdminApiClient } from '@shopify/admin-api-client'
import { createStorefrontApiClient } from '@shopify/storefront-api-client'
import { GET_COLLECTION_URL } from '../queries/getCollectionUrl.js'
import { logger } from '../utils/logger.js'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import { updateMetafields } from '../queries/index.js'
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

async function getHreflangs(url) {
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)

  const hreflangs = []
  $('link[rel="alternate"][hreflang]').each((_, elem) => {
    hreflangs.push({
      hreflang: $(elem).attr('hreflang'),
      href: $(elem).attr('href'),
    })
  })
  return hreflangs
}

async function hasNoindexNofollow(url) {
  try {
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    const robotsMeta = $('meta[name="robots"]').attr('content')
    if (!robotsMeta) return false

    const normalized = robotsMeta.toLowerCase().replace(/\s+/g, '')
    return normalized.includes('noindex') || normalized.includes('nofollow')
  } catch (err) {
    console.error(`Error checking ${url}:`, err)
    return false
  }
}

const updateHrefLang = async (collectionId) => {
  const variables = { id: collectionId }
  const { data, errors } = await storeFrontClient.request(GET_COLLECTION_URL, { variables })

  if (errors) {
    logger.error('Error fetching collection URL:', errors)
    return Promise.reject(errors)
  }

  const collectionUrl = data.collection.onlineStoreUrl

  const hreflangs = await getHreflangs(collectionUrl)
  const results = []
  for (const { hreflang, href } of hreflangs) {
    const hasNoindex = await hasNoindexNofollow(href)
    if (hasNoindex && hreflang !== 'x-default') results.push({ hreflang: hreflang.toLowerCase(), href: href.toLowerCase() })
  }

  const hrefs = results.map(({ hreflang }) => hreflang)
  const vars = {
    id: collectionId,
    value: JSON.stringify(hrefs),
  }
  console.log("variabales", vars)
  const { data: mutationData, errors: mutationErrors } = await adminClient.request(updateMetafields, { variables: vars })

  console.log('Data from updateMetafields:', mutationData.collectionUpdate.collection.metafield)
  console.log('Errors from updateMetafields:', mutationErrors)
  return hrefs
}

export { updateHrefLang }

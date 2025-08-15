import { seoUtils } from '../utils/seoUtils.js'
import { logger } from '../utils/logger.js'
import pLimit from 'p-limit'

export class HreflangService {
  constructor({ collectionRepo }) {
    this.collectionRepo = collectionRepo
  }

  async updateHrefLang(collectionId) {
    try {
      // 1. Get collection URL
      const collectionUrl = await this.collectionRepo.getCollectionUrl(collectionId)
      if (!collectionUrl) throw new Error(`Collection URL not found for ${collectionId}`)

      // 2. Extract hreflangs
      const hreflangs = await seoUtils.getHreflangs(collectionUrl)

      // 3. Filter hreflangs with noindex/nofollow
      const invalidLangs = []
      for (const { hreflang, href } of hreflangs) {
        const hasNoindex = await seoUtils.hasNoindexNofollow(href)
        if (hasNoindex && hreflang !== 'x-default') {
          invalidLangs.push(hreflang.toLowerCase())
        }
      }

      // 4. Update Shopify metafield
      await this.collectionRepo.updateMetafields(collectionId, invalidLangs)

      return invalidLangs
    } catch (error) {
      logger.error(`Failed to update hreflangs for collection ${collectionId}`, error)
      throw error
    }
  }

  async updateAllHrefLangs() {
    try {
      let collectionsProcessed = 0
      const allCollectionData = []

      // 1. Get first batch
      const { collectionData, totalCount, endCursor: initialCursor } = await this.collectionRepo.getAllCollections()
      allCollectionData.push(...collectionData)
      collectionsProcessed += collectionData.length

      let cursor = initialCursor

      // 2. Fetch remaining batches
      while (collectionsProcessed < totalCount && cursor) {
        const { collectionData, endCursor: nextCursor } = await this.collectionRepo.getAllCollections(cursor)
        allCollectionData.push(...collectionData)
        collectionsProcessed += collectionData.length

        if (!nextCursor || nextCursor === cursor) break // Prevent infinite loop
        cursor = nextCursor
      }

      if (allCollectionData.length === 0) throw new Error('No collections found')

      logger.info(`Total collections to process: ${allCollectionData.length}`)
      // ===========================================================================

      const limit = pLimit(1)
      const failedCollections = []

      // 3. Map collections to tasks
      const tasks = allCollectionData.map(({ collectionUrl, id }) => {
        return limit(async () => {
          try {
            console.log(`Processing collection URL: ${collectionUrl} with ID: ${id}`)
            const hreflangs = await seoUtils.getHreflangs(collectionUrl)

            const hreflangLimit = pLimit(3)
            const invalidHreflangs = new Set()
            let rateLimitHit = false

            await Promise.allSettled(
              hreflangs.map(({ hreflang, href }) =>
                hreflangLimit(async () => {
                  try {
                    const hasNoindex = await seoUtils.hasNoindexNofollow(href)
                    if (hasNoindex && hreflang !== 'x-default') {
                      invalidHreflangs.add(hreflang.toLowerCase())
                    }
                  } catch (error) {
                    if (err.message?.startsWith('RATE_LIMIT_429')) {
                      rateLimitHit = true
                    } else {
                      throw err
                    }
                  }
                })
              )
            )

            if (rateLimitHit) {
              failedCollections.push({ collectionUrl, id })
              console.log(`Skipping update for ${collectionUrl} due to rate limit`)
              return
            }

            console.log(`Invalid hreflangs for ${collectionUrl}: ${Array.from(invalidHreflangs).join(', ')}`)

            await this.collectionRepo.updateMetafields(id, Array.from(invalidHreflangs))
            logger.info(
              `------------------------------------------------Updated metafields for collection ${collectionUrl} with ID: ${id}-----------------------------------------`
            )
          } catch (error) {
            failedCollections.push({ collectionUrl, id })
            console.log(error)
            logger.error(`Failed to process collection URL ${collectionUrl}`, error)
          }
        })
      })
      // 4. Execute all tasks
      await Promise.all(tasks)

      logger.info('All collections processed')
      return failedCollections
    } catch (error) {
      logger.error('Failed to update all hreflangs', error)
      throw error
    }
  }
}

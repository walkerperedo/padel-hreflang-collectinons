import { collectionRepository } from '../repositories/collectionRepository.js'
import { HreflangService } from '../services/hreflangServices.js'

const hreflangService = new HreflangService({collectionRepo: collectionRepository})

export const hreflangController = {
  async updateHrefLang(req, res) {
    try {
      const { collectionId } = req.params
      const formattedCollectionId = `gid://shopify/Collection/${collectionId}`
      if (!collectionId) {
        return res.status(400).json({ error: 'collectionId is required' })
      }

      const result = await hreflangService.updateHrefLang(formattedCollectionId)
      res.status(200).json({
        message: 'Hreflangs updated successfully',
        invalidHreflangs: result,
      })
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update hreflangs',
        details: error.message,
      })
    }
  },

  async updateAllHrefLangs(req, res) {
    try {
      const result = await hreflangService.updateAllHrefLangs()
      res.status(200).json({
        message: 'All collections updated succesfully',
        noProcessedCollections: result,
      })
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update hreflangs',
        details: error.message,
      })
    }
  }
}

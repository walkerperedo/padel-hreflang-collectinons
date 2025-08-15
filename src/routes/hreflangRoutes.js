// routes/hreflangRoutes.js
import express from 'express'
import { hreflangController } from '../controllers/hreflanController.js'

const router = express.Router()

router.put('/collections/all/hreflangs', hreflangController.updateAllHrefLangs)
router.put('/collections/:collectionId/hreflangs', hreflangController.updateHrefLang)

export default router

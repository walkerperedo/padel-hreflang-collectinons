import { updateHrefLang } from "../services/hreflangServices.js"
import { Router } from "express"
const router = Router()

router.post('/update-hreflang', async (req, res) => {
  try {
    const collectionsId = req.body.collectionId
    const hreflangs = await updateHrefLang(collectionsId)
    res.status(200).json({ success: true, hreflangs })
  } catch (error) {
    console.error('Error updating hreflang:', error)
    res.status(500).json({ success: false, error: 'Internal Server Error' })
  }
})
export default router
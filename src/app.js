import collectionController from './controllers/collection.js'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { logger } from './utils/logger.js'

dotenv.config()
const app = express()
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/api', collectionController)

app.get('/', (req, res) => {
  res.json({ status: 'API is running on /api' });
});

app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
})
import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import type { Services } from '../../services'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes({ supportedPrisonsService }: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res) => {
    res.render('pages/prisons/prisons')
  })

  get('/HEI/edit', async (req, res) => {
    res.render('pages/prisons/edit')
  })

  return router
}

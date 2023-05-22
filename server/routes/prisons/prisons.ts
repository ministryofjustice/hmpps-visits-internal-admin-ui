import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import type { Services } from '../../services'

export default function routes({ supportedPrisonsService }: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', (req, res) => {
    res.render('pages/prisons/index')
  })

  get('/supported', async (req, res) => {
    const supportedPrisons = await supportedPrisonsService.getSupportedPrisons(res.locals.user.username)

    res.render('pages/prisons/supported', { supportedPrisons })
  })

  return router
}

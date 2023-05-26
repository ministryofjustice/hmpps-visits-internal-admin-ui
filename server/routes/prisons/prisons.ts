import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import type { Services } from '../../services'

export default function routes({ prisonService }: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res) => {
    const prisons = await prisonService.getAllPrisons(res.locals.user.username)
    const prisonNames = await prisonService.getPrisonNames(res.locals.user.username)

    res.render('pages/prisons/prisons', { prisons, prisonNames })
  })

  get('/:prisonId([A-Z]{3})/edit', async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { prisonId } = req.params

    res.render('pages/prisons/edit')
  })

  return router
}

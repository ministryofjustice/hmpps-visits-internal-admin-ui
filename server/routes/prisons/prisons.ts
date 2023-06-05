import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import type { Services } from '../../services'

export default function routes({ prisonService }: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, ...handlers: RequestHandler[]) =>
    router.post(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  get('/', async (req, res) => {
    const prisons = await prisonService.getAllPrisons(res.locals.user.username)
    const prisonNames = await prisonService.getPrisonNames(res.locals.user.username)

    const message = req.flash('message')

    res.render('pages/prisons/prisons', { prisons, prisonNames, message })
  })

  post('/', async (req, res) => {
    const prisonCode = req.body.prisonId.toUpperCase()

    await prisonService.createPrison(prisonCode, res.locals.user.username)
    req.flash('message', prisonCode)

    return res.redirect(`/prisons`)
  })

  get('/:prisonId([A-Z]{3})/edit', async (req, res) => {
    const { prisonId } = req.params

    const { prison, prisonName } = await prisonService.getPrison(res.locals.user.username, prisonId)
    const message = req.flash('message')

    res.render('pages/prisons/edit', { prison, prisonName, message })
  })

  post('/:prisonId([A-Z]{3})/edit', async (req, res) => {
    const { prisonId } = req.params
    const { action } = req.body

    if (action === 'activate') {
      await prisonService.activatePrison(res.locals.user.username, prisonId)
      req.flash('message', 'activated')
    }

    if (action === 'deactivate') {
      await prisonService.deactivatePrison(res.locals.user.username, prisonId)
      req.flash('message', 'deactivated')
    }

    res.redirect(`/prisons/${prisonId}/edit`)
  })

  return router
}

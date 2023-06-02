import { type RequestHandler, Router } from 'express'

import { validationResult } from 'express-validator'
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

    res.render('pages/prisons/prisons', { prisons, prisonNames, errors: req.flash('errors') })
  })

  get('/:prisonId([A-Z]{3})/edit', async (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { prisonId } = req.params
    const confirmedChange = req.query?.confirmedChange

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('errors', errors.array() as [])
      return res.redirect('/change-establishment')
    }

    const prisons = await prisonService.getAllPrisons(res.locals.user.username)
    const prisonName = await prisonService.getPrisonName(res.locals.user.username, prisonId)
    const prisonInfo = prisons.find(prison => prison.code === prisonId)

    res.render('pages/prisons/edit', { prisonId, prisonInfo, prisonName, errors: req.flash('errors'), confirmedChange })
  })

  post('/', async (req, res) => {
    const prisonCode = req.body.prisonId.toUpperCase()

    await prisonService.createPrison(prisonCode, res.locals.user.username)

    return res.redirect(`/prisons`)
  })

  get('/:prisonId/activate', async (req, res) => {
    const prisonCode = req.params.prisonId

    await prisonService.activatePrison(prisonCode, res.locals.user.username)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('errors', errors.array() as [])
      return res.redirect(`edit?confirmedChange=false`)
    }

    return res.redirect(`edit?confirmedChange=true`)
  })

  get('/:prisonId/deactivate', async (req, res) => {
    const prisonCode = req.params.prisonId

    await prisonService.deactivatePrison(prisonCode, res.locals.user.username)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('errors', errors.array() as [])
      return res.redirect(`edit?confirmedChange=false`)
    }

    return res.redirect(`edit?confirmedChange=true`)
  })
  return router
}

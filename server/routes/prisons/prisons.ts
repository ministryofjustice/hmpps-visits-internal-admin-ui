import { type RequestHandler, Router } from 'express'

import { body, validationResult } from 'express-validator'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { Services, SessionTemplateService } from '../../services'

export default function routes({ prisonService, sessionTemplateService }: Services): Router {
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

    res.render('pages/prisons/prisons', {
      errors: req.flash('errors'),
      prisons,
      prisonNames,
      message,
    })
  })

  post('/', async (req, res) => {
    await body('prisonId')
      .trim()
      .toUpperCase()
      .matches(/^[A-Z]{3}$/)
      .withMessage('Enter a three letter prison code')
      .bail()
      .custom(async prisonId => {
        try {
          await prisonService.getPrisonName(res.locals.user.username, prisonId)
        } catch (error) {
          throw new Error(`Prison '${prisonId}' is not in the prison register`)
        }
        return true
      })
      .run(req)

    const { prisonId } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('errors', errors.array())
      return res.redirect(`/prisons`)
    }

    try {
      await prisonService.createPrison(res.locals.user.username, prisonId)
      req.flash('message', prisonId)
    } catch (error) {
      req.flash('errors', [{ msg: `${error.status} ${error.message}` }])
    }

    return res.redirect(`/prisons`)
  })

  get('/:prisonId([A-Z]{3})/session-templates', async (req, res) => {
    const { prisonId } = req.params

    const { prison, prisonName } = await prisonService.getPrison(res.locals.user.username, prisonId)
    const message = req.flash('message')

    // const sessionTemplates = await sessionTemplateService.getSessionTemplates(res.locals.username, prisonId)
    // console.log(sessionTemplates)

    res.render('pages/prisons/viewSessionTemplates', { errors: req.flash('errors'), prison, prisonName, message })
  })

  post('/:prisonId([A-Z]{3})/activate', async (req, res) => {
    const { prisonId } = req.params

    const prison = await prisonService.activatePrison(res.locals.user.username, prisonId)
    if (prison.active) {
      req.flash('message', 'activated')
    } else {
      req.flash('errors', [{ msg: 'Failed to change prison status' }])
    }

    res.redirect(`/prisons/${prisonId}/session-templates`)
  })

  post('/:prisonId([A-Z]{3})/deactivate', async (req, res) => {
    const { prisonId } = req.params

    const prison = await prisonService.deactivatePrison(res.locals.user.username, prisonId)
    if (!prison.active) {
      req.flash('message', 'deactivated')
    } else {
      req.flash('errors', [{ msg: 'Failed to change prison status' }])
    }

    res.redirect(`/prisons/${prisonId}/session-templates`)
  })

  return router
}

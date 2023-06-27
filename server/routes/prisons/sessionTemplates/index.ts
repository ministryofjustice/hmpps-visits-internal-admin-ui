import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import SessionTemplatesController from './sessionTemplatesController'
import SingleSessionTemplateController from './singleSessionTemplateController'
import AddSessionTemplateController from './addSessionTemplateController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, asyncMiddleware(handler))

  const sessionTemplates = new SessionTemplatesController(services.prisonService, services.sessionTemplateService)
  const singleSessionTemplate = new SingleSessionTemplateController(
    services.prisonService,
    services.sessionTemplateService,
  )
  const addSessionTemplate = new AddSessionTemplateController(services.prisonService, services.sessionTemplateService)

  get('/prisons/:prisonId([A-Z]{3})/session-templates', sessionTemplates.view())
  get('/prisons/:prisonId/session-templates/add', addSessionTemplate.add())
  postWithValidation(
    '/prisons/:prisonId/session-templates/add',
    addSessionTemplate.validate(),
    addSessionTemplate.create(),
  )
  get('/prisons/:prisonId/session-templates/:reference', singleSessionTemplate.view())

  return router
}

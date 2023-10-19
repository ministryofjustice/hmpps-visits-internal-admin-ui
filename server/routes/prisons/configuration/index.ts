import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import PrisonConfigController from './prisonConfigController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, asyncMiddleware(handler))

  const prisonConfig = new PrisonConfigController(services.prisonService)

  get('/prisons/:prisonId([A-Z]{3})/configuration', prisonConfig.view())
  get('/prisons/:prisonId([A-Z]{3})/configuration/contact-details/:action(add|edit)', prisonConfig.contactDetailsView())
  postWithValidation(
    '/prisons/:prisonId([A-Z]{3})/configuration/contact-details/add',
    prisonConfig.validateContactDetails(),
    prisonConfig.contactDetailsAddSubmit(),
  )
  postWithValidation(
    '/prisons/:prisonId([A-Z]{3})/configuration/contact-details/edit',
    prisonConfig.validateContactDetails(),
    prisonConfig.contactDetailsEditSubmit(),
  )

  post('/prisons/:prisonId([A-Z]{3})/activate', prisonConfig.activate())
  post('/prisons/:prisonId([A-Z]{3})/deactivate', prisonConfig.deactivate())

  return router
}

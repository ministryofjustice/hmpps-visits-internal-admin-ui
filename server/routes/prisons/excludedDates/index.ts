import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import ExcludedDatesController from './excludedDatesController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, asyncMiddleware(handler))

  const excludedDates = new ExcludedDatesController(
    services.prisonService,
    services.visitService,
    services.excludeDateService,
  )

  get('/prisons/:prisonId([A-Z]{3})/excluded-dates', excludedDates.view())

  postWithValidation(
    '/prisons/:prisonId([A-Z]{3})/excluded-dates/add',
    excludedDates.validate(),
    excludedDates.addDate(),
  )
  postWithValidation(
    '/prisons/:prisonId([A-Z]{3})/excluded-dates/check',
    excludedDates.validate(),
    excludedDates.checkDate(),
  )
  postWithValidation(
    '/prisons/:prisonId([A-Z]{3})/excluded-dates/remove',
    // TODO - add validation
    [],
    excludedDates.removeDate(),
  )

  return router
}

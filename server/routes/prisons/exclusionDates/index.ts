import { RequestHandler, Router } from 'express'
import { Services, SessionTemplateService } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import ExclusionDatesController from './exclusionDatesController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const exclusionDates = new ExclusionDatesController(services.prisonService, services.sessionTemplateService)

  get('/prisons/:prisonId/exclusion-dates', exclusionDates.view())

  return router
}

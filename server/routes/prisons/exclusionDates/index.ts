import { RequestHandler, Router } from 'express'
import { Services, SessionTemplateService } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import ExclusionDatesController from './exclusionDatesController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const put = (path: string | string[], handler: RequestHandler) => router.put(path, asyncMiddleware(handler))

  const exclusionDates = new ExclusionDatesController(services.prisonService)

  get('/prisons/:prisonId([A-Z]{3})/exclusion-dates', exclusionDates.view())
  put('/prisons/:prisonId([A-Z]{3})/exclude-date/add', exclusionDates.addDate())
  put('/prisons/:prisonId([A-Z]{3})/exclude-date/remove', exclusionDates.removeDate())

  return router
}

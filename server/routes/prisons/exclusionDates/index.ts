import { RequestHandler, Router } from 'express'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import ExclusionDatesController from './exclusionDatesController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const exclusionDates = new ExclusionDatesController(services.prisonService)

  get('/prisons/:prisonId([A-Z]{3})/exclusion-dates', exclusionDates.view())
  post('/prisons/:prisonId([A-Z]{3})/exclude-date/add', exclusionDates.addDate())
  post('/prisons/:prisonId([A-Z]{3})/exclude-date/remove', exclusionDates.removeDate())

  return router
}

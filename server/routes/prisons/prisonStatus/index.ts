import { RequestHandler, Router } from 'express'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import PrisonStatusController from './prisonStatusController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const prisonStatus = new PrisonStatusController(services.prisonService)

  get('/prisons/:prisonId/status', prisonStatus.view())
  post('/prisons/:prisonId([A-Z]{3})/activate', prisonStatus.activate())
  post('/prisons/:prisonId([A-Z]{3})/deactivate', prisonStatus.deactivate())

  return router
}

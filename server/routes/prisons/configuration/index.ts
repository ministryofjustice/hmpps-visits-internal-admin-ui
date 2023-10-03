import { RequestHandler, Router } from 'express'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import PrisonConfigController from './prisonConfigController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const prisonConfig = new PrisonConfigController(services.prisonService)

  get('/prisons/:prisonId/configuration/edit/:field', prisonConfig.edit())
  get('/prisons/:prisonId/configuration', prisonConfig.view())
  post('/prisons/:prisonId([A-Z]{3})/activate', prisonConfig.activate())
  post('/prisons/:prisonId([A-Z]{3})/deactivate', prisonConfig.deactivate())

  return router
}

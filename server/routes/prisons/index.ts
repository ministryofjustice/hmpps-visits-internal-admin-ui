import { RequestHandler, Router } from 'express'
import { Services } from '../../services'
import SupportedPrisonsController from './supportedPrisonsController'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import prisonStatusRoutes from './prisonStatus'
import sessionTemplatesRoutes from './sessionTemplates'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const supportedPrisons = new SupportedPrisonsController(services.prisonService)

  get('/prisons', supportedPrisons.view())
  post('/prisons', supportedPrisons.addPrison())
  router.use(prisonStatusRoutes(services))
  router.use(sessionTemplatesRoutes(services))

  return router
}

import { RequestHandler, Router } from 'express'
import { Services } from '../../services'
import SupportedPrisonsController from './supportedPrisonsController'
import excludedDatesRoutes from './excludedDates'
import prisonStatusRoutes from './configuration'
import sessionTemplatesRoutes from './sessionTemplates'
import locationGroupsRoutes from './locationGroups'
import categoryGroupsRoutes from './categoryGroups'
import incentiveGroupsRoutes from './incentiveGroups'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, handler)
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, handler)

  const supportedPrisons = new SupportedPrisonsController(services.prisonService)

  get('/prisons', supportedPrisons.view())
  post('/prisons', supportedPrisons.addPrison())
  router.use(excludedDatesRoutes(services))
  router.use(categoryGroupsRoutes(services))
  router.use(locationGroupsRoutes(services))
  router.use(prisonStatusRoutes(services))
  router.use(sessionTemplatesRoutes(services))
  router.use(incentiveGroupsRoutes(services))

  return router
}

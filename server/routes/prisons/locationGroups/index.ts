import { RequestHandler, Router } from 'express'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import LocationGroupsController from './locationGroupsController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const locationGroups = new LocationGroupsController(services.prisonService, services.locationGroupsService)

  get('/prisons/:prisonId([A-Z]{3})/location-groups', locationGroups.view())

  return router
}

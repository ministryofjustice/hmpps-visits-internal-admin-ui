import { RequestHandler, Router } from 'express'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import LocationGroupsController from './locationGroupsController'
import SingleLocationGroupController from './singleLocationGroupController'
import AddLocationGroupController from './addLocationGroupController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const locationGroups = new LocationGroupsController(services.prisonService, services.locationGroupService)
  const singleLocationGroup = new SingleLocationGroupController(services.prisonService, services.locationGroupService)
  const addLocationGroup = new AddLocationGroupController(services.prisonService, services.locationGroupService)

  get('/prisons/:prisonId([A-Z]{3})/location-groups', locationGroups.view())
  get('/prisons/:prisonId([A-Z]{3})/location-groups/add', addLocationGroup.view())
  get('/prisons/:prisonId([A-Z]{3})/location-groups/:reference', singleLocationGroup.view())
  post('/prisons/:prisonId/location-groups/add', addLocationGroup.submit())

  return router
}

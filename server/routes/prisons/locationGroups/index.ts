import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import LocationGroupsController from './locationGroupsController'
import SingleLocationGroupController from './singleLocationGroupController'
import AddLocationGroupController from './addLocationGroupController'
import EditLocationGroupController from './editLocationGroupController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, asyncMiddleware(handler))

  const locationGroups = new LocationGroupsController(services.prisonService, services.locationGroupService)
  const singleLocationGroup = new SingleLocationGroupController(services.prisonService, services.locationGroupService)
  const editLocationGroup = new EditLocationGroupController(services.prisonService, services.locationGroupService)
  const addLocationGroup = new AddLocationGroupController(services.prisonService, services.locationGroupService)

  get('/prisons/:prisonId([A-Z]{3})/location-groups', locationGroups.view())
  get('/prisons/:prisonId([A-Z]{3})/location-groups/add', addLocationGroup.view())
  get('/prisons/:prisonId([A-Z]{3})/location-groups/:reference', singleLocationGroup.view())
  get('/prisons/:prisonId([A-Z]{3})/location-groups/:reference/edit', editLocationGroup.view())
  post('/prisons/:prisonId([A-Z]{3})/location-groups/:reference/delete', singleLocationGroup.delete())
  postWithValidation('/prisons/:prisonId/location-groups/add', addLocationGroup.validate(), addLocationGroup.add())
  postWithValidation(
    '/prisons/:prisonId([A-Z]{3})/location-groups/:reference/edit',
    editLocationGroup.validate(),
    editLocationGroup.update(),
  )

  return router
}

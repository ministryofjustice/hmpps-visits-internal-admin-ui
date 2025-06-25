import { Router } from 'express'
import { Services } from '../../../services'
import LocationGroupsController from './locationGroupsController'
import SingleLocationGroupController from './singleLocationGroupController'
import AddLocationGroupController from './addLocationGroupController'
import EditLocationGroupController from './editLocationGroupController'

export default function routes(services: Services): Router {
  const router = Router()

  const locationGroups = new LocationGroupsController(services.prisonService, services.locationGroupService)
  const singleLocationGroup = new SingleLocationGroupController(services.prisonService, services.locationGroupService)
  const editLocationGroup = new EditLocationGroupController(services.prisonService, services.locationGroupService)
  const addLocationGroup = new AddLocationGroupController(services.prisonService, services.locationGroupService)

  router.get('/prisons/:prisonId/location-groups', locationGroups.view())
  router.get('/prisons/:prisonId/location-groups/add', addLocationGroup.view())
  router.get('/prisons/:prisonId/location-groups/:reference', singleLocationGroup.view())
  router.get('/prisons/:prisonId/location-groups/:reference/edit', editLocationGroup.view())
  router.post('/prisons/:prisonId/location-groups/:reference/delete', singleLocationGroup.delete())
  router.post('/prisons/:prisonId/location-groups/add', addLocationGroup.validate(), addLocationGroup.add())
  router.post(
    '/prisons/:prisonId/location-groups/:reference/edit',
    editLocationGroup.validate(),
    editLocationGroup.update(),
  )

  return router
}

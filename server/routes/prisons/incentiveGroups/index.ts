import { Router } from 'express'
import { Services } from '../../../services'
import IncentiveGroupsController from './incentiveGroupsController'
import SingleIncentiveGroupController from './singleIncentiveGroupController'
import AddIncentiveGroupController from './addIncentiveGroupController'

export default function routes(services: Services): Router {
  const router = Router()

  const incentiveGroups = new IncentiveGroupsController(services.prisonService, services.incentiveGroupService)
  const singleIncentiveGroup = new SingleIncentiveGroupController(
    services.prisonService,
    services.incentiveGroupService,
  )
  const addIncentiveGroup = new AddIncentiveGroupController(services.prisonService, services.incentiveGroupService)

  router.get('/prisons/:prisonId/incentive-groups', incentiveGroups.view())
  router.get('/prisons/:prisonId/incentive-groups/add', addIncentiveGroup.view())
  router.get('/prisons/:prisonId/incentive-groups/:reference', singleIncentiveGroup.view())
  router.post('/prisons/:prisonId/incentive-groups/:reference/delete', singleIncentiveGroup.delete())
  router.post('/prisons/:prisonId/incentive-groups/add', addIncentiveGroup.validate(), addIncentiveGroup.submit())

  return router
}

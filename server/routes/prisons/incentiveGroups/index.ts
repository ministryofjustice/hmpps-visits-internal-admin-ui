import { RequestHandler, Router } from 'express'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import IncentiveGroupsController from './incentiveGroupsController'
import SingleIncentiveGroupController from './singleIncentiveGroupController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const incentiveGroups = new IncentiveGroupsController(services.prisonService, services.incentiveGroupService)
  const singleIncentiveGroup = new SingleIncentiveGroupController(
    services.prisonService,
    services.incentiveGroupService,
  )

  get('/prisons/:prisonId([A-Z]{3})/incentive-groups', incentiveGroups.view())
  get('/prisons/:prisonId([A-Z]{3})/incentive-groups/:reference', singleIncentiveGroup.view())

  return router
}

import { RequestHandler, Router } from 'express'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import IncentiveLevelGroupsController from './incentiveLevelGroupsController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const incentiveLevelGroups = new IncentiveLevelGroupsController(
    services.prisonService,
    services.incentiveLevelGroupService,
  )

  get('/prisons/:prisonId([A-Z]{3})/incentive-groups', incentiveLevelGroups.view())

  return router
}

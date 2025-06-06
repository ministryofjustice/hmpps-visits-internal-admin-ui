import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import { Services } from '../../../services'
import IncentiveGroupsController from './incentiveGroupsController'
import SingleIncentiveGroupController from './singleIncentiveGroupController'
import AddIncentiveGroupController from './addIncentiveGroupController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, handler)
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, handler)
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, handler)

  const incentiveGroups = new IncentiveGroupsController(services.prisonService, services.incentiveGroupService)
  const singleIncentiveGroup = new SingleIncentiveGroupController(
    services.prisonService,
    services.incentiveGroupService,
  )
  const addIncentiveGroup = new AddIncentiveGroupController(services.prisonService, services.incentiveGroupService)

  get('/prisons/:prisonId/incentive-groups', incentiveGroups.view())
  get('/prisons/:prisonId/incentive-groups/add', addIncentiveGroup.view())
  get('/prisons/:prisonId/incentive-groups/:reference', singleIncentiveGroup.view())
  post('/prisons/:prisonId/incentive-groups/:reference/delete', singleIncentiveGroup.delete())
  postWithValidation(
    '/prisons/:prisonId/incentive-groups/add',
    addIncentiveGroup.validate(),
    addIncentiveGroup.submit(),
  )

  return router
}

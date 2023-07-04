import { RequestHandler, Router } from 'express'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import CategoryGroupsController from './categoryGroupsController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const categoryGroups = new CategoryGroupsController(services.prisonService, services.categoryGroupService)

  get('/prisons/:prisonId([A-Z]{3})/category-groups', categoryGroups.view())

  return router
}

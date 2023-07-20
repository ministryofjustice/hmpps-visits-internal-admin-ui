import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import CategoryGroupsController from './categoryGroupsController'
import SingleCategoryGroupController from './singleCategoryGroupController'
import AddCategoryGroupController from './addCategoryGroupController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, asyncMiddleware(handler))

  const categoryGroups = new CategoryGroupsController(services.prisonService, services.categoryGroupService)
  const singleCategoryGroup = new SingleCategoryGroupController(services.prisonService, services.categoryGroupService)
  const addCategoryGroup = new AddCategoryGroupController(services.prisonService, services.categoryGroupService)

  get('/prisons/:prisonId([A-Z]{3})/category-groups', categoryGroups.view())
  get('/prisons/:prisonId([A-Z]{3})/category-groups/add', addCategoryGroup.view())
  get('/prisons/:prisonId([A-Z]{3})/category-groups/:reference', singleCategoryGroup.view())
  post('/prisons/:prisonId([A-Z]{3})/category-groups/:reference/delete', singleCategoryGroup.delete())
  postWithValidation('/prisons/:prisonId/category-groups/add', addCategoryGroup.validate(), addCategoryGroup.submit())
  return router
}

import { Router } from 'express'
import { Services } from '../../../services'
import CategoryGroupsController from './categoryGroupsController'
import SingleCategoryGroupController from './singleCategoryGroupController'
import AddCategoryGroupController from './addCategoryGroupController'

export default function routes(services: Services): Router {
  const router = Router()

  const categoryGroups = new CategoryGroupsController(services.prisonService, services.categoryGroupService)
  const singleCategoryGroup = new SingleCategoryGroupController(services.prisonService, services.categoryGroupService)
  const addCategoryGroup = new AddCategoryGroupController(services.prisonService, services.categoryGroupService)

  router.get('/prisons/:prisonId/category-groups', categoryGroups.view())
  router.get('/prisons/:prisonId/category-groups/add', addCategoryGroup.view())
  router.get('/prisons/:prisonId/category-groups/:reference', singleCategoryGroup.view())
  router.post('/prisons/:prisonId/category-groups/:reference/delete', singleCategoryGroup.delete())
  router.post('/prisons/:prisonId/category-groups/add', addCategoryGroup.validate(), addCategoryGroup.submit())

  return router
}

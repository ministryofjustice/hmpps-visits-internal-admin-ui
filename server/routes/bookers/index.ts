import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import BookerSearchController from './bookerSearchController'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { Services } from '../../services'
import bookerRoutes from './booker'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, asyncMiddleware(handler))

  const bookerSearch = new BookerSearchController(services.bookerService)

  get('/bookers', bookerSearch.view())
  postWithValidation('/bookers/search', bookerSearch.validate(), bookerSearch.submit())

  router.use('/bookers/booker', bookerRoutes(services))

  return router
}

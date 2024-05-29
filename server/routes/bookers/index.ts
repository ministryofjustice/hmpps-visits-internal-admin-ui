import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import { Services } from '../../services'
import BookersController from './bookersController'
import asyncMiddleware from '../../middleware/asyncMiddleware'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, asyncMiddleware(handler))

  const bookers = new BookersController()

  get('/bookers', bookers.view())

  postWithValidation('/bookers/booker/update', bookers.validateUpdateBookerDetails(), bookers.updateBookerDetails())
  postWithValidation('/bookers/booker/clear', bookers.validateClearBookerDetails(), bookers.clearBookerDetails())

  return router
}

import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import { Services } from '../../services'
import BookerController from './bookerController'
import asyncMiddleware from '../../middleware/asyncMiddleware'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, asyncMiddleware(handler))

  const booker = new BookerController(services.bookerService)

  get('/bookers', booker.view())

  postWithValidation('/bookers/booker/update', booker.validateUpdateBookerDetails(), booker.updateBookerDetails())
  postWithValidation('/bookers/booker/clear', booker.validateClearBookerDetails(), booker.clearBookerDetails())

  return router
}

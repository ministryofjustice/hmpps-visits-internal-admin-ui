import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import BookersController from './bookersController'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import { Services } from '../../services'
import AddBookerController from './addBookerController'
import BookerDetailsController from './bookerDetailsController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, asyncMiddleware(handler))

  const bookers = new BookersController(services.bookerService)
  const addBooker = new AddBookerController(services.bookerService)
  const bookerDetails = new BookerDetailsController(services.bookerService)

  get('/bookers', bookers.view())
  postWithValidation('/bookers/search', bookers.validate(), bookers.submit())

  get('/bookers/booker/add', addBooker.view())
  postWithValidation('/bookers/booker/add', addBooker.validate(), addBooker.submit())

  get('/bookers/booker-details', bookerDetails.view())

  return router
}

import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import { Services } from '../../../services'
import AddBookerController from './addBookerController'
import BookerDetailsController from './bookerDetailsController'
import AddPrisonerController from './addPrisonerController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, asyncMiddleware(handler))

  const addBooker = new AddBookerController(services.bookerService)
  const bookerDetails = new BookerDetailsController(services.bookerService)
  const addPrisoner = new AddPrisonerController(services.bookerService)

  get('/add', addBooker.view())
  postWithValidation('/add', addBooker.validate(), addBooker.submit())

  get('/details', bookerDetails.view())
  post('/clear-details', bookerDetails.clear())

  get('/add-prisoner', addPrisoner.view())
  postWithValidation('/add-prisoner', addPrisoner.validate(), addPrisoner.submit())

  return router
}

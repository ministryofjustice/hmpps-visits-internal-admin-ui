import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import BookersController from './bookersController'
import { Services } from '../../services'
import bookerRoutes from './booker'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, handler)
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, handler)

  const bookers = new BookersController(services.bookerService)

  get('/bookers', bookers.view('search'))
  get('/bookers/add', bookers.view('add'))
  postWithValidation('/bookers/search', bookers.validate(), bookers.search())
  postWithValidation('/bookers/add', bookers.validate(), bookers.add())

  router.use('/bookers/booker', bookerRoutes(services))

  return router
}

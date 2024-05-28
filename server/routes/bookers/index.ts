import { RequestHandler, Router } from 'express'
import { Services } from '../../services'
import BookersController from './bookersController'
import asyncMiddleware from '../../middleware/asyncMiddleware'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const bookers = new BookersController()

  get('/bookers', bookers.view())

  return router
}

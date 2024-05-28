import { RequestHandler, Router } from 'express'
import BookersController from './bookersController'
import asyncMiddleware from '../../middleware/asyncMiddleware'

export default function routes(): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const bookers = new BookersController()

  get('/bookers', bookers.view())

  return router
}

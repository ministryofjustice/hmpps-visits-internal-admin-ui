import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import HomeController from './homeController'
import prisonsRoutes from './prisons'
import bookersRoutes from './bookers'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const home = new HomeController()

  get('/', home.view())

  router.use(prisonsRoutes(services))

  router.use(bookersRoutes(services))

  return router
}

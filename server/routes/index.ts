import { Router } from 'express'

import type { Services } from '../services'
import HomeController from './homeController'
import prisonsRoutes from './prisons'
import bookersRoutes from './bookers'

export default function routes(services: Services): Router {
  const router = Router()

  const home = new HomeController()

  router.get('/', home.view())

  router.use(prisonsRoutes(services))

  router.use(bookersRoutes(services))

  return router
}

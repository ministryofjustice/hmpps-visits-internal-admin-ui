import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function routes({ adminService, userService }: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/prisons', async (request, res, next) => {

    const userName = userService.getUserName(request)
    const supportedPrisons = await adminService.getSupportedPrisons(userName)

    res.render('pages/prisons/index',{
      supportedPrisons : supportedPrisons,
    })
  })

  return router
}


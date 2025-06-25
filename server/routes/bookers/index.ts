import { Router } from 'express'
import BookerSearchController from './bookerSearchController'
import { Services } from '../../services'
import bookerRoutes from './booker'

export default function routes(services: Services): Router {
  const router = Router()

  const bookerSearch = new BookerSearchController(services.bookerService)

  router.get('/bookers', bookerSearch.view())
  router.post('/bookers/search', bookerSearch.validate(), bookerSearch.submit())

  router.get('/bookers/search/results', bookerSearch.viewResults())

  router.use('/bookers/booker', bookerRoutes(services))

  return router
}

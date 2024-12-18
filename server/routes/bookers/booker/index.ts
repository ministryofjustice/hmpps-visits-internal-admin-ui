import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import { Services } from '../../../services'
import BookerDetailsController from './bookerDetailsController'
import AddPrisonerController from './addPrisonerController'
import PrisonerStatusController from './prisonerStatusController'
import AddVisitorController from './addVisitorController'
import VisitorStatusController from './visitorStatusController'
import EditPrisonerController from './editPrisonerController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, asyncMiddleware(handler))

  const bookerDetails = new BookerDetailsController(
    services.bookerService,
    services.prisonerContactsService,
    services.prisonService,
  )
  const addPrisoner = new AddPrisonerController(services.bookerService, services.prisonService)
  const editPrisoner = new EditPrisonerController(services.bookerService, services.prisonService)
  const prisonerStatus = new PrisonerStatusController(services.bookerService)
  const addVisitor = new AddVisitorController(services.bookerService, services.prisonerContactsService)
  const visitorStatus = new VisitorStatusController(services.bookerService)

  // middleware to ensure booker in session for all /bookers/booker routes
  router.use((req, res, next) => {
    const { booker } = req.session
    if (!booker) {
      return res.redirect('/bookers')
    }
    return next()
  })

  get('/details', bookerDetails.view())
  post('/clear-details', bookerDetails.clear())

  get('/add-prisoner', addPrisoner.view())
  postWithValidation('/add-prisoner', addPrisoner.validate(), addPrisoner.submit())

  get('/edit-prisoner', editPrisoner.view())
  postWithValidation('/edit-prisoner', editPrisoner.validate(), editPrisoner.submit())

  post('/activate-prisoner', prisonerStatus.setStatus('inactive'))
  post('/deactivate-prisoner', prisonerStatus.setStatus('active'))

  get('/add-visitor', addVisitor.view())
  postWithValidation('/add-visitor', addVisitor.validate(), addVisitor.submit())

  postWithValidation('/activate-visitor', visitorStatus.validate(), visitorStatus.setStatus('inactive'))
  postWithValidation('/deactivate-visitor', visitorStatus.validate(), visitorStatus.setStatus('active'))

  return router
}

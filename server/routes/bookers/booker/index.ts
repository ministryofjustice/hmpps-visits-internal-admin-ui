import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import { Services } from '../../../services'
import BookerDetailsController from './bookerDetailsController'
import AddPrisonerController from './addPrisonerController'
import PrisonerStatusController from './prisonerStatusController'
import AddVisitorController from './addVisitorController'
import VisitorStatusController from './visitorStatusController'
import EditPrisonerController from './editPrisonerController'
import { BOOKER_REFERENCE_REGEX } from '../../../constants/constants'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, handler)
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, handler)
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, handler)

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

  // middleware to validate booker reference on all /bookers/booker/{:reference} routes
  router.use('/:reference/', (req, res, next) => {
    const { reference } = req.params
    return BOOKER_REFERENCE_REGEX.test(reference) ? next() : res.redirect('/bookers')
  })

  get('/:reference/', bookerDetails.view())
  post('/:reference/clear', bookerDetails.clear())

  get('/:reference/add-prisoner', addPrisoner.view())
  postWithValidation('/:reference/add-prisoner', addPrisoner.validate(), addPrisoner.submit())

  get('/:reference/edit-prisoner', editPrisoner.view())
  postWithValidation('/:reference/edit-prisoner', editPrisoner.validate(), editPrisoner.submit())

  post('/:reference/activate-prisoner', prisonerStatus.setStatus('inactive'))
  post('/:reference/deactivate-prisoner', prisonerStatus.setStatus('active'))

  get('/:reference/add-visitor', addVisitor.view())
  postWithValidation('/:reference/add-visitor', addVisitor.validate(), addVisitor.submit())

  postWithValidation('/:reference/activate-visitor', visitorStatus.validate(), visitorStatus.setStatus('inactive'))
  postWithValidation('/:reference/deactivate-visitor', visitorStatus.validate(), visitorStatus.setStatus('active'))

  return router
}

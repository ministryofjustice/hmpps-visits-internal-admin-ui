import { Router } from 'express'
import { Services } from '../../../services'
import BookerController from './bookerController'
import AddPrisonerController from './addPrisonerController'
import PrisonerStatusController from './prisonerStatusController'
import AddVisitorController from './addVisitorController'
import VisitorStatusController from './visitorStatusController'
import EditPrisonerController from './editPrisonerController'
import { BOOKER_REFERENCE_REGEX, PRISON_NUMBER_REGEX } from '../../../constants/constants'
import BookerPrisonerDetailsController from './bookerPrisonerDetailsController'

export default function routes(services: Services): Router {
  const router = Router()

  const booker = new BookerController(services.bookerService, services.prisonService)
  const bookerPrisonerDetails = new BookerPrisonerDetailsController(
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

  // middleware to validate prisoner ID on all /bookers/booker/{:reference}/prisoner/{:prisonerId} routes
  router.use('/:reference/prisoner/:prisonerId', (req, res, next) => {
    const { reference, prisonerId } = req.params
    return PRISON_NUMBER_REGEX.test(prisonerId) ? next() : res.redirect(`/bookers/booker/${reference}`)
  })

  // Booker routes
  router.get('/:reference/', booker.view())
  router.post('/:reference/clear', booker.clear())

  // Add prisoner to a booker
  router.get('/:reference/add-prisoner', addPrisoner.view())
  router.post('/:reference/add-prisoner', addPrisoner.validate(), addPrisoner.submit())

  // Booker prisoner routes
  router.get('/:reference/prisoner/:prisonerId', bookerPrisonerDetails.view())

  router.get('/:reference/prisoner/:prisonerId/edit', editPrisoner.view())
  router.post('/:reference/prisoner/:prisonerId/edit', editPrisoner.validate(), editPrisoner.submit())

  router.post('/:reference/prisoner/:prisonerId/activate', prisonerStatus.setStatus('inactive'))
  router.post('/:reference/prisoner/:prisonerId/deactivate', prisonerStatus.setStatus('active'))

  // Booker prisoner visitor routes
  router.get('/:reference/prisoner/:prisonerId/add-visitor', addVisitor.view())
  router.post('/:reference/prisoner/:prisonerId/add-visitor', addVisitor.validate(), addVisitor.submit())

  router.post(
    '/:reference/prisoner/:prisonerId/activate-visitor',
    visitorStatus.validate(),
    visitorStatus.setStatus('inactive'),
  )
  router.post(
    '/:reference/prisoner/:prisonerId/deactivate-visitor',
    visitorStatus.validate(),
    visitorStatus.setStatus('active'),
  )

  return router
}

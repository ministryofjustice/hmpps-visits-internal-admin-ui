import { Router } from 'express'
import { Services } from '../../../services'
import AddPrisonerController from './addPrisonerController'
import BookerController from './bookerController'
import BookerPrisonerDetailsController from './bookerPrisonerDetailsController'
import EditPrisonerController from './editPrisonerController'
import { BOOKER_REFERENCE_REGEX, PRISON_NUMBER_REGEX } from '../../../constants/constants'

export default function routes(services: Services): Router {
  const router = Router()

  const booker = new BookerController(services.bookerService, services.prisonService)
  const bookerPrisonerDetails = new BookerPrisonerDetailsController(services.bookerService, services.prisonService)
  const addPrisoner = new AddPrisonerController(services.bookerService, services.prisonService)
  const editPrisoner = new EditPrisonerController(services.bookerService, services.prisonService)

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

  return router
}

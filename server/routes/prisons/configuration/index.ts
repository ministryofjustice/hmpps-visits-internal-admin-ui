import { Router } from 'express'
import { Services } from '../../../services'
import PrisonConfigController from './prisonConfigController'
import AddEditContactDetailsController from './addEditContactDetailsController'
import EditBookingWindowController from './editBookingWindowController'
import EditVisitorConfigController from './editVisitorConfigController'
import VisitAllocationController from './visitAllocationController'

export default function routes(services: Services): Router {
  const router = Router()

  const prisonConfig = new PrisonConfigController(services.prisonService, services.visitAllocationService)
  const editBookingWindowController = new EditBookingWindowController(services.prisonService)
  const addEditContactDetailsController = new AddEditContactDetailsController(services.prisonService)
  const editVisitorConfigController = new EditVisitorConfigController(services.prisonService)
  const visitAllocationController = new VisitAllocationController(
    services.prisonService,
    services.visitAllocationService,
  )

  router.get('/prisons/:prisonId/configuration', prisonConfig.view())

  router.get('/prisons/:prisonId/configuration/booking-window/edit', editBookingWindowController.view())
  router.post(
    '/prisons/:prisonId/configuration/booking-window/edit',
    editBookingWindowController.validate(),
    editBookingWindowController.submit(),
  )

  router.get(
    '/prisons/:prisonId/configuration/contact-details/:action{add|edit}',
    addEditContactDetailsController.view(),
  )
  router.post(
    '/prisons/:prisonId/configuration/contact-details/add',
    addEditContactDetailsController.validate(),
    addEditContactDetailsController.addSubmit(),
  )
  router.post(
    '/prisons/:prisonId/configuration/contact-details/edit',
    addEditContactDetailsController.validate(),
    addEditContactDetailsController.editSubmit(),
  )

  router.post(
    '/prisons/:prisonId/update-enabled-services',
    prisonConfig.validateEnabledServices(),
    prisonConfig.updateEnabledServices(),
  )

  router.get('/prisons/:prisonId/configuration/visitors/edit', editVisitorConfigController.view())
  router.post(
    '/prisons/:prisonId/configuration/visitors/edit',
    editVisitorConfigController.validate(),
    editVisitorConfigController.submit(),
  )

  router.get('/prisons/:prisonId/allocations/reset/confirm', visitAllocationController.view())
  router.post('/prisons/:prisonId/allocations/reset/confirm', visitAllocationController.resetBalances())

  router.post('/prisons/:prisonId/activate', prisonConfig.activate())
  router.post('/prisons/:prisonId/deactivate', prisonConfig.deactivate())

  return router
}

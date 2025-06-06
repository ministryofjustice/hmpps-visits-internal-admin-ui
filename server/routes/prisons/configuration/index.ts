import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import { Services } from '../../../services'
import PrisonConfigController from './prisonConfigController'
import AddEditContactDetailsController from './addEditContactDetailsController'
import EditBookingWindowController from './editBookingWindowController'
import EditVisitorConfigController from './editVisitorConfigController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, handler)
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, handler)
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, handler)

  const prisonConfig = new PrisonConfigController(services.prisonService)
  const editBookingWindowController = new EditBookingWindowController(services.prisonService)
  const addEditContactDetailsController = new AddEditContactDetailsController(services.prisonService)
  const editVisitorConfigController = new EditVisitorConfigController(services.prisonService)

  get('/prisons/:prisonId/configuration', prisonConfig.view())

  get('/prisons/:prisonId/configuration/booking-window/edit', editBookingWindowController.view())
  postWithValidation(
    '/prisons/:prisonId/configuration/booking-window/edit',
    editBookingWindowController.validate(),
    editBookingWindowController.submit(),
  )

  get('/prisons/:prisonId/configuration/contact-details/:action', addEditContactDetailsController.view())
  postWithValidation(
    '/prisons/:prisonId/configuration/contact-details/add',
    addEditContactDetailsController.validate(),
    addEditContactDetailsController.addSubmit(),
  )
  postWithValidation(
    '/prisons/:prisonId/configuration/contact-details/edit',
    addEditContactDetailsController.validate(),
    addEditContactDetailsController.editSubmit(),
  )

  postWithValidation(
    '/prisons/:prisonId/update-enabled-services',
    prisonConfig.validateEnabledServices(),
    prisonConfig.updateEnabledServices(),
  )

  get('/prisons/:prisonId/configuration/visitors/edit', editVisitorConfigController.view())
  postWithValidation(
    '/prisons/:prisonId/configuration/visitors/edit',
    editVisitorConfigController.validate(),
    editVisitorConfigController.submit(),
  )

  post('/prisons/:prisonId/activate', prisonConfig.activate())
  post('/prisons/:prisonId/deactivate', prisonConfig.deactivate())

  return router
}

import { RequestHandler, Router } from 'express'
import { ValidationChain } from 'express-validator'
import { Services } from '../../../services'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import PrisonConfigController from './prisonConfigController'
import AddEditContactDetailsController from './addEditContactDetailsController'
import EditBookingWindowController from './editBookingWindowController'
import EditVisitorConfigController from './editVisitorConfigController'

export default function routes(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string | string[], handler: RequestHandler) => router.post(path, asyncMiddleware(handler))
  const postWithValidation = (path: string | string[], validationChain: ValidationChain[], handler: RequestHandler) =>
    router.post(path, ...validationChain, asyncMiddleware(handler))

  const prisonConfig = new PrisonConfigController(services.prisonService)
  const editBookingWindowController = new EditBookingWindowController(services.prisonService)
  const addEditContactDetailsController = new AddEditContactDetailsController(services.prisonService)
  const editVisitorConfigController = new EditVisitorConfigController(services.prisonService)

  get('/prisons/:prisonId([A-Z]{3})/configuration', prisonConfig.view())

  get('/prisons/:prisonId([A-Z]{3})/configuration/booking-window/edit', editBookingWindowController.view())
  postWithValidation(
    '/prisons/:prisonId([A-Z]{3})/configuration/booking-window/edit',
    editBookingWindowController.validate(),
    editBookingWindowController.submit(),
  )

  get(
    '/prisons/:prisonId([A-Z]{3})/configuration/contact-details/:action(add|edit)',
    addEditContactDetailsController.view(),
  )
  postWithValidation(
    '/prisons/:prisonId([A-Z]{3})/configuration/contact-details/add',
    addEditContactDetailsController.validate(),
    addEditContactDetailsController.addSubmit(),
  )
  postWithValidation(
    '/prisons/:prisonId([A-Z]{3})/configuration/contact-details/edit',
    addEditContactDetailsController.validate(),
    addEditContactDetailsController.editSubmit(),
  )

  postWithValidation(
    '/prisons/:prisonId([A-Z]{3})/update-enabled-services',
    prisonConfig.validateEnabledServices(),
    prisonConfig.updateEnabledServices(),
  )

  get('/prisons/:prisonId([A-Z]{3})/configuration/visitors/edit', editVisitorConfigController.view())
  postWithValidation(
    '/prisons/:prisonId([A-Z]{3})/configuration/visitors/edit',
    editVisitorConfigController.validate(),
    editVisitorConfigController.submit(),
  )

  post('/prisons/:prisonId([A-Z]{3})/activate', prisonConfig.activate())
  post('/prisons/:prisonId([A-Z]{3})/deactivate', prisonConfig.deactivate())

  return router
}

import { Router } from 'express'
import { Services } from '../../../services'
import ExcludedDatesController from './excludedDatesController'

export default function routes(services: Services): Router {
  const router = Router()

  const excludedDates = new ExcludedDatesController(
    services.prisonService,
    services.visitService,
    services.excludeDateService,
  )

  router.get('/prisons/:prisonId/excluded-dates', excludedDates.view())

  router.post('/prisons/:prisonId/excluded-dates/add', excludedDates.validate(), excludedDates.addDate())
  router.post('/prisons/:prisonId/excluded-dates/check', excludedDates.validate(), excludedDates.checkDate())
  router.post(
    '/prisons/:prisonId/excluded-dates/remove',
    // TODO - add validation
    [],
    excludedDates.removeDate(),
  )

  return router
}

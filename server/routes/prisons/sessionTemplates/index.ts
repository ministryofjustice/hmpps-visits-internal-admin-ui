import { Router } from 'express'
import { Services } from '../../../services'
import SessionTemplatesController from './sessionTemplatesController'
import SingleSessionTemplateController from './singleSessionTemplateController'
import AddSessionTemplateController from './addSessionTemplateController'
import EditSessionTemplateController from './editSessionTemplateController'

export default function routes(services: Services): Router {
  const router = Router()

  const sessionTemplates = new SessionTemplatesController(services.prisonService, services.sessionTemplateService)
  const singleSessionTemplate = new SingleSessionTemplateController(
    services.prisonService,
    services.sessionTemplateService,
  )
  const editSessionTemplate = new EditSessionTemplateController(
    services.prisonService,
    services.sessionTemplateService,
    services.incentiveGroupService,
    services.categoryGroupService,
    services.locationGroupService,
  )

  const addSessionTemplate = new AddSessionTemplateController(
    services.prisonService,
    services.sessionTemplateService,
    services.incentiveGroupService,
    services.categoryGroupService,
    services.locationGroupService,
  )

  router.get('/prisons/:prisonId/session-templates/add', addSessionTemplate.view())
  router.post('/prisons/:prisonId/session-templates/add', addSessionTemplate.validate(), addSessionTemplate.add())
  router.get('/prisons/:prisonId/session-templates/:reference/edit', editSessionTemplate.view())
  router.post(
    '/prisons/:prisonId/session-templates/:reference/edit',
    editSessionTemplate.validate(),
    editSessionTemplate.update(),
  )

  router.post('/prisons/:prisonId/session-templates/:reference/copy', addSessionTemplate.populateNewFromExisting())

  router.get('/prisons/:prisonId/session-templates', sessionTemplates.view())

  router.get('/prisons/:prisonId/session-templates/:reference', singleSessionTemplate.view())
  router.post('/prisons/:prisonId/session-templates/:reference/activate', singleSessionTemplate.activate())
  router.post('/prisons/:prisonId/session-templates/:reference/deactivate', singleSessionTemplate.deactivate())
  router.post('/prisons/:prisonId/session-templates/:reference/delete', singleSessionTemplate.delete())

  return router
}

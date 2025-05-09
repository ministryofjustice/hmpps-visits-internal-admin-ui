import { RequestHandler } from 'express'
import { PrisonService, SessionTemplateService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'

export default class SingleSessionTemplateController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly sessionTemplateService: SessionTemplateService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const sessionTemplate = await this.sessionTemplateService.getSingleSessionTemplate(
        res.locals.user.username,
        reference,
      )

      const publicClient = sessionTemplate.clients.find(client => client.userType === 'PUBLIC')
      const hideInPublicServices = publicClient?.active === false ? 'yes' : 'no'

      const visitStats = await this.sessionTemplateService.getTemplateStats(res.locals.user.username, reference)

      return res.render('pages/prisons/sessionTemplates/viewSingleSessionTemplate', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        prison,
        sessionTemplate,
        visitStats,
        hideInPublicServices,
      })
    }
  }

  public activate(): RequestHandler {
    return async (req, res) => {
      const { prisonId, reference } = req.params

      try {
        await this.sessionTemplateService.activateSessionTemplate(res.locals.user.username, reference)
        req.flash('messages', { variant: 'success', title: 'Template activated', text: 'Template activated' })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
      }

      return res.redirect(`/prisons/${prisonId}/session-templates/${reference}`)
    }
  }

  public deactivate(): RequestHandler {
    return async (req, res) => {
      const { prisonId, reference } = req.params

      try {
        await this.sessionTemplateService.deactivateSessionTemplate(res.locals.user.username, reference)
        req.flash('messages', { variant: 'success', title: 'Template deactivated', text: 'Template deactivated' })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
      }

      return res.redirect(`/prisons/${prisonId}/session-templates/${reference}`)
    }
  }

  public delete(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params

      try {
        const { name } = await this.sessionTemplateService.getSingleSessionTemplate(res.locals.user.username, reference)
        await this.sessionTemplateService.deleteSessionTemplate(res.locals.user.username, reference)
        req.flash('messages', {
          variant: 'success',
          title: 'Template deleted',
          text: `Session template '${name}' has been deleted`,
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        return res.redirect(`/prisons/${prisonId}/session-templates/${reference}`)
      }

      return res.redirect(`/prisons/${prisonId}/session-templates`)
    }
  }
}

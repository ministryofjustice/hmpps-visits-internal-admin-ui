import { RequestHandler } from 'express'
import { PrisonService, SessionTemplateService } from '../../../services'
import { responseErrorToFlashMessage } from '../../../utils/utils'

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

      const visitStats = await this.sessionTemplateService.getFutureTemplateStats(res.locals.user.username, reference)

      return res.render('pages/prisons/sessionTemplates/viewSingleSessionTemplate', {
        errors: req.flash('errors'),
        message: req.flash('message'),
        prison,
        sessionTemplate,
        visitStats,
      })
    }
  }

  public activate(): RequestHandler {
    return async (req, res) => {
      const { prisonId, reference } = req.params

      try {
        await this.sessionTemplateService.activateSessionTemplate(res.locals.user.username, reference)
        req.flash('message', 'Template activated')
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
      }

      return res.redirect(`/prisons/${prisonId}/session-templates/${reference}`)
    }
  }

  public deactivate(): RequestHandler {
    return async (req, res) => {
      const { prisonId, reference } = req.params

      try {
        await this.sessionTemplateService.deactivateSessionTemplate(res.locals.user.username, reference)
        req.flash('message', 'Template deactivated')
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
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
        req.flash('message', `Session template '${name}' has been deleted`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
        return res.redirect(`/prisons/${prisonId}/session-templates/${reference}`)
      }

      return res.redirect(`/prisons/${prisonId}/session-templates`)
    }
  }
}

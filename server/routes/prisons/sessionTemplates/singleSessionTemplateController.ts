import { RequestHandler } from 'express'
import { format } from 'date-fns'
import { PrisonService, SessionTemplateService } from '../../../services'
import { responseErrorToFlashMessage } from '../../../utils/utils'
import { RequestSessionTemplateVisitStatsDto } from '../../../data/visitSchedulerApiTypes'

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

      const requestVisitStatsDto: RequestSessionTemplateVisitStatsDto = {
        visitsFromDate: format(new Date(), 'yyyy-MM-dd'),
      }
      const visitStats = await this.sessionTemplateService.getTemplateStats(
        res.locals.user.username,
        requestVisitStatsDto,
        reference,
      )

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

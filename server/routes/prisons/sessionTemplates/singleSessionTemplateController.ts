import { RequestHandler } from 'express'
import { PrisonService, SessionTemplateService } from '../../../services'

export default class SingleSessionTemplateController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly sessionTemplateService: SessionTemplateService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params
      const { prison, prisonName } = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const sessionTemplate = await this.sessionTemplateService.getSingleSessionTemplate(
        res.locals.user.username,
        reference,
      )

      return res.render('pages/prisons/viewSingleSessionTemplate', {
        errors: req.flash('errors'),
        message: req.flash('message'),
        prison,
        prisonName,
        sessionTemplate,
      })
    }
  }

  public activate(): RequestHandler {
    return async (req, res) => {
      const { reference } = req.params

      const sessionTemplate = await this.sessionTemplateService.activateSessionTemplate(
        res.locals.user.username,
        reference,
      )
      if (sessionTemplate.active) {
        req.flash('message', 'Template activated')
      } else {
        req.flash('errors', [{ msg: 'Failed to change  session template status' }])
      }

      return res.redirect(`/prisons/${sessionTemplate.prisonId}/session-templates/${sessionTemplate.reference}`)
    }
  }

  public deactivate(): RequestHandler {
    return async (req, res) => {
      const { reference } = req.params

      const sessionTemplate = await this.sessionTemplateService.deactivateSessionTemplate(
        res.locals.user.username,
        reference,
      )
      if (!sessionTemplate.active) {
        req.flash('message', 'Template deactivated')
      } else {
        req.flash('errors', [{ msg: 'Failed to change session template status' }])
      }

      return res.redirect(`/prisons/${sessionTemplate.prisonId}/session-templates/${sessionTemplate.reference}`)
    }
  }
}

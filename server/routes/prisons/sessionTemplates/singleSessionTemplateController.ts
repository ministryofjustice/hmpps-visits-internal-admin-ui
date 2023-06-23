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
        prison,
        prisonName,
        sessionTemplate,
      })
    }
  }
}

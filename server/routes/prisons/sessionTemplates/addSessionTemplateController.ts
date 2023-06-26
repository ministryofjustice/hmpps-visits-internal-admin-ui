import { RequestHandler } from 'express'
import { PrisonService, SessionTemplateService } from '../../../services'

export default class AddSessionTemplateController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly sessionTemplateService: SessionTemplateService,
  ) {}

  public add(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const { prisonName } = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const message = req.flash('message')
      res.render('pages/prisons/addSessionTemplate', {
        errors: req.flash('errors'),
        prisonId,
        prisonName,
        message,
      })
    }
  }
}

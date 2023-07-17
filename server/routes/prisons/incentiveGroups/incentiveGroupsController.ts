import { RequestHandler } from 'express'
import { IncentiveGroupService, PrisonService } from '../../../services'

export default class IncentiveGroupsController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly incentiveGroupService: IncentiveGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const incentiveGroups = await this.incentiveGroupService.getIncentiveGroups(res.locals.user.username, prisonId)

      return res.render('pages/prisons/incentiveGroups/viewIncentiveGroups', {
        prison,
        incentiveGroups,
        message: req.flash('message'),
      })
    }
  }
}

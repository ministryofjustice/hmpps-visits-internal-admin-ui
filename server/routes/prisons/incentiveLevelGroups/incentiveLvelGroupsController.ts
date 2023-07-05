import { RequestHandler } from 'express'
import { IncentiveLevelGroupService, PrisonService } from '../../../services'

export default class IncentiveLevelGroupsController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly incentiveLevelGroupService: IncentiveLevelGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const { prison, prisonName } = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const incentiveLevelGroups = await this.incentiveLevelGroupService.getIncentiveLevelGroups(
        res.locals.user.username,
        prisonId,
      )

      return res.render('pages/prisons/incentiveLevelGroups/viewIncentiveLevelGroups', {
        prison,
        prisonName,
        incentiveLevelGroups,
      })
    }
  }
}

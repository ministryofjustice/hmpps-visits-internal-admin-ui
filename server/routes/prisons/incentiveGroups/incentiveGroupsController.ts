import { RequestHandler } from 'express'
import { IncentiveGroupService, PrisonService } from '../../../services'
import incentiveLevels from '../../../constants/incentiveLevels'

export default class IncentiveGroupsController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly incentiveGroupService: IncentiveGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const rawIncentiveGroups = await this.incentiveGroupService.getIncentiveGroups(res.locals.user.username, prisonId)

      const incentiveGroups = rawIncentiveGroups.map(group => {
        return {
          ...group,
          incentiveLevels: group.incentiveLevels.map(level => incentiveLevels[level]),
        }
      })

      return res.render('pages/prisons/incentiveGroups/viewIncentiveGroups', {
        prison,
        incentiveGroups,
        messages: req.flash('messages'),
      })
    }
  }
}

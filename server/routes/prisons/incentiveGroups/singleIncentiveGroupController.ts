import { RequestHandler } from 'express'
import { PrisonService, IncentiveGroupService } from '../../../services'

export default class SingleIncentiveGroupController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly incentiveGroupService: IncentiveGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const incentiveGroup = await this.incentiveGroupService.getSingleIncentiveGroup(
        res.locals.user.username,
        reference,
      )

      return res.render('pages/prisons/incentiveGroups/viewSingleIncentiveGroup', { prison, incentiveGroup })
    }
  }

  public delete(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params

      try {
        await this.incentiveGroupService.deleteIncentiveGroup(res.locals.user.username, reference)
        req.flash('message', `Incentive group with reference ${reference} deleted.`)
      } catch (error) {
        req.flash('errors', [{ msg: `Failed to delete incentive group with reference - ${reference}` }])
        return res.redirect(`/prisons/${prisonId}/incentive-groups/${reference}`)
      }

      return res.redirect(`/prisons/${prisonId}/incentive-groups`)
    }
  }
}

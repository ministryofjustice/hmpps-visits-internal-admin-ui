import { RequestHandler } from 'express'
import { PrisonService, IncentiveGroupService } from '../../../services'
import incentiveLevels from '../../../constants/incentiveLevels'
import { responseErrorToFlashMessage } from '../../../utils/utils'

export default class SingleIncentiveGroupController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly incentiveGroupService: IncentiveGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params
      const { sessionTemplateRef } = req.query

      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const incentiveGroup = await this.incentiveGroupService.getSingleIncentiveGroup(
        res.locals.user.username,
        reference,
      )
      const incentiveLevelValues = incentiveGroup.incentiveLevels.map(level => incentiveLevels[level])

      return res.render('pages/prisons/incentiveGroups/viewSingleIncentiveGroup', {
        errors: req.flash('errors'),
        prison,
        incentiveGroup,
        incentiveLevelValues,
        sessionTemplateRef,
        message: req.flash('message'),
      })
    }
  }

  public delete(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params

      try {
        const { name } = await this.incentiveGroupService.getSingleIncentiveGroup(res.locals.user.username, reference)
        await this.incentiveGroupService.deleteIncentiveGroup(res.locals.user.username, reference)
        req.flash('message', `Incentive group '${name}' has been deleted`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
        return res.redirect(`/prisons/${prisonId}/incentive-groups/${reference}`)
      }

      return res.redirect(`/prisons/${prisonId}/incentive-groups`)
    }
  }
}

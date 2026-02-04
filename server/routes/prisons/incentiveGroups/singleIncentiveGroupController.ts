import { RequestHandler } from 'express'
import { PrisonService, IncentiveGroupService } from '../../../services'
import incentiveLevels from '../../../constants/incentiveLevels'
import { responseErrorToFlashMessages } from '../../../utils/utils'
import { PrisonReferenceParams } from '../../../@types/requestParameterTypes'

export default class SingleIncentiveGroupController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly incentiveGroupService: IncentiveGroupService,
  ) {}

  public view(): RequestHandler<PrisonReferenceParams> {
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
        messages: req.flash('messages'),
      })
    }
  }

  public delete(): RequestHandler<PrisonReferenceParams> {
    return async (req, res) => {
      const { reference, prisonId } = req.params

      try {
        const { name } = await this.incentiveGroupService.getSingleIncentiveGroup(res.locals.user.username, reference)
        await this.incentiveGroupService.deleteIncentiveGroup(res.locals.user.username, reference)
        req.flash('messages', {
          variant: 'success',
          title: 'Incentive group deleted',
          text: `Incentive group '${name}' has been deleted`,
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        return res.redirect(`/prisons/${prisonId}/incentive-groups/${reference}`)
      }

      return res.redirect(`/prisons/${prisonId}/incentive-groups`)
    }
  }
}

import { RequestHandler } from 'express'
import { PrisonService, VisitAllocationService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'
import { PrisonParams } from '../../../@types/requestParameterTypes'

export default class VisitAllocationController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly visitAllocationService: VisitAllocationService,
  ) {}

  public view(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params

      const [prison, negativeBalanceCount] = await Promise.all([
        this.prisonService.getPrison(prisonId),
        this.visitAllocationService.getNegativeBalanceCount({
          prisonCode: prisonId,
        }),
      ])

      return res.render('pages/prisons/configuration/allocationReset', {
        errors: req.flash('errors'),
        prison,
        negativeBalanceCount: negativeBalanceCount.count,
      })
    }
  }

  public resetBalances(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params
      const { username } = res.locals.user

      try {
        await this.visitAllocationService.resetNegativeBalances({ username, prisonCode: prisonId })
        req.flash('messages', {
          variant: 'success',
          title: 'Visit allocation balances reset',
          text: 'Visit allocation balances reset',
        })

        return res.redirect(`/prisons/${prisonId}/configuration`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        return res.redirect(`/prisons/${prisonId}/allocations/reset/confirm`)
      }
    }
  }
}

import { RequestHandler } from 'express'
import { ValidationChain, body, matchedData, validationResult } from 'express-validator'
import { PrisonService, VisitAllocationService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'
import { UserClientType } from '../../../data/visitSchedulerApiTypes'
import { PrisonParams } from '../../../@types/requestParameterTypes'

export default class PrisonConfigController {
  private prisonUserClientTypes = ['PUBLIC', 'STAFF'] as const

  public constructor(
    private readonly prisonService: PrisonService,
    private readonly visitAllocationService: VisitAllocationService,
  ) {}

  public view(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params
      const { username } = res.locals.user

      const [prison, prisonContactDetails, negativeBalanceCount] = await Promise.all([
        this.prisonService.getPrison(res.locals.user.username, prisonId),
        this.prisonService.getPrisonContactDetails(username, prisonId),
        this.visitAllocationService.getNegativeBalanceCount({ username, prisonCode: prisonId }),
      ])

      return res.render('pages/prisons/configuration/config', {
        errors: req.flash('errors'),
        prison,
        prisonContactDetails,
        negativeBalanceCount: negativeBalanceCount.count,
        messages: req.flash('messages'),
      })
    }
  }

  public updateEnabledServices(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/configuration`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

      const { enabledServices } = matchedData<{ enabledServices: UserClientType[] }>(req)

      try {
        if (enabledServices.includes('PUBLIC')) {
          await this.prisonService.activatePrisonClientType(res.locals.user.username, prisonId, 'PUBLIC')
        } else {
          await this.prisonService.deactivatePrisonClientType(res.locals.user.username, prisonId, 'PUBLIC')
        }

        if (enabledServices.includes('STAFF')) {
          await this.prisonService.activatePrisonClientType(res.locals.user.username, prisonId, 'STAFF')
        } else {
          await this.prisonService.deactivatePrisonClientType(res.locals.user.username, prisonId, 'STAFF')
        }
        req.flash('messages', {
          variant: 'success',
          title: 'Enabled services updated',
          text: 'Enabled services have been updated',
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
      }

      return res.redirect(originalUrl)
    }
  }

  public validateEnabledServices(): ValidationChain[] {
    return [body('enabledServices').toArray().isArray({ max: 2 }).isIn(this.prisonUserClientTypes)]
  }

  public activate(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params

      try {
        await this.prisonService.activatePrison(res.locals.user.username, prisonId)
        const prisonName = await this.prisonService.getPrisonName(res.locals.user.username, prisonId)
        req.flash('messages', {
          variant: 'success',
          title: 'Prison activated',
          text: `${prisonName} has been activated`,
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
      }

      return res.redirect(`/prisons/${prisonId}/configuration`)
    }
  }

  public deactivate(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params

      try {
        await this.prisonService.deactivatePrison(res.locals.user.username, prisonId)
        const prisonName = await this.prisonService.getPrisonName(res.locals.user.username, prisonId)
        req.flash('messages', {
          variant: 'success',
          title: 'Prison deactivated',
          text: `${prisonName} has been deactivated`,
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
      }

      return res.redirect(`/prisons/${prisonId}/configuration`)
    }
  }
}

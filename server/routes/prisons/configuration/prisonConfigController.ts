import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { PrisonService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'
import { UserClientType } from '../../../data/visitSchedulerApiTypes'

export default class PrisonConfigController {
  private prisonUserClientTypes = ['PUBLIC', 'STAFF'] as const

  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const prisonContactDetails = await this.prisonService.getPrisonContactDetails(
        res.locals.user.username,
        prison.code,
      )

      return res.render('pages/prisons/configuration/config', {
        errors: req.flash('errors'),
        prison,
        prisonContactDetails,
        messages: req.flash('messages'),
      })
    }
  }

  public updateEnabledServices(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/configuration`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

      const { enabledServices }: { enabledServices: UserClientType } = req.body

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

  public activate(): RequestHandler {
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

  public deactivate(): RequestHandler {
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

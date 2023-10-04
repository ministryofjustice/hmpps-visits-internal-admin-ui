import { RequestHandler } from 'express'
import { PrisonService } from '../../../services'
import { responseErrorToFlashMessage } from '../../../utils/utils'

export default class PrisonConfigController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      // will need to add prisonId
      const information = await this.prisonService.getPrisonContactDetails(res.locals.user.username)

      return res.render('pages/prisons/configuration/config', {
        errors: req.flash('errors'),
        prison,
        information,
        message: req.flash('message'),
      })
    }
  }

  public edit(): RequestHandler {
    return async (req, res) => {
      const { prisonId, field } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      // will need to add prisonId
      const information = await this.prisonService.getPrisonContactDetails(res.locals.user.username)
      // field will be one of these values - regexp used in the index route
      const value = information[field as 'phone' | 'email' | 'website']

      return res.render('pages/prisons/configuration/edit', {
        errors: req.flash('errors'),
        prison,
        field,
        value,
        message: req.flash('message'),
      })
    }
  }

  public activate(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      try {
        await this.prisonService.activatePrison(res.locals.user.username, prisonId)
        const prisonName = await this.prisonService.getPrisonName(res.locals.user.username, prisonId)
        req.flash('message', `${prisonName} has been activated`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
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
        req.flash('message', `${prisonName} has been deactivated`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
      }

      return res.redirect(`/prisons/${prisonId}/configuration`)
    }
  }
}

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
      const information = await this.prisonService.getPrisonConfig(res.locals.user.username)
      if (information.email === '') {
        information.email = 'Not set'
      }
      if (information.phone === '') {
        information.phone = 'Not set'
      }
      if (information.website === '') {
        information.website = 'Not set'
      }
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
      const information = await this.prisonService.getPrisonConfig(res.locals.user.username)

      let value = ''
      if (field === 'email') {
        value = information.email
      } else if (field === 'phone') {
        value = information.phone
      } else if (field === 'website') {
        value = information.website
      } else {
        res.redirect('/prisons/:prisonId/configuration/')
      }

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

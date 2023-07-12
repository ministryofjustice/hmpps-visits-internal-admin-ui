import { RequestHandler } from 'express'
import { PrisonService } from '../../../services'

export default class PrisonStatusController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      return res.render('pages/prisons/status/status', {
        errors: req.flash('errors'),
        prison,
        message: req.flash('message'),
      })
    }
  }

  public activate(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const prison = await this.prisonService.activatePrison(res.locals.user.username, prisonId)
      if (prison.active) {
        req.flash('message', 'activated')
      } else {
        req.flash('errors', [{ msg: 'Failed to change prison status' }])
      }

      return res.redirect(`/prisons/${prisonId}/status`)
    }
  }

  public deactivate(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const prison = await this.prisonService.deactivatePrison(res.locals.user.username, prisonId)
      if (!prison.active) {
        req.flash('message', 'deactivated')
      } else {
        req.flash('errors', [{ msg: 'Failed to change prison status' }])
      }

      return res.redirect(`/prisons/${prisonId}/status`)
    }
  }
}

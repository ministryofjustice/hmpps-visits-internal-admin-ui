import { RequestHandler } from 'express'
import { format } from 'date-fns'
import { PrisonService } from '../../../services'

export default class ExclusionDatesController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const { prisonName, prison } = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const excludeDates = prison.excludeDates.map(d => [format(new Date(d), 'd MMMM yyyy'), d])

      const message = req.flash('message')
      res.render('pages/prisons/exclusionDates', {
        errors: req.flash('errors'),
        prisonId,
        prisonName,
        excludeDates,
        message,
      })
    }
  }

  public addDate(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const date = `${req.body['exclude-date-year']}-${req.body['exclude-date-month']}-${req.body['exclude-date-day']}`

      try {
        await this.prisonService.addExcludeDate(res.locals.user.username, prisonId, date)
        req.flash('message', `${date} has been successfully added.`)
      } catch (error) {
        req.flash('errors', [{ msg: `Failed to add date ${date}` }])
      }

      return res.redirect(`/prisons/${prisonId}/exclusion-dates`)
    }
  }

  public removeDate(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const date = req.body.excludeDate

      try {
        await this.prisonService.removeExcludeDate(res.locals.user.username, prisonId, date)
        req.flash('message', `${date} has been successfully removed.`)
      } catch (error) {
        req.flash('errors', [{ msg: `Failed to remove date ${date}` }])
      }

      return res.redirect(`/prisons/${prisonId}/exclusion-dates`)
    }
  }
}

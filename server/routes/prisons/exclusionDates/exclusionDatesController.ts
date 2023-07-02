import { RequestHandler } from 'express'
import { PrisonService } from '../../../services'

export default class ExclusionDatesController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const { prisonName, prison } = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const { excludeDates } = prison
      const formValues = req.flash('formValues')?.[0] || {}

      const message = req.flash('message')
      res.render('pages/prisons/exclusionDates', {
        errors: req.flash('errors'),
        prisonId,
        prisonName,
        excludeDates,
        message,
        formValues,
      })
    }
  }

  public addDate(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const date = `${req.body['exclude-date-year']}-${req.body['exclude-date-month']}-${req.body['exclude-date-day']}`

      try {
        await this.prisonService.addExcludeDate(res.locals.user.username, prisonId, date)
      } catch (error) {
        throw new Error(`Prison '${prisonId}' is not in the prison register`)
      }

      return res.redirect(`/prisons/${prisonId}/exclude-date`)
    }
  }

  public removeDate(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const date = `${req.body['exclude-date-year']}-${req.body['exclude-date-month']}-${req.body['exclude-date-day']}`

      try {
        await this.prisonService.removeExcludeDate(res.locals.user.username, prisonId, date)
      } catch (error) {
        throw new Error(`Prison '${prisonId}' is not in the prison register`)
      }

      return res.redirect(`/prisons/${prisonId}/exclude-date`)
    }
  }
}

import { RequestHandler } from 'express'
import { PrisonService } from '../../../services'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const transformDate = (date: string): string => {
  const splitedDate = date.split('-').map(d => Number(d))

  return `${splitedDate[2]} ${MONTHS[splitedDate[1] - 1]} ${splitedDate[0]}`
}

export default class ExclusionDatesController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const { prisonName, prison } = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const excludeDates = prison.excludeDates.map(d => [transformDate(d), d])
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
        throw new Error(`Date '${date}' didn't be added`)
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
      } catch (error) {
        throw new Error(`Date '${date}' didn't be removed`)
      }

      return res.redirect(`/prisons/${prisonId}/exclusion-dates`)
    }
  }
}

import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { PrisonService } from '../../../services'
import { formatDate } from '../../../utils/utils'

export default class ExcludedDatesController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const { prisonName, prison } = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      res.render('pages/prisons/excludedDates/viewExcludedDates', {
        errors: req.flash('errors'),
        prisonId,
        prisonName,
        prison,
        message: req.flash('message'),
      })
    }
  }

  public addDate(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const originalUrl = `/prisons/${prisonId}/excluded-dates`
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        return res.redirect(originalUrl)
      }

      const { excludeDate } = req.body
      const excludeDateFormatted = formatDate(excludeDate)

      try {
        await this.prisonService.addExcludeDate(res.locals.user.username, prisonId, excludeDate)
        req.flash('message', `${excludeDateFormatted} has been successfully added`)
      } catch (error) {
        req.flash('errors', [{ msg: `Failed to add date ${excludeDateFormatted}` }])
      }

      return res.redirect(originalUrl)
    }
  }

  public removeDate(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const { excludeDate } = req.body

      const excludeDateFormatted = formatDate(excludeDate)

      try {
        await this.prisonService.removeExcludeDate(res.locals.user.username, prisonId, excludeDate)
        req.flash('message', `${excludeDateFormatted} has been successfully removed`)
      } catch (error) {
        req.flash('errors', [{ msg: `Failed to remove date ${excludeDateFormatted}` }])
      }

      return res.redirect(`/prisons/${prisonId}/excluded-dates`)
    }
  }

  public validate(): ValidationChain[] {
    return [
      body('excludeDate.*').trim().toInt(),
      body('excludeDate', 'Enter a valid date')
        .customSanitizer(date => {
          return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`
        })
        .isDate({ format: 'YYYY-MM-DD', strictMode: true }),
    ]
  }
}

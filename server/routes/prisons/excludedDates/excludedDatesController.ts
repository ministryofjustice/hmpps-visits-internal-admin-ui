import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { ExcludeDateService, PrisonService, VisitService } from '../../../services'
import { formatDate, responseErrorToFlashMessages } from '../../../utils/utils'
import { PrisonParams } from '../../../@types/requestParameterTypes'

export default class ExcludedDatesController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly visitService: VisitService,
    private readonly excludeDateService: ExcludeDateService,
  ) {}

  public view(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params
      const { username } = res.locals.user

      const prison = await this.prisonService.getPrison(username, prisonId)
      const blockedDates = await this.excludeDateService.getExcludeDates(username, prisonId)

      res.render('pages/prisons/excludedDates/viewExcludedDates', {
        errors: req.flash('errors'),
        blockedDates,
        prison,
        messages: req.flash('messages'),
      })
    }
  }

  public checkDate(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const originalUrl = `/prisons/${prisonId}/excluded-dates`
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        return res.redirect(originalUrl)
      }

      const { excludeDate } = req.body

      const visitCount = await this.visitService.getVisitCountByDate(res.locals.user.username, prisonId, excludeDate)

      return res.render('pages/prisons/excludedDates/viewExcludedDates', {
        prison,
        excludeDate: excludeDate.toString().split('-'),
        visitCount,
      })
    }
  }

  public addDate(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params
      const originalUrl = `/prisons/${prisonId}/excluded-dates`
      const { username } = res.locals.user

      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        return res.redirect(originalUrl)
      }

      const { excludeDate } = req.body
      const excludeDateFormatted = formatDate(excludeDate)

      try {
        await this.excludeDateService.addExcludeDate(username, prisonId, excludeDate)
        req.flash('messages', {
          variant: 'success',
          title: 'Date added',
          text: `${excludeDateFormatted} has been successfully added by ${username}`,
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
      }
      return res.redirect(originalUrl)
    }
  }

  public removeDate(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params
      const { excludeDate } = req.body
      const { username } = res.locals.user

      const excludeDateFormatted = formatDate(excludeDate)

      try {
        await this.excludeDateService.removeExcludeDate(username, prisonId, excludeDate)
        req.flash('messages', {
          variant: 'success',
          title: 'Date removed',
          text: `${excludeDateFormatted} has been successfully removed by ${username}`,
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
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

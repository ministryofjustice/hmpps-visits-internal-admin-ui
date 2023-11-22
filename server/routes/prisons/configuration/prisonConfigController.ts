import { RequestHandler } from 'express'
import { body, ValidationChain, validationResult } from 'express-validator'
import { PrisonService } from '../../../services'
import { responseErrorToFlashMessage } from '../../../utils/utils'

export default class PrisonConfigController {
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
        message: req.flash('message'),
      })
    }
  }

  public editBookingWindow(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const formValues = {
        policyNoticeDaysMin: prison.policyNoticeDaysMin,
        policyNoticeDaysMax: prison.policyNoticeDaysMax,
        ...req.flash('formValues')?.[0],
      }

      return res.render('pages/prisons/configuration/bookingWindowForm', {
        errors: req.flash('errors'),
        prison,
        formValues,
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

  public editBookingWindowSubmit(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/configuration/booking-window/edit`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

      const { policyNoticeDaysMin, policyNoticeDaysMax } = req.body

      try {
        await this.prisonService.updatePrisonDetails(res.locals.user.username, prisonId, {
          policyNoticeDaysMin,
          policyNoticeDaysMax,
        })
        req.flash('message', 'Booking window updated')

        return res.redirect(`/prisons/${prisonId}/configuration`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }
    }
  }

  public validateBookingWindow(): ValidationChain[] {
    return [
      body('policyNoticeDaysMin')
        .trim()
        .toInt()
        .isInt({ min: 0 })
        .withMessage('Enter a min booking window value of at least 1'),
      body('policyNoticeDaysMax')
        .trim()
        .toInt()
        .isInt({ min: 0 })
        .withMessage('Enter a max booking window value of at least 1'),
      body(['policyNoticeDaysMin']).custom((_value, { req }) => {
        const { policyNoticeDaysMin, policyNoticeDaysMax } = req.body
        if (policyNoticeDaysMin > policyNoticeDaysMax) {
          throw new Error('Enter a Min window less than or equal to the Max')
        }
        return true
      }),
    ]
  }
}

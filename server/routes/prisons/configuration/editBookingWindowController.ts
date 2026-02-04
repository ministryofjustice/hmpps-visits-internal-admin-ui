import { RequestHandler } from 'express'
import { validationResult, ValidationChain, body } from 'express-validator'
import { PrisonService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'
import { PrisonParams } from '../../../@types/requestParameterTypes'

export default class EditBookingWindowController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const formValues = {
        policyNoticeDaysMin: prison.policyNoticeDaysMin.toString(),
        policyNoticeDaysMax: prison.policyNoticeDaysMax.toString(),
        ...req.flash('formValues')?.[0],
      }

      return res.render('pages/prisons/configuration/editBookingWindow', {
        errors: req.flash('errors'),
        prison,
        formValues,
        messages: req.flash('messages'),
      })
    }
  }

  public submit(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/configuration/booking-window/edit`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

      const { policyNoticeDaysMin, policyNoticeDaysMax }: { policyNoticeDaysMin: number; policyNoticeDaysMax: number } =
        req.body

      try {
        await this.prisonService.updatePrison(res.locals.user.username, prisonId, {
          policyNoticeDaysMin,
          policyNoticeDaysMax,
        })
        req.flash('messages', { variant: 'success', title: 'Booking window updated', text: 'Booking window updated' })

        return res.redirect(`/prisons/${prisonId}/configuration`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }
    }
  }

  public validate(): ValidationChain[] {
    return [
      body('policyNoticeDaysMin')
        .trim()
        .toInt()
        .isInt({ min: 0 })
        .withMessage('Enter a min booking window value of at least 0'),
      body('policyNoticeDaysMax')
        .trim()
        .toInt()
        .isInt({ min: 1 })
        .withMessage('Enter a max booking window value of at least 1'),
      body(['policyNoticeDaysMin']).custom((_value, { req }) => {
        const {
          policyNoticeDaysMin,
          policyNoticeDaysMax,
        }: { policyNoticeDaysMin: number; policyNoticeDaysMax: number } = req.body
        if (policyNoticeDaysMin > policyNoticeDaysMax) {
          throw new Error('Enter a min window less than or equal to the max')
        }
        return true
      }),
    ]
  }
}

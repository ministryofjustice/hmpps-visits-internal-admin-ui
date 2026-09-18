import { RequestHandler } from 'express'
import { validationResult, ValidationChain, body } from 'express-validator'
import { PrisonService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'
import { PrisonParams } from '../../../@types/requestParameterTypes'
import { UserClientType } from '../../../data/visitSchedulerApiTypes'

export default class EditBookingWindowsController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params
      const prison = await this.prisonService.getPrison(prisonId)

      const minDays = {} as Record<UserClientType, string>
      const maxDays = {} as Record<UserClientType, string>

      const { staffPrisonUserClient, publicPrisonUserClient } = prison
      const clients = [staffPrisonUserClient, publicPrisonUserClient].filter(Boolean)
      clients.forEach(client => {
        minDays[client.userType] = client.policyNoticeDaysMin.toString()
        maxDays[client.userType] = client.policyNoticeDaysMax.toString()
      })

      const formValues = {
        minDays,
        maxDays,
        ...req.flash('formValues')?.[0],
      }

      return res.render('pages/prisons/configuration/editBookingWindows', {
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

      const originalUrl = `/prisons/${prisonId}/configuration/booking-windows/edit`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

      const { minDays, maxDays }: { minDays: Record<UserClientType, string>; maxDays: Record<UserClientType, string> } =
        req.body

      try {
        // Get the prison's current clients
        const { staffPrisonUserClient, publicPrisonUserClient } = await this.prisonService.getPrison(prisonId)

        // Update STAFF client
        staffPrisonUserClient.policyNoticeDaysMin = parseInt(minDays.STAFF, 10)
        staffPrisonUserClient.policyNoticeDaysMax = parseInt(maxDays.STAFF, 10)

        // If prison has a PUBLIC client, update its values
        if (publicPrisonUserClient) {
          if (minDays.PUBLIC === undefined || maxDays.PUBLIC === undefined) {
            throw new Error('Missing PUBLIC client booking window values')
          }
          publicPrisonUserClient.policyNoticeDaysMin = parseInt(minDays.PUBLIC, 10)
          publicPrisonUserClient.policyNoticeDaysMax = parseInt(maxDays.PUBLIC, 10)
        }

        // Update prison
        await this.prisonService.updatePrison(res.locals.user.username, prisonId, {
          clients: publicPrisonUserClient ? [staffPrisonUserClient, publicPrisonUserClient] : [staffPrisonUserClient],
        })

        req.flash('messages', { variant: 'success', title: 'Booking windows updated', text: 'Booking windows updated' })
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
      // STAFF client values - minimum
      body('minDays.STAFF')
        .trim()
        .isInt({ min: 0 })
        .withMessage('Enter a minimum booking window value of at least 0')
        .bail()
        .if(body('maxDays.STAFF').exists().isInt())
        .custom((minDays, { req }) => {
          return parseInt(minDays, 10) <= parseInt(req.body.maxDays.STAFF, 10)
        })
        .withMessage('Enter a minimum window less than or equal to the maximum'),

      // STAFF client values - maximum
      body('maxDays.STAFF').trim().isInt({ min: 1 }).withMessage('Enter a maximum booking window value of at least 1'),

      // PUBLIC client values - may not be a public client so .optional() (and also checked in route handler)
      // Minimum
      body('minDays.PUBLIC')
        .trim()
        .optional()
        .isInt({ min: 2 })
        .withMessage('Enter a minimum booking window value of at least 2')
        .bail()
        .if(body('maxDays.PUBLIC').exists().isInt())
        .custom((minDays, { req }) => {
          return parseInt(minDays, 10) <= parseInt(req.body.maxDays.PUBLIC, 10)
        })
        .withMessage('Enter a minimum window less than or equal to the maximum'),

      // Maximum
      body('maxDays.PUBLIC')
        .trim()
        .optional()
        .isInt({ min: 1 })
        .withMessage('Enter a maximum booking window value of at least 1'),
    ]
  }
}

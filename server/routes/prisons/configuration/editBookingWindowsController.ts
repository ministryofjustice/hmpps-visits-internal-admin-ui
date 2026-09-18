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

      const minDays = {} as Record<UserClientType, number>
      const maxDays = {} as Record<UserClientType, number>

      const { staffPrisonUserClient, publicPrisonUserClient } = prison
      const clients = [staffPrisonUserClient, publicPrisonUserClient].filter(Boolean)
      clients.forEach(client => {
        minDays[client.userType] = client.policyNoticeDaysMin
        maxDays[client.userType] = client.policyNoticeDaysMax
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

      const { minDays, maxDays }: { minDays: Record<UserClientType, number>; maxDays: Record<UserClientType, number> } =
        req.body

      try {
        // Get the prison's current clients
        const { staffPrisonUserClient, publicPrisonUserClient } = await this.prisonService.getPrison(prisonId)

        // Update STAFF client
        staffPrisonUserClient.policyNoticeDaysMin = minDays.STAFF
        staffPrisonUserClient.policyNoticeDaysMax = maxDays.STAFF

        // If prison has a PUBLIC client, update its values
        if (publicPrisonUserClient) {
          if (minDays.PUBLIC === undefined || maxDays.PUBLIC === undefined) {
            throw new Error('Missing PUBLIC client booking window values')
          }
          publicPrisonUserClient.policyNoticeDaysMin = minDays.PUBLIC
          publicPrisonUserClient.policyNoticeDaysMax = maxDays.PUBLIC
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
      // STAFF client values
      body('minDays.STAFF')
        .trim()
        .isInt({ min: 0 })
        .withMessage('Enter a minimum booking window value of at least 0')
        .toInt(),
      body('maxDays.STAFF')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Enter a maximum booking window value of at least 1')
        .toInt(),

      // PUBLIC client values - may not be a public client so .optional() (and also checked in route handler)
      body('minDays.PUBLIC')
        .trim()
        .optional()
        .isInt({ min: 2 })
        .withMessage('Enter a minimum booking window value of at least 2')
        .toInt(),
      body('maxDays.PUBLIC')
        .trim()
        .optional()
        .isInt({ min: 1 })
        .withMessage('Enter a maximum booking window value of at least 1')
        .toInt(),

      // Minimum days cannot be greater than the maximum days (for given client type)
      body(['minDays.STAFF', 'minDays.PUBLIC'])
        .custom((minDays: number, { req, path }) => {
          const maxDays = path === 'minDays.STAFF' ? req.body.maxDays?.STAFF : req.body.maxDays?.PUBLIC

          return maxDays === undefined || minDays <= maxDays
        })
        .withMessage('Enter a minimum window less than or equal to the maximum'),
    ]
  }
}

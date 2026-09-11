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

      prison.clients.forEach(client => {
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
        // Get the current prison 'client' configuration
        const { clients } = await this.prisonService.getPrison(prisonId)

        // Set new values
        const updatedClients = clients.map(client => ({
          ...client,
          policyNoticeDaysMin: minDays[client.userType],
          policyNoticeDaysMax: maxDays[client.userType],
        }))

        // Update prison
        await this.prisonService.updatePrison(res.locals.user.username, prisonId, { clients: updatedClients })

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
      body('minDays.*')
        .trim()
        .toInt()
        .isInt({ min: 0 })
        .withMessage('Enter a minimum booking window value of at least 0'),

      body('maxDays.*')
        .trim()
        .toInt()
        .isInt({ min: 1 })
        .withMessage('Enter a maximum booking window value of at least 1'),

      // Check that the minimum days is less than or equal to the maximum days
      body(['minDays.*']).custom((minDays: number, meta) => {
        const { req, pathValues } = meta
        const maxDays = req.body.maxDays[pathValues[0]?.toString()] as number

        if (minDays > maxDays) {
          throw new Error('Enter a minimum window less than or equal to the maximum')
        }
        return true
      }),
    ]
  }
}

import { RequestHandler } from 'express'
import { BookerService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'

export default class PrisonerStatusController {
  public constructor(private readonly bookerService: BookerService) {}

  public setStatus(action: 'active' | 'inactive'): RequestHandler {
    return async (req, res) => {
      const { reference } = req.params
      const booker = await this.bookerService.getBookerByReference(res.locals.user.username, reference)

      if (booker.permittedPrisoners.length === 0) {
        req.flash('messages', {
          variant: 'information',
          title: 'Booker has no prisoner',
          text: 'This booker has no prisoner',
        })
        return res.redirect(`/bookers/booker/${reference}`)
      }

      try {
        if (action === 'active') {
          await this.bookerService.deactivatePrisoner(
            res.locals.user.username,
            booker.reference,
            booker.permittedPrisoners[0].prisonerId,
          )
        } else {
          await this.bookerService.activatePrisoner(
            res.locals.user.username,
            booker.reference,
            booker.permittedPrisoners[0].prisonerId,
          )
        }

        req.flash('messages', {
          variant: 'success',
          title: 'Prisoner status updated',
          text: 'Prisoner status updated',
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        req.flash('formValues', req.body)
      }

      return res.redirect(`/bookers/booker/${reference}`)
    }
  }
}

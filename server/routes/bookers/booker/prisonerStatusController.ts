import { RequestHandler } from 'express'
import { BookerService } from '../../../services'
import { responseErrorToFlashMessage } from '../../../utils/utils'

export default class PrisonerStatusController {
  public constructor(private readonly bookerService: BookerService) {}

  public setStatus(action: 'active' | 'inactive'): RequestHandler {
    return async (req, res) => {
      const { booker } = req.session

      if (booker.permittedPrisoners.length === 0) {
        req.flash('message', { text: 'This booker has no prisoner', type: 'information' })
        return res.redirect('/bookers/booker/details')
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

        req.flash('message', { text: `Prisoner status updated`, type: 'success' })

        req.session.booker = await this.bookerService.getBookerByEmail(res.locals.user.username, booker.email)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
        req.flash('formValues', req.body)
      }

      return res.redirect('/bookers/booker/details')
    }
  }
}

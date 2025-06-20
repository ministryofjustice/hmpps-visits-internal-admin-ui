import { RequestHandler } from 'express'
import { body, ValidationChain } from 'express-validator'
import { BookerService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'

export default class VisitorStatusController {
  public constructor(private readonly bookerService: BookerService) {}

  public setStatus(action: 'active' | 'inactive'): RequestHandler {
    return async (req, res) => {
      const { prisonerId, reference } = req.params
      const { visitorId } = req.body

      const booker = await this.bookerService.getBookerByReference(res.locals.user.username, reference)
      const prisoner = booker.permittedPrisoners.find(permittedPrisoner => permittedPrisoner.prisonerId === prisonerId)

      if (!prisoner) {
        req.flash('messages', {
          variant: 'information',
          title: 'Booker has no prisoner',
          text: 'This booker has no prisoner',
        })
        return res.redirect(`/bookers/booker/${reference}`)
      }

      try {
        if (action === 'active') {
          await this.bookerService.deactivateVisitor(
            res.locals.user.username,
            booker.reference,
            prisoner.prisonerId,
            visitorId,
          )
        } else {
          await this.bookerService.activateVisitor(
            res.locals.user.username,
            booker.reference,
            prisoner.prisonerId,
            visitorId,
          )
        }

        req.flash('messages', {
          variant: 'success',
          title: 'Visitor status updated',
          text: 'Visitor status updated',
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        req.flash('formValues', req.body)
      }

      return res.redirect(`/bookers/booker/${reference}/prisoner/${prisonerId}`)
    }
  }

  public validate(): ValidationChain[] {
    return [body('visitorId').toInt().notEmpty()]
  }
}

import { RequestHandler } from 'express'
import { body, ValidationChain } from 'express-validator'
import { BookerService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'

export default class VisitorStatusController {
  public constructor(private readonly bookerService: BookerService) {}

  public setStatus(action: 'active' | 'inactive'): RequestHandler {
    return async (req, res) => {
      const { booker } = req.session
      const { visitorId } = req.body

      if (booker.permittedPrisoners.length === 0) {
        req.flash('messages', {
          variant: 'information',
          title: 'Booker has no prisoner',
          text: 'This booker has no prisoner',
        })
        return res.redirect('/bookers/booker/details')
      }

      try {
        if (action === 'active') {
          await this.bookerService.deactivateVisitor(
            res.locals.user.username,
            booker.reference,
            booker.permittedPrisoners[0].prisonerId,
            visitorId,
          )
        } else {
          await this.bookerService.activateVisitor(
            res.locals.user.username,
            booker.reference,
            booker.permittedPrisoners[0].prisonerId,
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

      return res.redirect('/bookers/booker/details')
    }
  }

  public validate(): ValidationChain[] {
    return [body('visitorId').toInt().notEmpty()]
  }
}

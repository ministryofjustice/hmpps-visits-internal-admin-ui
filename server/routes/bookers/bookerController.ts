import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { responseErrorToFlashMessage } from '../../utils/utils'
import { BookerService } from '../../services'

export default class BookerController {
  public constructor(private readonly bookerService: BookerService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/bookers/index', {
        errors: req.flash('errors'),
        message: req.flash('message'),
      })
    }
  }

  public updateBookerDetails(): RequestHandler {
    return async (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect('/bookers')
      }

      try {
        const {
          bookerEmail,
          prisonerId,
          visitorIds,
        }: { bookerEmail: string; prisonerId: string; visitorIds: number[] } = req.body

        const booker = await this.bookerService.updateBookerDetails(
          res.locals.user.username,
          bookerEmail,
          prisonerId,
          visitorIds,
        )

        req.flash('message', `Details updated. Booker reference: ${booker.reference}`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
      }
      return res.redirect('/bookers')
    }
  }

  public clearBookerDetails(): RequestHandler {
    return async (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect('/bookers')
      }

      try {
        const { bookerReference } = req.body
        const booker = await this.bookerService.clearBookerDetails(res.locals.user.username, bookerReference)

        req.flash('message', `Details cleared. Booker reference: ${bookerReference} (${booker.email})`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
      }
      return res.redirect('/bookers')
    }
  }

  public validateClearBookerDetails(): ValidationChain[] {
    return [body('bookerReference', 'Invalid booker reference').isLength({ min: 5, max: 30 })]
  }

  public validateUpdateBookerDetails(): ValidationChain[] {
    return [
      body('bookerEmail', 'Invalid booker email').isEmail(),
      body('prisonerId', 'Invalid prisoner number').trim().isLength({ min: 5, max: 10 }),
      body('visitorIds', 'Invalid visitor IDs')
        .trim()
        .whitelist('\\d\\s')
        .isLength({ min: 4, max: 100 })
        .customSanitizer(visitorIds => visitorIds.split(/\s+/))
        .toInt(),
    ]
  }
}

import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { responseErrorToFlashMessage } from '../../utils/utils'

export default class BookersController {
  public constructor() {}

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

      const { bookerEmail, prisonerId, visitorId } = req.body
      // visitorIds.split(/\s+/)

      try {
        // TODO call API
        req.flash('message', `UPDATED!!! `)
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

      const { bookerReference } = req.body

      try {
        // TODO call API
        req.flash('message', `Details cleared for booker '${bookerReference}'`)
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
      body('prisonerId', 'Invalid prisoner number').isLength({ min: 5, max: 10 }),
      body('visitorIds', 'Invalid visitor IDs').trim().whitelist('\\d').isLength({ min: 4, max: 100 }),
    ]
  }
}

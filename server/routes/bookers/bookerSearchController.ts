import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { BookerService } from '../../services'
import { responseErrorToFlashMessage } from '../../utils/utils'

export default class BookerSearchController {
  public constructor(private readonly bookerService: BookerService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const formValues = req.flash('formValues')?.[0] || {}

      return res.render('pages/bookers/search', { errors: req.flash('errors'), formValues })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      delete req.session.booker

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect('/bookers')
      }
      const { email }: { email: string } = req.body

      try {
        const booker = await this.bookerService.getBookerByEmail(res.locals.user.username, email)
        req.session.booker = booker
        return res.redirect('/bookers/booker-details')
      } catch (error) {
        req.flash('formValues', req.body)

        if (error.status === 404) {
          req.flash('message', { text: `No booker found with email: ${email}`, type: 'information' })
          return res.redirect('/bookers/booker/add')
        }

        req.flash('errors', responseErrorToFlashMessage(error))
        return res.redirect('/bookers')
      }
    }
  }

  public validate(): ValidationChain[] {
    return [body('email', 'Enter a valid email address').trim().isEmail()]
  }
}

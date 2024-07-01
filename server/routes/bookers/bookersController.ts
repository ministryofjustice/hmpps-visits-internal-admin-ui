import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { BookerService } from '../../services'
import { responseErrorToFlashMessage } from '../../utils/utils'

export default class BookersController {
  public constructor(private readonly bookerService: BookerService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const formValues = req.flash('formValues')?.[0] || {}

      return res.render('pages/bookers/index', { errors: req.flash('errors'), formValues })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect('/bookers')
      }
      const { email }: { email: string } = req.body

      try {
        const booker = await this.bookerService.getBookerByEmail(res.locals.user.username, email)
        return res.redirect(`/bookers/booker/${booker.reference}`)
      } catch (error) {
        if (error.status === 404) {
          return res.redirect('/bookers/booker/add')
        }

        req.flash('errors', responseErrorToFlashMessage(error))
        req.flash('formValues', req.body)
        return res.redirect('/bookers')
      }
    }
  }

  public validate(): ValidationChain[] {
    return [body('email', 'Enter a valid email address').trim().isEmail()]
  }
}

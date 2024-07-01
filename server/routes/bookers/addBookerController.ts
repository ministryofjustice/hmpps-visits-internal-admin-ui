import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { BookerService } from '../../services'
import { responseErrorToFlashMessage } from '../../utils/utils'

export default class AddBookerController {
  public constructor(private readonly bookerService: BookerService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/bookers/addBooker', {
        errors: req.flash('errors'),
        formValues: req.flash('formValues')?.[0] || {},
        message: req.flash('message')?.[0] || {},
      })
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
        const booker = await this.bookerService.createBooker(res.locals.user.username, email)
        req.session.booker = booker

        return res.redirect('/bookers/booker-details')
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
        req.flash('formValues', req.body)
        return res.redirect('/bookers/booker/add')
      }
    }
  }

  public validate(): ValidationChain[] {
    return [body('email', 'Enter a valid email address').trim().isEmail()]
  }
}

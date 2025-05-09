import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { BookerService } from '../../services'
import { responseErrorToFlashMessages } from '../../utils/utils'

export default class BookersController {
  public constructor(private readonly bookerService: BookerService) {}

  public view(action: 'search' | 'add'): RequestHandler {
    return async (req, res) => {
      return res.render('pages/bookers/bookers', {
        errors: req.flash('errors'),
        formValues: req.flash('formValues')?.[0] || {},
        messages: req.flash('messages'),
        action,
      })
    }
  }

  public search(): RequestHandler {
    return async (req, res) => {
      delete req.session.booker

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect('/bookers')
      }
      const { booker: email }: { booker: string } = req.body

      try {
        // TODO handle more than one booker record for an email address
        const booker = (await this.bookerService.getBookersByEmail(res.locals.user.username, email))[0]
        req.session.booker = booker

        return res.redirect('/bookers/booker/details')
      } catch (error) {
        req.flash('formValues', req.body)

        if (error.status === 404) {
          req.flash('messages', {
            variant: 'information',
            title: 'No booker found',
            text: `No existing booker found with email: ${email}`,
          })
          return res.redirect('/bookers/add')
        }

        req.flash('errors', responseErrorToFlashMessages(error))
        return res.redirect('/bookers')
      }
    }
  }

  public add(): RequestHandler {
    return async (req, res) => {
      delete req.session.booker

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect('/bookers/add')
      }
      const { booker: email }: { booker: string } = req.body

      try {
        const booker = await this.bookerService.createBooker(res.locals.user.username, email)
        req.session.booker = booker
        req.flash('messages', {
          variant: 'success',
          title: 'Booker record created',
          text: 'Booker record created',
        })

        return res.redirect('/bookers/booker/details')
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        req.flash('formValues', req.body)
        return res.redirect('/bookers/booker/add')
      }
    }
  }

  public validate(): ValidationChain[] {
    return [body('booker', 'Enter a valid email address').trim().isEmail()]
  }
}

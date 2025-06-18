import { RequestHandler } from 'express'
import { body, matchedData, ValidationChain, validationResult } from 'express-validator'
import validator from 'validator'
import { BookerService } from '../../services'
import { responseErrorToFlashMessages } from '../../utils/utils'
import { BOOKER_REFERENCE_REGEX } from '../../constants/constants'

export default class BookerSearchController {
  public constructor(private readonly bookerService: BookerService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/bookers/search', {
        errors: req.flash('errors'),
        formValues: req.flash('formValues')?.[0] || {},
        messages: req.flash('messages'),
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
      const { search } = matchedData<{ search: string }>(req)

      try {
        const bookers = await this.bookerService.getBookersByEmailOrReference(res.locals.user.username, search)

        if (bookers.length > 1) {
          req.session.bookerSearchResults = bookers
          return res.redirect('/bookers/search/results')
        }

        const { reference } = bookers[0]
        return res.redirect(`/bookers/booker/${reference}`)
      } catch (error) {
        req.flash('formValues', req.body)

        if (error.status === 404) {
          req.flash('messages', {
            variant: 'information',
            title: 'No booker found',
            text: `No existing booker found for: ${search}`,
          })
          return res.redirect('/bookers')
        }

        req.flash('errors', responseErrorToFlashMessages(error))
        return res.redirect('/bookers')
      }
    }
  }

  public validate(): ValidationChain[] {
    return [
      body('search')
        .trim()
        .toLowerCase()
        .custom(value => {
          if (validator.isEmail(value) || validator.matches(value, BOOKER_REFERENCE_REGEX)) {
            return true
          }
          throw new Error('Enter a valid email address or booker reference')
        }),
    ]
  }
}

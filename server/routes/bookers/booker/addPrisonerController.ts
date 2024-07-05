import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { BookerService } from '../../../services'
import { responseErrorToFlashMessage } from '../../../utils/utils'

export default class AddPrisonerController {
  public constructor(private readonly bookerService: BookerService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { booker } = req.session

      if (booker.permittedPrisoners.length >= 1) {
        req.flash('message', { text: 'This booker already has a prisoner - cannot add another', type: 'information' })
        return res.redirect('/bookers/booker/details')
      }

      return res.render('pages/bookers/booker/addPrisoner', {
        errors: req.flash('errors'),
        formValues: req.flash('formValues')?.[0] || {},
        booker,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect('/bookers/booker/add-prisoner')
      }

      const { booker } = req.session

      const { prisonerNumber }: { prisonerNumber: string } = req.body

      try {
        await this.bookerService.addPrisoner(res.locals.user.username, booker.reference, prisonerNumber)
        req.flash('message', { text: `Prisoner added`, type: 'success' })
        return res.redirect('/bookers/booker/details')
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
        req.flash('formValues', req.body)
        return res.redirect('/bookers/booker/add-prisoner')
      }
    }
  }

  public validate(): ValidationChain[] {
    return [
      body('prisonerNumber', 'Enter a valid prisoner number')
        .trim()
        .matches(/^[A-Z][0-9]{4}[A-Z]{2}$/),
    ]
  }
}

import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { BookerService, PrisonService } from '../../../services'
import { responseErrorToFlashMessage } from '../../../utils/utils'

export default class AddPrisonerController {
  public constructor(
    private readonly bookerService: BookerService,
    private readonly prisonService: PrisonService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { booker } = req.session

      if (booker.permittedPrisoners.length >= 1) {
        req.flash('message', { text: 'This booker already has a prisoner - cannot add another', type: 'information' })
        return res.redirect('/bookers/booker/details')
      }

      const prisons = await this.prisonService.getAllPrisons(res.locals.user.username)
      const prisonSelectItems = prisons.map(prison => ({ value: prison.code, text: prison.name }))

      return res.render('pages/bookers/booker/addPrisoner', {
        errors: req.flash('errors'),
        formValues: req.flash('formValues')?.[0] || {},
        booker,
        prisonSelectItems,
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

      const { prisonerNumber, prisonCode }: { prisonerNumber: string; prisonCode: string } = req.body

      try {
        await this.bookerService.addPrisoner(res.locals.user.username, booker.reference, prisonerNumber, prisonCode)
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
      body('prisonCode', 'Select a prison').matches(/^[A-Z]{3}$/),
    ]
  }
}

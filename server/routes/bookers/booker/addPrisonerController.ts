import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { BookerService, PrisonService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'
import { PRISON_NUMBER_REGEX } from '../../../constants/constants'

export default class AddPrisonerController {
  public constructor(
    private readonly bookerService: BookerService,
    private readonly prisonService: PrisonService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { reference } = req.params
      const booker = await this.bookerService.getBookerByReference(res.locals.user.username, reference)

      const hasActivePrisoner = booker.permittedPrisoners.some(prisoner => prisoner.active)
      if (hasActivePrisoner) {
        req.flash('messages', {
          variant: 'information',
          title: 'Booker has an active prisoner',
          text: 'This booker already has an active prisoner - cannot add another',
        })
        return res.redirect(`/bookers/booker/${reference}`)
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
      const { reference } = req.params
      const { prisonerNumber, prisonCode }: { prisonerNumber: string; prisonCode: string } = req.body

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(`/bookers/booker/${reference}/add-prisoner`)
      }

      try {
        await this.bookerService.addPrisoner(res.locals.user.username, reference, prisonerNumber, prisonCode)
        req.flash('messages', {
          variant: 'success',
          title: 'Prisoner added',
          text: 'Prisoner added',
        })
        return res.redirect(`/bookers/booker/${reference}`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        req.flash('formValues', req.body)
        return res.redirect(`/bookers/booker/${reference}/add-prisoner`)
      }
    }
  }

  public validate(): ValidationChain[] {
    return [
      body('prisonerNumber', 'Enter a valid prisoner number').trim().matches(PRISON_NUMBER_REGEX),
      body('prisonCode', 'Select a prison').matches(/^[A-Z]{3}$/),
    ]
  }
}

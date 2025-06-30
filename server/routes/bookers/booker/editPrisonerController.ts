import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { BookerService, PrisonService } from '../../../services'
import { responseErrorToFlashMessages } from '../../../utils/utils'

export default class EditPrisonerController {
  public constructor(
    private readonly bookerService: BookerService,
    private readonly prisonService: PrisonService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonerId, reference } = req.params

      const booker = await this.bookerService.getBookerByReference(res.locals.user.username, reference)
      const prisoner = booker.permittedPrisoners.find(permittedPrisoner => permittedPrisoner.prisonerId === prisonerId)

      if (!prisoner) {
        return res.redirect(`/bookers/booker/${reference}`)
      }

      const currentPrisonName = await this.prisonService.getPrisonName(res.locals.user.username, prisoner.prisonCode)

      const prisons = await this.prisonService.getAllPrisons(res.locals.user.username)
      const prisonSelectItems = prisons.map(prison => ({ value: prison.code, text: prison.name }))

      return res.render('pages/bookers/booker/editPrisoner', {
        errors: req.flash('errors'),
        formValues: req.flash('formValues')?.[0] || {},
        booker,
        prisoner,
        currentPrisonName,
        prisonSelectItems,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { prisonerId, reference } = req.params
      const { prisonCode }: { prisonCode: string } = req.body

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(`/bookers/booker/${reference}/prisoner/${prisonerId}/edit`)
      }

      try {
        const booker = await this.bookerService.getBookerByReference(res.locals.user.username, reference)

        await this.bookerService.updateRegisteredPrison(
          res.locals.user.username,
          booker.reference,
          prisonerId,
          prisonCode,
        )

        req.flash('messages', {
          variant: 'success',
          title: 'Prison updated',
          text: 'Prison updated',
        })
        return res.redirect(`/bookers/booker/${reference}/prisoner/${prisonerId}`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        req.flash('formValues', req.body)
        return res.redirect(`/bookers/booker/${reference}/prisoner/${prisonerId}/edit`)
      }
    }
  }

  public validate(): ValidationChain[] {
    return [body('prisonCode', 'Select a prison').matches(/^[A-Z]{3}$/)]
  }
}

import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { BookerService, PrisonService } from '../../../services'
import { responseErrorToFlashMessage } from '../../../utils/utils'

export default class EditPrisonerController {
  public constructor(
    private readonly bookerService: BookerService,
    private readonly prisonService: PrisonService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { booker } = req.session
      const prisoner = booker.permittedPrisoners[0]

      if (!prisoner) {
        return res.redirect('/bookers/booker/details')
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
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect('/bookers/booker/edit-prisoner')
      }

      const { booker } = req.session
      const prisoner = booker.permittedPrisoners[0]

      if (!prisoner) {
        return res.redirect('/bookers/booker/details')
      }

      const { prisonCode }: { prisonCode: string } = req.body

      try {
        // Update details by clearing booker's prisoner/visitor details and re-creating
        // (temporary implementation, pending user registration journey)
        await this.bookerService.clearBookerDetails(res.locals.user.username, booker.reference)

        await this.bookerService.addPrisoner(
          res.locals.user.username,
          booker.reference,
          prisoner.prisonerId,
          prisonCode,
        )

        // defaults to creating 'active' so check if necessary to deactivate
        if (!prisoner.active) {
          await this.bookerService.deactivatePrisoner(res.locals.user.username, booker.reference, prisoner.prisonerId)
        }

        prisoner.permittedVisitors.forEach(async visitor => {
          await this.bookerService.addVisitor(
            res.locals.user.username,
            booker.reference,
            prisoner.prisonerId,
            visitor.visitorId,
          )
          // defaults to creating 'active' so check if necessary to deactivate
          if (!visitor.active) {
            await this.bookerService.deactivateVisitor(
              res.locals.user.username,
              booker.reference,
              prisoner.prisonerId,
              visitor.visitorId,
            )
          }
        })

        // clear session and re-load data
        delete req.session.booker
        req.session.booker = await this.bookerService.getBookerByEmail(res.locals.user.username, booker.email)

        req.flash('message', { text: `Prison updated`, type: 'success' })
        return res.redirect('/bookers/booker/details')
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
        req.flash('formValues', req.body)
        return res.redirect('/bookers/booker/edit-prisoner')
      }
    }
  }

  public validate(): ValidationChain[] {
    return [body('prisonCode', 'Select a prison').matches(/^[A-Z]{3}$/)]
  }
}

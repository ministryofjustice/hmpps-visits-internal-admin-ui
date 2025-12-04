import { RequestHandler } from 'express'
import { BookerService, PrisonService } from '../../../services'

export default class BookerPrisonerDetailsController {
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

      const prisonName =
        prisoner && (await this.prisonService.getPrisonName(res.locals.user.username, prisoner.prisonCode))

      return res.render('pages/bookers/booker/bookerPrisonerDetails', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        booker,
        prisoner,
        prisonName,
      })
    }
  }
}

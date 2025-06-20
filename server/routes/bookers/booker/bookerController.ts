import { RequestHandler } from 'express'
import { BookerService, PrisonService } from '../../../services'

export default class BookerController {
  public constructor(
    private readonly bookerService: BookerService,
    private readonly prisonService: PrisonService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { reference } = req.params
      const backLinkHref = req.query.from === 'search-results' ? '/bookers/search/results' : '/bookers'

      const [booker, prisonNames] = await Promise.all([
        this.bookerService.getBookerByReference(res.locals.user.username, reference),
        this.prisonService.getPrisonNames(res.locals.user.username),
      ])

      return res.render('pages/bookers/booker/booker', {
        messages: req.flash('messages'),
        backLinkHref,
        booker,
        prisonNames,
      })
    }
  }

  public clear(): RequestHandler {
    return async (req, res) => {
      const { reference } = req.params

      await this.bookerService.clearBookerDetails(res.locals.user.username, reference)

      req.flash('messages', {
        variant: 'success',
        title: 'Booker details cleared',
        text: 'Booker details have been cleared',
      })

      return res.redirect(`/bookers/booker/${reference}`)
    }
  }
}

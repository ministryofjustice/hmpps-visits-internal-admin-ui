import { RequestHandler } from 'express'
import { BookerService } from '../../../services'

export default class BookerDetailsController {
  public constructor(private readonly bookerService: BookerService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { booker } = req.session

      if (!booker) {
        return res.redirect('/bookers')
      }

      return res.render('pages/bookers/booker/bookerDetails', { message: req.flash('message')?.[0] || {}, booker })
    }
  }

  public clear(): RequestHandler {
    return async (req, res) => {
      const { booker } = req.session

      if (!booker) {
        return res.redirect('/bookers')
      }

      req.session.booker = await this.bookerService.clearBookerDetails(res.locals.user.username, booker.reference)
      req.flash('message', { text: 'Booker details have been cleared', type: 'success' })

      return res.redirect('/bookers/booker/details')
    }
  }
}

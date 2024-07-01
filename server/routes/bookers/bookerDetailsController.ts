import { RequestHandler } from 'express'
import { BookerService } from '../../services'

export default class BookerDetailsController {
  public constructor(private readonly bookerService: BookerService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { booker } = req.session

      if (!booker) {
        return res.redirect('/bookers')
      }

      return res.render('pages/bookers/bookerDetails', { booker })
    }
  }
}

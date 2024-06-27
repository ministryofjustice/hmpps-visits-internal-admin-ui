import { RequestHandler } from 'express'

export default class BookersController {
  public constructor() {}

  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/bookers/index')
    }
  }
}

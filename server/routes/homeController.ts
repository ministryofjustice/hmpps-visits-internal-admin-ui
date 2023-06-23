import type { RequestHandler } from 'express'

export default class HomeController {
  public view(): RequestHandler {
    return async (req, res) => {
      res.render('pages/home')
    }
  }
}

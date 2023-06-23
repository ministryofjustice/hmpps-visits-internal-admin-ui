import { RequestHandler } from 'express'
import { PrisonService } from '../../../services'

export default class ExclusionDatesController {
  public constructor(private readonly prisonService: PrisonService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      return res.send('NOT IMPLEMENTED')
    }
  }
}

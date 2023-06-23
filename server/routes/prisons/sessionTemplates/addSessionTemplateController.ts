import { RequestHandler } from 'express'
import { SessionTemplateService } from '../../../services'

export default class AddSessionTemplateController {
  public constructor(private readonly sessionTemplateService: SessionTemplateService) {}

  public add(): RequestHandler {
    return async (req, res) => {
      return res.send('NOT IMPLEMENTED')
    }
  }
}

import { RequestHandler } from 'express'
import { PrisonService, LocationGroupService } from '../../../services'

export default class SingleLocationGroupController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly locationGroupService: LocationGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const locationGroup = await this.locationGroupService.getSingleLocationGroup(res.locals.user.username, reference)

      return res.render('pages/prisons/locationGroups/viewSingleLocationGroup', { prison, locationGroup })
    }
  }
}

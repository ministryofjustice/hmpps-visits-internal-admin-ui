import { RequestHandler } from 'express'
import { PrisonService, LocationGroupsService } from '../../../services'

export default class LocationGroupsController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly locationGroupsService: LocationGroupsService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const { prison, prisonName } = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const locationGroups = await this.locationGroupsService.getLocationGroups(res.locals.user.username, prisonId)
      return res.render('pages/prisons/locationGroups/viewLocationGroups', {
        prison,
        prisonName,
        locationGroups,
      })
    }
  }
}

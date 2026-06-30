import { RequestHandler } from 'express'
import { PrisonService, LocationGroupService } from '../../../services'
import { PrisonParams } from '../../../@types/requestParameterTypes'

export default class LocationGroupsController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly locationGroupService: LocationGroupService,
  ) {}

  public view(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params

      const prison = await this.prisonService.getPrison(prisonId)
      const locationGroups = await this.locationGroupService.getLocationGroups(prisonId)

      return res.render('pages/prisons/locationGroups/viewLocationGroups', {
        prison,
        locationGroups,
        messages: req.flash('messages'),
      })
    }
  }
}

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

      return res.render('pages/prisons/locationGroups/viewSingleLocationGroup', {
        prison,
        locationGroup,
        message: req.flash('message'),
      })
    }
  }

  public delete(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params

      try {
        await this.locationGroupService.deleteLocationGroup(res.locals.user.username, reference)
        req.flash('message', `Location group with reference ${reference} deleted.`)
      } catch (error) {
        req.flash('errors', [{ msg: `Failed to delete location group with reference - ${reference}` }])
        return res.redirect(`/prisons/${prisonId}/location-groups/${reference}`)
      }

      return res.redirect(`/prisons/${prisonId}/location-groups`)
    }
  }
}

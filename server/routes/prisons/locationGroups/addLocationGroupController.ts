import { RequestHandler } from 'express'
import { PrisonService, LocationGroupService } from '../../../services'
import { CreateLocationGroupDto } from '../../../data/visitSchedulerApiTypes'

export default class AddLocationGroupController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly locationGroupService: LocationGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const { prisonName } = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const formValues = req.flash('formValues')?.[0] || {}

      res.render('pages/prisons/locationGroups/addLocationGroup', {
        errors: req.flash('errors'),
        prisonId,
        prisonName,
        formValues,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/session-templates/add`

      const createSessionTemplateDto: CreateLocationGroupDto = {
        name: 'location name',
        prisonId,
        locations: [
          {
            levelOneCode: 'C',
            levelTwoCode: '0',
            levelThreeCode: '0',
            levelFourCode: '1',
          },
        ],
      }

      try {
        const { reference } = await this.locationGroupService.createLocationGroup(
          res.locals.user.username,
          createSessionTemplateDto,
        )
        req.flash('message', `Location group '${reference}' has been created`)
        return res.redirect(`/prisons/${prisonId}/location-groups/${reference}`)
      } catch (error) {
        req.flash('errors', [{ msg: `${error.status} ${error.message}` }])
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }
    }
  }
}

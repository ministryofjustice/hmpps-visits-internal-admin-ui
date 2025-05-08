import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { PrisonService, LocationGroupService } from '../../../services'
import { LocationGroup, UpdateLocationGroupDto } from '../../../data/visitSchedulerApiTypes'
import { responseErrorToFlashMessages } from '../../../utils/utils'

export default class EditLocationGroupController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly locationGroupService: LocationGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const locationGroup = await this.locationGroupService.getSingleLocationGroup(res.locals.user.username, reference)

      res.render('pages/prisons/locationGroups/editLocationGroup', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        locationGroup,
        prison,
      })
    }
  }

  public update(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/location-groups/${reference}/edit`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        return res.redirect(originalUrl)
      }

      // empty location levels come through as empty strings so need to be removed
      type LocationLevels = LocationGroup['locations'][number]
      const locations: LocationLevels[] = []
      req.body.location.forEach((location: LocationLevels) => {
        const sanitisedLocation: LocationLevels = Object.fromEntries(
          Object.entries(location).filter(e => e[1] !== ''),
        ) as LocationLevels

        locations.push(sanitisedLocation)
      })

      const updateLocationGroupDto: UpdateLocationGroupDto = {
        name: req.body.name,
        locations,
      }

      try {
        const { name } = await this.locationGroupService.updateLocationGroup(
          res.locals.user.username,
          reference,
          updateLocationGroupDto,
        )
        req.flash('messages', {
          variant: 'success',
          title: 'Location group updated',
          text: `Location group '${name}' has been updated`,
        })
        return res.redirect(`/prisons/${prisonId}/location-groups/${reference}`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }
    }
  }

  public validate(): ValidationChain[] {
    return [
      body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Enter a name between 3 and 100 characters long'),
      // ensure locations array exists and at least one item
      body('location', 'At least one location level is required').isArray({ min: 1 }),
      // max char limit for all levels
      body('location[*].*', 'Max 5 characters for level code').trim().isLength({ max: 5 }),
      // must have level one
      body('location[*].levelOneCode', 'Level one code required').notEmpty(),
      // level two required if level three/four set
      body('location[*].levelTwoCode', 'Level two code required')
        .if((_value, { path, req }) => {
          const locationRowId = path.split(/(\d+)/)[1] // i.e. 'location[X].levelTwoCode' => 'X'
          return (
            req.body?.location[locationRowId]?.levelThreeCode !== '' ||
            req.body?.location[locationRowId]?.levelFourCode !== ''
          )
        })
        .notEmpty(),
      // level three required if level four set
      body('location[*].levelThreeCode', 'Level three code required')
        .if((_value, { path, req }) => {
          const locationRowId = path.split(/(\d+)/)[1]
          return req.body?.location[locationRowId]?.levelFourCode !== ''
        })
        .notEmpty(),
    ]
  }
}

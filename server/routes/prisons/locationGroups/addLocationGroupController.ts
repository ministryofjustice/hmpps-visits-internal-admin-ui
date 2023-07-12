import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
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

      const originalUrl = `/prisons/${prisonId}/location-groups/add`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

      const createLocationGroupDto: CreateLocationGroupDto = {
        name: req.body.name,
        prisonId,
        locations: req.body.location,
      }

      try {
        const { reference } = await this.locationGroupService.createLocationGroup(
          res.locals.user.username,
          createLocationGroupDto,
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

  public validate(): ValidationChain[] {
    return [
      body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Enter a name between 3 and 100 characters long'),
      body('location[*].levelOneCode')
        .trim()
        .isLength({ min: 1, max: 5 })
        .withMessage('Enter a level one code with length 1 to 5 for each row, or remove the row'),
      body('location[*].levelTwoCode')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 1, max: 5 })
        .withMessage('Enter a value with length 1 to 5, for level two'),
      body('location[*].levelThreeCode')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 1, max: 5 })
        .withMessage('Enter a value with length 1 to 5, for level three'),
      body('location[*].levelFourCode')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 1, max: 5 })
        .withMessage('Enter a value with length 1 to 5, for level four'),
    ]
  }
}

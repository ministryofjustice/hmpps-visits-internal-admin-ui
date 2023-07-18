import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { PrisonService, IncentiveGroupService } from '../../../services'
import { CreateIncentiveGroupDto } from '../../../data/visitSchedulerApiTypes'
import incentiveLevels from '../../../constants/incentiveLevels'

export default class AddIncentiveGroupController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly incentiveGroupService: IncentiveGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const formValues = req.flash('formValues')?.[0] || {}

      res.render('pages/prisons/incentiveGroups/addIncentiveGroup', {
        errors: req.flash('errors'),
        prison,
        formValues,
        incentiveLevels,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/incentive-groups/add`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

      const createIncentiveGroupDto: CreateIncentiveGroupDto = {
        name: req.body.name,
        prisonId,
        incentiveLevels: req.body.incentiveLevels,
      }

      try {
        const { reference } = await this.incentiveGroupService.createIncentiveGroup(
          res.locals.user.username,
          createIncentiveGroupDto,
        )
        req.flash('message', `Location group '${reference}' has been created`)
        return res.redirect(`/prisons/${prisonId}/incentive-groups/${reference}`)
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
    ]
  }
}
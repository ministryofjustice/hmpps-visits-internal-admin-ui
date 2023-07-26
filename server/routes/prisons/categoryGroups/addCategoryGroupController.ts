import { RequestHandler } from 'express'
import { ValidationChain, body, validationResult } from 'express-validator'
import { PrisonService, CategoryGroupService } from '../../../services'
import { CreateCategoryGroupDto } from '../../../data/visitSchedulerApiTypes'
import prisonerCategories from '../../../constants/prisonerCategories'
import { responseErrorToFlashMessage } from '../../../utils/utils'

export default class AddCategoryGroupController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly categoryGroupService: CategoryGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const formValues = req.flash('formValues')?.[0] || {}

      res.render('pages/prisons/categoryGroups/addCategoryGroup', {
        errors: req.flash('errors'),
        prison,
        formValues,
        prisonerCategories,
      })
    }
  }

  public submit(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const originalUrl = `/prisons/${prisonId}/category-groups/add`

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }

      const createCategoryGroupDto: CreateCategoryGroupDto = {
        categories: req.body.prisonerCategories,
        name: req.body.name,
        prisonId,
      }
      try {
        const { name, reference } = await this.categoryGroupService.createCategoryGroup(
          res.locals.user.username,
          createCategoryGroupDto,
        )

        req.flash('message', `Category group '${name}' has been created`)
        return res.redirect(`/prisons/${prisonId}/category-groups/${reference}`)
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessage(error))
        req.flash('formValues', req.body)
        return res.redirect(originalUrl)
      }
    }
  }

  public validate(): ValidationChain[] {
    return [
      body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Enter a name between 3 and 100 characters long'),
      body('prisonerCategories')
        .toArray()
        .isArray({ min: 1 })
        .withMessage('Select at least one option')
        .bail()
        .isIn(Object.keys(prisonerCategories))
        .withMessage('Invalid value entered'),
    ]
  }
}

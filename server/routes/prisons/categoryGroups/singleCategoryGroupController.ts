import { RequestHandler } from 'express'
import { PrisonService, CategoryGroupService } from '../../../services'
import prisonerCategories from '../../../constants/prisonerCategories'
import { responseErrorToFlashMessages } from '../../../utils/utils'

export default class SingleCategoryGroupController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly categoryGroupService: CategoryGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params
      const { sessionTemplateRef } = req.query

      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const categoryGroup = await this.categoryGroupService.getSingleCategoryGroup(res.locals.user.username, reference)
      const categoryGroupValues = categoryGroup.categories.map(category => prisonerCategories[category])

      return res.render('pages/prisons/categoryGroups/viewSingleCategoryGroup', {
        errors: req.flash('errors'),
        prison,
        categoryGroup,
        categoryGroupValues,
        sessionTemplateRef,
        messages: req.flash('messages'),
      })
    }
  }

  public delete(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params

      try {
        const { name } = await this.categoryGroupService.getSingleCategoryGroup(res.locals.user.username, reference)
        await this.categoryGroupService.deleteCategoryGroup(res.locals.user.username, reference)
        req.flash('messages', {
          variant: 'success',
          title: 'Category group deleted',
          text: `Category group '${name}' has been deleted`,
        })
      } catch (error) {
        req.flash('errors', responseErrorToFlashMessages(error))
        return res.redirect(`/prisons/${prisonId}/category-groups/${reference}`)
      }

      return res.redirect(`/prisons/${prisonId}/category-groups`)
    }
  }
}

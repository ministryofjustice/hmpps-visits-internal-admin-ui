import { RequestHandler } from 'express'
import { PrisonService, CategoryGroupService } from '../../../services'

export default class SingleCategoryGroupController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly categoryGroupService: CategoryGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params
      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)

      const categoryGroup = await this.categoryGroupService.getSingleCategoryGroup(res.locals.user.username, reference)

      return res.render('pages/prisons/categoryGroups/viewSingleCategoryGroup', {
        errors: req.flash('errors'),
        prison,
        categoryGroup,
        message: req.flash('message'),
      })
    }
  }

  public delete(): RequestHandler {
    return async (req, res) => {
      const { reference, prisonId } = req.params

      try {
        await this.categoryGroupService.deleteCategoryGroup(res.locals.user.username, reference)
        req.flash('message', `Category group with reference ${reference} deleted.`)
      } catch (error) {
        req.flash('errors', [{ msg: `Failed to delete category group with reference - ${reference}` }])
        return res.redirect(`/prisons/${prisonId}/category-groups/${reference}`)
      }

      return res.redirect(`/prisons/${prisonId}/category-groups`)
    }
  }
}

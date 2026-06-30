import { RequestHandler } from 'express'
import { CategoryGroupService, PrisonService } from '../../../services'
import prisonerCategories from '../../../constants/prisonerCategories'
import { PrisonParams } from '../../../@types/requestParameterTypes'

export default class CategoryGroupsController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly categoryGroupService: CategoryGroupService,
  ) {}

  public view(): RequestHandler<PrisonParams> {
    return async (req, res) => {
      const { prisonId } = req.params

      const prison = await this.prisonService.getPrison(prisonId)
      const rawCategoryGroups = await this.categoryGroupService.getCategoryGroups(prisonId)
      const categoryGroups = rawCategoryGroups.map(group => {
        return {
          ...group,
          categories: group.categories.map(category => prisonerCategories[category]),
        }
      })

      return res.render('pages/prisons/categoryGroups/viewCategoryGroups', {
        prison,
        categoryGroups,
        messages: req.flash('messages'),
      })
    }
  }
}

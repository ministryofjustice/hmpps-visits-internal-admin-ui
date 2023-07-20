import { RequestHandler } from 'express'
import { CategoryGroupService, PrisonService } from '../../../services'

export default class CategoryGroupsController {
  public constructor(
    private readonly prisonService: PrisonService,
    private readonly categoryGroupService: CategoryGroupService,
  ) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonId } = req.params

      const prison = await this.prisonService.getPrison(res.locals.user.username, prisonId)
      const categoryGroups = await this.categoryGroupService.getCategoryGroups(res.locals.user.username, prisonId)

      return res.render('pages/prisons/categoryGroups/viewCategoryGroups', {
        prison,
        categoryGroups,
        message: req.flash('message'),
      })
    }
  }
}

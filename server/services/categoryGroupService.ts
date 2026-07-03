import { VisitSchedulerApiClient } from '../data'
import { CategoryGroup, CreateCategoryGroupDto } from '../data/visitSchedulerApiTypes'
import logger from '../../logger'

export default class CategoryGroupService {
  constructor(private readonly visitSchedulerApiClient: VisitSchedulerApiClient) {}

  async getSingleCategoryGroup(reference: string): Promise<CategoryGroup> {
    return this.visitSchedulerApiClient.getSingleCategoryGroup(reference)
  }

  async getCategoryGroups(prisonCode: string): Promise<CategoryGroup[]> {
    return this.visitSchedulerApiClient.getCategoryGroups(prisonCode)
  }

  async createCategoryGroup(username: string, createCategoryGrupDto: CreateCategoryGroupDto): Promise<CategoryGroup> {
    const categoryGroup = await this.visitSchedulerApiClient.createCategoryGroup(createCategoryGrupDto)
    logger.info(
      `Category group '${categoryGroup.reference}' created for prison '${createCategoryGrupDto.prisonId}' by '${username}'`,
    )
    return categoryGroup
  }

  async deleteCategoryGroup(username: string, reference: string): Promise<void> {
    logger.info(`Category group '${reference}' deleted by '${username}'`)
    return this.visitSchedulerApiClient.deleteCategoryGroup(reference)
  }
}

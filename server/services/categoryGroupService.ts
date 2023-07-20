import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import { CategoryGroup, CreateCategoryGroupDto } from '../data/visitSchedulerApiTypes'
import logger from '../../logger'

export default class CategoryGroupService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getSingleCategoryGroup(username: string, reference: string): Promise<CategoryGroup> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getSingleCategoryGroup(reference)
  }

  async getCategoryGroups(username: string, prisonCode: string): Promise<CategoryGroup[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getCategoryGroups(prisonCode)
  }

  async createCategoryGroup(username: string, createCategoryGrupDto: CreateCategoryGroupDto): Promise<CategoryGroup> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    const categoryGroup = await visitSchedulerApiClient.createCategoryGroup(createCategoryGrupDto)
    logger.info(
      `New category group '${categoryGroup.reference}' created for prison '${createCategoryGrupDto.prisonId}'`,
    )
    return categoryGroup
  }

  async deleteCategoryGroup(username: string, reference: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.deleteCategoryGroup(reference)
  }
}

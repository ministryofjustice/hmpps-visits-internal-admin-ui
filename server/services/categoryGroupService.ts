import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import { CategoryGroup } from '../data/visitSchedulerApiTypes'

export default class CategoryGroupService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getCategoryGroups(username: string, prisonCode: string): Promise<CategoryGroup[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getCategoryGroups(prisonCode)
  }
}

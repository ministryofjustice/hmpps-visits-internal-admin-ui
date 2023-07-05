import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import { IncentiveLevelGroup } from '../data/visitSchedulerApiTypes'

export default class IncentiveLevelGroupService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getIncentiveLevelGroups(username: string, prisonCode: string): Promise<IncentiveLevelGroup[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getIncentiveLevelGroups(prisonCode)
  }
}

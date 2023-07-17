import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import { IncentiveLevelGroup } from '../data/visitSchedulerApiTypes'

export default class IncentiveGroupService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getSingleIncentiveGroup(username: string, reference: string): Promise<IncentiveLevelGroup> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getSingleIncentiveGroup(reference)
  }

  async getIncentiveGroups(username: string, prisonCode: string): Promise<IncentiveLevelGroup[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getIncentiveGroups(prisonCode)
  }

  async deleteIncentiveGroup(username: string, reference: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.deleteIncentiveGroup(reference)
  }
}

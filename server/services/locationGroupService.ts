import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import { LocationGroup } from '../data/visitSchedulerApiTypes'

export default class LocationGroupService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getLocationGroups(username: string, prisonCode: string): Promise<LocationGroup[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getLocationGroups(prisonCode)
  }
}

import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import { SessionLocationGroup } from '../data/visitSchedulerApiTypes'

export default class LocationGroupsService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getLocationGroups(username: string, prisonCode: string): Promise<SessionLocationGroup> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getLocationGroups(prisonCode)
  }
}

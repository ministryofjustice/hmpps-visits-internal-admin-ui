import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import { SessionTemplate } from '../data/visitSchedulerApiTypes'

export default class SessionTemplateService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getSessionTemplates(username: string, prisonCode: string): Promise<SessionTemplate[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getSessionTemplates(prisonCode)
  }
}

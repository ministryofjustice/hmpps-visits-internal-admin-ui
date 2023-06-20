import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import { SessionTemplate, SessionTemplatesRangeType } from '../data/visitSchedulerApiTypes'

export default class SessionTemplateService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getSessionTemplates(
    username: string,
    prisonCode: string,
    rangeType: SessionTemplatesRangeType,
  ): Promise<SessionTemplate[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getSessionTemplates(prisonCode, rangeType)
  }

  async getSingleSessionTemplate(username: string, reference: string): Promise<SessionTemplate> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getSingleSessionTemplate(reference)
  }
}

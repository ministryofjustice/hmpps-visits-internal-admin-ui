import logger from '../../logger'
import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import { CreateSessionTemplateDto, SessionTemplate, SessionTemplatesRangeType } from '../data/visitSchedulerApiTypes'

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

  async createSessionTemplate(username: string, sessionTemplate: CreateSessionTemplateDto): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Adding session template ${sessionTemplate.name} to prison ${sessionTemplate.prisonId}`)
    await visitSchedulerApiClient.createSessionTemplate(sessionTemplate)
  }
}

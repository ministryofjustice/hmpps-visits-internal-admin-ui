import logger from '../../logger'
import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import { CreateIncentiveGroupDto, IncentiveLevelGroup } from '../data/visitSchedulerApiTypes'

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

  async createIncentiveGroup(
    username: string,
    createIncentiveGrupDto: CreateIncentiveGroupDto,
  ): Promise<IncentiveLevelGroup> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    const incentiveGroup = await visitSchedulerApiClient.createIncentiveGroup(createIncentiveGrupDto)
    logger.info(
      `Incentive level group '${incentiveGroup.reference}' created for prison '${createIncentiveGrupDto.prisonId}' by ${username}`,
    )
    return incentiveGroup
  }

  async deleteIncentiveGroup(username: string, reference: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Incentive level group '${reference}' deleted by ${username}`)
    return visitSchedulerApiClient.deleteIncentiveGroup(reference)
  }
}

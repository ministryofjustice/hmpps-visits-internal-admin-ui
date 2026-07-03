import logger from '../../logger'
import { VisitSchedulerApiClient } from '../data'
import { CreateIncentiveGroupDto, IncentiveGroup } from '../data/visitSchedulerApiTypes'

export default class IncentiveGroupService {
  constructor(private readonly visitSchedulerApiClient: VisitSchedulerApiClient) {}

  async getSingleIncentiveGroup(reference: string): Promise<IncentiveGroup> {
    return this.visitSchedulerApiClient.getSingleIncentiveGroup(reference)
  }

  async getIncentiveGroups(prisonCode: string): Promise<IncentiveGroup[]> {
    return this.visitSchedulerApiClient.getIncentiveGroups(prisonCode)
  }

  async createIncentiveGroup(
    username: string,
    createIncentiveGrupDto: CreateIncentiveGroupDto,
  ): Promise<IncentiveGroup> {
    const incentiveGroup = await this.visitSchedulerApiClient.createIncentiveGroup(createIncentiveGrupDto)
    logger.info(
      `Incentive level group '${incentiveGroup.reference}' created for prison '${createIncentiveGrupDto.prisonId}' by ${username}`,
    )
    return incentiveGroup
  }

  async deleteIncentiveGroup(username: string, reference: string): Promise<void> {
    logger.info(`Incentive level group '${reference}' deleted by ${username}`)
    return this.visitSchedulerApiClient.deleteIncentiveGroup(reference)
  }
}

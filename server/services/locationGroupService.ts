import logger from '../../logger'
import { RestClientBuilder, VisitSchedulerApiClient, HmppsAuthClient } from '../data'
import { LocationGroup, CreateLocationGroupDto } from '../data/visitSchedulerApiTypes'

export default class LocationGroupService {
  constructor(
    private readonly visitSchedulerApiClientFactory: RestClientBuilder<VisitSchedulerApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getSingleLocationGroup(username: string, reference: string): Promise<LocationGroup> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getSingleLocationGroup(reference)
  }

  async getLocationGroups(username: string, prisonCode: string): Promise<LocationGroup[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    return visitSchedulerApiClient.getLocationGroups(prisonCode)
  }

  async createLocationGroup(username: string, createLocationGroupDto: CreateLocationGroupDto): Promise<LocationGroup> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    const locationGroup = await visitSchedulerApiClient.createLocationGroup(createLocationGroupDto)
    logger.info(
      `Location group '${locationGroup.reference}' created for prison '${createLocationGroupDto.prisonId}' by ${username}`,
    )
    return locationGroup
  }

  async deleteLocationGroup(username: string, reference: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const visitSchedulerApiClient = this.visitSchedulerApiClientFactory(token)

    logger.info(`Location group '${reference}' deleted by ${username}`)
    return visitSchedulerApiClient.deleteLocationGroup(reference)
  }
}

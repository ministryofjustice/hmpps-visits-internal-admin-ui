import logger from '../../logger'
import { VisitSchedulerApiClient } from '../data'
import { LocationGroup, CreateLocationGroupDto, UpdateLocationGroupDto } from '../data/visitSchedulerApiTypes'

export default class LocationGroupService {
  constructor(private readonly visitSchedulerApiClient: VisitSchedulerApiClient) {}

  async getSingleLocationGroup(reference: string): Promise<LocationGroup> {
    return this.visitSchedulerApiClient.getSingleLocationGroup(reference)
  }

  async getLocationGroups(prisonCode: string): Promise<LocationGroup[]> {
    return this.visitSchedulerApiClient.getLocationGroups(prisonCode)
  }

  async createLocationGroup(username: string, createLocationGroupDto: CreateLocationGroupDto): Promise<LocationGroup> {
    const locationGroup = await this.visitSchedulerApiClient.createLocationGroup(createLocationGroupDto)
    logger.info(
      `Location group '${locationGroup.reference}' created for prison '${createLocationGroupDto.prisonId}' by ${username}`,
    )
    return locationGroup
  }

  async updateLocationGroup(
    username: string,
    reference: string,
    updateLocationGroupDto: UpdateLocationGroupDto,
  ): Promise<LocationGroup> {
    const locationGroup = await this.visitSchedulerApiClient.updateLocationGroup(reference, updateLocationGroupDto)
    logger.info(`Location group '${locationGroup.reference}' updated by ${username}`)
    return locationGroup
  }

  async deleteLocationGroup(username: string, reference: string): Promise<void> {
    logger.info(`Location group '${reference}' deleted by ${username}`)
    return this.visitSchedulerApiClient.deleteLocationGroup(reference)
  }
}

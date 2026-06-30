import logger from '../../logger'
import { BookerRegistryApiClient } from '../data'
import { BookerDto, PermittedPrisonerDto } from '../data/bookerRegistryApiTypes'

export default class BookerService {
  constructor(private readonly bookerRegistryApiClient: BookerRegistryApiClient) {}

  // Booker

  async getBookerByReference(reference: string): Promise<BookerDto> {
    return this.bookerRegistryApiClient.getBookerByReference(reference)
  }

  async getBookersByEmailOrReference(search: string): Promise<BookerDto[]> {
    const isEmail = search.indexOf('@') >= 0

    const bookers = isEmail
      ? await this.bookerRegistryApiClient.getBookersByEmail(search)
      : [await this.bookerRegistryApiClient.getBookerByReference(search)]

    return bookers
  }

  async clearBookerDetails(username: string, bookerReference: string): Promise<BookerDto> {
    const booker = await this.bookerRegistryApiClient.clearBookerDetails(bookerReference)
    logger.info(`Booker ${bookerReference} cleared by ${username}`)
    return booker
  }

  // Prisoner

  async addPrisoner(
    username: string,
    bookerReference: string,
    prisonerId: string,
    prisonCode: string,
  ): Promise<PermittedPrisonerDto> {
    const permittedPrisonerDto = await this.bookerRegistryApiClient.addPrisoner(bookerReference, prisonerId, prisonCode)
    logger.info(`Prisoner ${prisonerId} with prison ${prisonCode} added to booker ${bookerReference} by ${username}`)
    return permittedPrisonerDto
  }

  async updateRegisteredPrison(
    username: string,
    bookerReference: string,
    prisonerId: string,
    newPrisonCode: string,
  ): Promise<void> {
    await this.bookerRegistryApiClient.updateRegisteredPrison(bookerReference, prisonerId, newPrisonCode)
    logger.info(
      `Prisoner ${prisonerId} prison changed to ${newPrisonCode} for booker ${bookerReference} by ${username}`,
    )
  }
}

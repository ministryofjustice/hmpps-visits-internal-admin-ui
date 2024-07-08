import logger from '../../logger'
import { BookerRegistryApiClient, HmppsAuthClient, RestClientBuilder } from '../data'
import { BookerDto, PermittedPrisonerDto } from '../data/bookerRegistryApiTypes'

export default class BookerService {
  constructor(
    private readonly bookerRegistryApiClientFactory: RestClientBuilder<BookerRegistryApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  // Booker

  async createBooker(username: string, email: string): Promise<BookerDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    const booker = await bookerRegistryApiClient.createBooker(email)
    logger.info(`Booker ${booker.reference} for ${email} created by ${username}`)
    return booker
  }

  async getBookerByEmail(username: string, email: string): Promise<BookerDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    return bookerRegistryApiClient.getBookerByEmail(email)
  }

  async clearBookerDetails(username: string, bookerReference: string): Promise<BookerDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    const booker = await bookerRegistryApiClient.clearBookerDetails(bookerReference)
    logger.info(`Booker ${bookerReference} cleared by ${username}`)
    return booker
  }

  // Prisoner

  async addPrisoner(username: string, bookerReference: string, prisonerId: string): Promise<PermittedPrisonerDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    const permittedPrisonerDto = await bookerRegistryApiClient.addPrisoner(bookerReference, prisonerId)
    logger.info(`Prisoner ${prisonerId} added to booker ${bookerReference} by ${username}`)
    return permittedPrisonerDto
  }

  async activatePrisoner(username: string, bookerReference: string, prisonerId: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    await bookerRegistryApiClient.activatePrisoner(bookerReference, prisonerId)
    logger.info(`Prisoner ${prisonerId} activated for booker ${bookerReference} by ${username}`)
  }

  async deactivatePrisoner(username: string, bookerReference: string, prisonerId: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    await bookerRegistryApiClient.deactivatePrisoner(bookerReference, prisonerId)
    logger.info(`Prisoner ${prisonerId} deactivated for booker ${bookerReference} by ${username}`)
  }

  // Visitor

  async addVisitor(username: string, bookerReference: string, prisonerId: string, visitorId: number): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    await bookerRegistryApiClient.addVisitor(bookerReference, prisonerId, visitorId)
    logger.info(`Visitor ${visitorId} added for prisoner ${prisonerId} and booker ${bookerReference} by ${username}`)
  }

  async activateVisitor(
    username: string,
    bookerReference: string,
    prisonerId: string,
    visitorId: number,
  ): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    await bookerRegistryApiClient.activateVisitor(bookerReference, prisonerId, visitorId)
    logger.info(
      `Visitor ${visitorId} activated for prisoner ${prisonerId} and booker ${bookerReference} by ${username}`,
    )
  }

  async deactivateVisitor(
    username: string,
    bookerReference: string,
    prisonerId: string,
    visitorId: number,
  ): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    await bookerRegistryApiClient.deactivateVisitor(bookerReference, prisonerId, visitorId)
    logger.info(
      `Visitor ${visitorId} deactivated for prisoner ${prisonerId} and booker ${bookerReference} by ${username}`,
    )
  }
}

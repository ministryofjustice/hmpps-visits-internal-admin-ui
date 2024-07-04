import { BookerRegistryApiClient, HmppsAuthClient, RestClientBuilder } from '../data'
import { BookerDto, PermittedPrisonerDto } from '../data/bookerRegistryApiTypes'

export default class BookerService {
  constructor(
    private readonly bookerRegistryApiClientFactory: RestClientBuilder<BookerRegistryApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async createBooker(username: string, email: string): Promise<BookerDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    return bookerRegistryApiClient.createBooker(email)
  }

  async addPrisoner(username: string, bookerReference: string, prisonerId: string): Promise<PermittedPrisonerDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    return bookerRegistryApiClient.addPrisoner(bookerReference, prisonerId)
  }

  async activatePrisoner(username: string, bookerReference: string, prisonerId: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    await bookerRegistryApiClient.activatePrisoner(bookerReference, prisonerId)
  }

  async deactivatePrisoner(username: string, bookerReference: string, prisonerId: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    await bookerRegistryApiClient.deactivatePrisoner(bookerReference, prisonerId)
  }

  async getBookerByEmail(username: string, email: string): Promise<BookerDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    return bookerRegistryApiClient.getBookerByEmail(email)
  }

  async clearBookerDetails(username: string, bookerReference: string): Promise<BookerDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    return bookerRegistryApiClient.clearBookerDetails(bookerReference)
  }
}

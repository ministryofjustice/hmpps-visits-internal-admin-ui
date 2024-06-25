import { BookerRegistryApiClient, HmppsAuthClient, RestClientBuilder } from '../data'
import { BookerDto } from '../data/bookerRegistryApiTypes'

export default class BookerService {
  constructor(
    private readonly bookerRegistryApiClientFactory: RestClientBuilder<BookerRegistryApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async clearBookerDetails(username: string, bookerReference: string): Promise<BookerDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    return bookerRegistryApiClient.clearBookerDetails(bookerReference)
  }

  async updateBookerDetails(
    username: string,
    bookerEmail: string,
    prisonerId: string,
    visitorIds: number[],
  ): Promise<BookerDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    return bookerRegistryApiClient.updateBookerDetails(bookerEmail, prisonerId, visitorIds)
  }
}

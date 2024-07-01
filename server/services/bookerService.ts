import { BookerRegistryApiClient, HmppsAuthClient, RestClientBuilder } from '../data'
import { BookerDto } from '../data/bookerRegistryApiTypes'

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

  async getBookerByEmail(username: string, email: string): Promise<BookerDto> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const bookerRegistryApiClient = this.bookerRegistryApiClientFactory(token)

    return bookerRegistryApiClient.getBookerByEmail(email)
  }
}

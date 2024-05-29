import RestClient from './restClient'
import config from '../config'
import { BookerDto, CreateBookerDto } from './bookerRegistryApiTypes'

export default class BookerRegistryApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bookerRegistryApiClient', config.apis.bookerRegistry, token)
  }

  async clearBookerDetails(bookerReference: string): Promise<BookerDto> {
    return this.restClient.delete({ path: `/public/booker/config/${bookerReference}` })
  }

  async updateBookerDetails(bookerEmail: string, prisonerId: string, visitorIds: number[]): Promise<BookerDto> {
    return this.restClient.put({
      path: '/public/booker/config',
      data: <CreateBookerDto>{
        email: bookerEmail,
        permittedPrisoners: [
          {
            prisonerId,
            visitorIds,
          },
        ],
      },
    })
  }
}

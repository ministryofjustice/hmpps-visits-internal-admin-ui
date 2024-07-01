import RestClient from './restClient'
import config from '../config'
import { BookerDto, CreateBookerDto } from './bookerRegistryApiTypes'

export default class BookerRegistryApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bookerRegistryApiClient', config.apis.bookerRegistry, token)
  }

  async createBooker(email: string): Promise<BookerDto> {
    return this.restClient.put({ path: '/public/booker/config', data: <CreateBookerDto>{ email } })
  }

  async getBookerByEmail(email: string): Promise<BookerDto> {
    return this.restClient.get({ path: `/public/booker/config/email/${email}` })
  }
}

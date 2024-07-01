import RestClient from './restClient'
import config from '../config'
import { BookerDto } from './bookerRegistryApiTypes'

export default class BookerRegistryApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bookerRegistryApiClient', config.apis.bookerRegistry, token)
  }

  async getBookerByEmail(email: string): Promise<BookerDto> {
    return this.restClient.get({ path: `/public/booker/config/email/${email}` })
  }
}

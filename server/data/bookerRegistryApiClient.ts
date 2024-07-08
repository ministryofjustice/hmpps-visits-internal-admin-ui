import RestClient from './restClient'
import config from '../config'
import {
  BookerDto,
  CreateBookerDto,
  CreatePermittedPrisonerDto,
  CreatePermittedVisitorDto,
  PermittedPrisonerDto,
} from './bookerRegistryApiTypes'

export default class BookerRegistryApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bookerRegistryApiClient', config.apis.bookerRegistry, token)
  }

  // Booker

  async createBooker(email: string): Promise<BookerDto> {
    return this.restClient.put({ path: '/public/booker/config', data: <CreateBookerDto>{ email } })
  }

  async getBookerByEmail(email: string): Promise<BookerDto> {
    return this.restClient.get({ path: `/public/booker/config/email/${email}` })
  }

  async clearBookerDetails(bookerReference: string): Promise<BookerDto> {
    return this.restClient.delete({ path: `/public/booker/config/${bookerReference}` })
  }

  // Prisoner

  async addPrisoner(bookerReference: string, prisonerId: string): Promise<PermittedPrisonerDto> {
    return this.restClient.put({
      path: `/public/booker/config/${bookerReference}/prisoner`,
      data: <CreatePermittedPrisonerDto>{ prisonerId, active: true },
    })
  }

  async activatePrisoner(bookerReference: string, prisonerId: string): Promise<void> {
    await this.restClient.put({ path: `/public/booker/config/${bookerReference}/prisoner/${prisonerId}/activate` })
  }

  async deactivatePrisoner(bookerReference: string, prisonerId: string): Promise<void> {
    await this.restClient.put({ path: `/public/booker/config/${bookerReference}/prisoner/${prisonerId}/deactivate` })
  }

  // Visitor

  async addVisitor(bookerReference: string, prisonerId: string, visitorId: number): Promise<void> {
    return this.restClient.put({
      path: `/public/booker/config/${bookerReference}/prisoner/${prisonerId}/visitor`,
      data: <CreatePermittedVisitorDto>{ visitorId, active: true },
    })
  }

  async activateVisitor(bookerReference: string, prisonerId: string, visitorId: number): Promise<void> {
    await this.restClient.put({
      path: `/public/booker/config/${bookerReference}/prisoner/${prisonerId}/visitor/${visitorId}/activate`,
    })
  }

  async deactivateVisitor(bookerReference: string, prisonerId: string, visitorId: number): Promise<void> {
    await this.restClient.put({
      path: `/public/booker/config/${bookerReference}/prisoner/${prisonerId}/visitor/${visitorId}/deactivate`,
    })
  }
}

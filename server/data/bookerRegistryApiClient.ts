import RestClient from './restClient'
import config from '../config'
import {
  BookerDto,
  CreatePermittedPrisonerDto,
  CreatePermittedVisitorDto,
  PermittedPrisonerDto,
  UpdateRegisteredPrisonersPrisonDto,
} from './bookerRegistryApiTypes'

export default class BookerRegistryApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bookerRegistryApiClient', config.apis.bookerRegistry, token)
  }

  // Booker

  async getBookerByReference(reference: string): Promise<BookerDto> {
    return this.restClient.get({ path: `/public/booker/config/${reference}` })
  }

  async getBookersByEmail(email: string): Promise<BookerDto[]> {
    return this.restClient.post({ path: '/public/booker/config/search', data: { email } })
  }

  async clearBookerDetails(bookerReference: string): Promise<BookerDto> {
    return this.restClient.delete({ path: `/public/booker/config/${bookerReference}` })
  }

  // Prisoner

  async addPrisoner(bookerReference: string, prisonerId: string, prisonCode: string): Promise<PermittedPrisonerDto> {
    return this.restClient.put({
      path: `/public/booker/config/${bookerReference}/prisoner`,
      data: <CreatePermittedPrisonerDto>{ prisonerId, active: true, prisonCode },
    })
  }

  async updateRegisteredPrison(bookerReference: string, prisonerId: string, newPrisonCode: string): Promise<void> {
    await this.restClient.put({
      path: `/public/booker/config/${bookerReference}/prisoner/${prisonerId}/prison`,
      data: <UpdateRegisteredPrisonersPrisonDto>{ prisonId: newPrisonCode },
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

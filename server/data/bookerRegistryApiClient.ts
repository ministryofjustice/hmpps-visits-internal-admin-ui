import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import {
  BookerDto,
  CreatePermittedPrisonerDto,
  PermittedPrisonerDto,
  UpdateRegisteredPrisonersPrisonDto,
} from './bookerRegistryApiTypes'

export default class BookerRegistryApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Booker Registry API', config.apis.bookerRegistry, logger, authenticationClient)
  }

  // Booker

  async getBookerByReference(reference: string): Promise<BookerDto> {
    return this.get({ path: `/public/booker/config/${reference}` }, asSystem())
  }

  async getBookersByEmail(email: string): Promise<BookerDto[]> {
    return this.post({ path: '/public/booker/config/search', data: { email } }, asSystem())
  }

  async clearBookerDetails(bookerReference: string): Promise<BookerDto> {
    return this.delete({ path: `/public/booker/config/${bookerReference}` }, asSystem())
  }

  // Prisoner

  async addPrisoner(bookerReference: string, prisonerId: string, prisonCode: string): Promise<PermittedPrisonerDto> {
    return this.put(
      {
        path: `/public/booker/config/${bookerReference}/prisoner`,
        data: <CreatePermittedPrisonerDto>{ prisonerId, prisonCode },
      },
      asSystem(),
    )
  }

  async updateRegisteredPrison(bookerReference: string, prisonerId: string, newPrisonCode: string): Promise<void> {
    await this.put(
      {
        path: `/public/booker/config/${bookerReference}/prisoner/${prisonerId}/prison`,
        data: <UpdateRegisteredPrisonersPrisonDto>{ prisonId: newPrisonCode },
      },
      asSystem(),
    )
  }
}

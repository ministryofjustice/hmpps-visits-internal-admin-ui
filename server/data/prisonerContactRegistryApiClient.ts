import RestClient from './restClient'
import config from '../config'
import { ContactDto } from './prisonerContactRegistryApiTypes'

export default class PrisonerContactRegistryApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('prisonerContactRegistryApiClient', config.apis.prisonerContactRegistry, token)
  }

  async getSocialContacts({
    prisonerId,
    approvedOnly,
  }: {
    prisonerId: string
    approvedOnly: boolean
  }): Promise<ContactDto[]> {
    return this.restClient.get({
      path: `/prisoners/${prisonerId}/contacts/social`,
      query: new URLSearchParams({
        approvedVisitorsOnly: approvedOnly.toString(),
        hasDateOfBirth: 'true',
        withAddress: 'false',
      }).toString(),
    })
  }
}

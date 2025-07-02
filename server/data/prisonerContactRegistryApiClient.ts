import RestClient from './restClient'
import config from '../config'
import { ContactDto } from './prisonerContactRegistryApiTypes'

export default class PrisonerContactRegistryApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('prisonerContactRegistryApiClient', config.apis.prisonerContactRegistry, token)
  }

  async getAllSocialContacts(prisonerId: string): Promise<ContactDto[]> {
    return this.restClient.get({
      path: `/v2/prisoners/${prisonerId}/contacts/social`,
      query: new URLSearchParams({
        hasDateOfBirth: 'false',
        withAddress: 'false',
      }).toString(),
    })
  }

  async getApprovedSocialContacts(prisonerId: string): Promise<ContactDto[]> {
    return this.restClient.get({
      path: `/v2/prisoners/${prisonerId}/contacts/social/approved`,
      query: new URLSearchParams({
        hasDateOfBirth: 'false',
        withAddress: 'false',
      }).toString(),
    })
  }
}

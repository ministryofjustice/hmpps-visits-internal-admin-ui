import { HmppsAuthClient, PrisonerContactRegistryApiClient, RestClientBuilder } from '../data'
import { ContactDto } from '../data/prisonerContactRegistryApiTypes'

export default class PrisonerContactsService {
  constructor(
    private readonly prisonerContactRegistryApiClientFactory: RestClientBuilder<PrisonerContactRegistryApiClient>,
    private readonly hmppsAuthClient: HmppsAuthClient,
  ) {}

  async getSocialContacts({
    username,
    prisonerId,
    approvedOnly,
  }: {
    username: string
    prisonerId: string
    approvedOnly: boolean
  }): Promise<ContactDto[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const prisonerContactRegistryApiClient = this.prisonerContactRegistryApiClientFactory(token)

    return prisonerContactRegistryApiClient.getSocialContacts({ prisonerId, approvedOnly })
  }
}

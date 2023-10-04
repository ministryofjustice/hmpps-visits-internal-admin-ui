import RestClient from './restClient'
import config from '../config'
import { PrisonRegisterPrison } from './prisonRegisterApiTypes'
import { PrisonContactDetails } from '../@types/visits-admin'

export default class PrisonRegisterApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('prisonRegisterApiClient', config.apis.prisonRegister, token)
  }

  async getPrisons(): Promise<PrisonRegisterPrison[]> {
    return this.restClient.get({ path: '/prisons' })
  }

  // will need to add prisonId
  async getPrisonContactDetails(): Promise<PrisonContactDetails> {
    const information = {
      email: 'HMPPS-prison-visits@hewell.gov.uk',
      phone: '',
      website: 'https://www.gov.uk/guidance/hewell-prison',
    }
    return information
  }
}

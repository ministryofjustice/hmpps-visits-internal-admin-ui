import RestClient from './restClient'
import config from '../config'
import { PrisonRegisterPrison } from './prisonRegisterApiTypes'

export default class PrisonRegisterApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('prisonRegisterApiClient', config.apis.prisonRegister, token)
  }

  async getPrisons(): Promise<PrisonRegisterPrison[]> {
    return this.restClient.get({ path: '/prisons' })
  }
}

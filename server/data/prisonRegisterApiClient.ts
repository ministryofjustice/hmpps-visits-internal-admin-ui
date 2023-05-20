import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import { Prison } from './prisonRegisterApiTypes'

export default class PrisonRegisterApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('prisonRegisterApiClient', config.apis.prisonRegister as ApiConfig, token)
  }

  async getPrisons(): Promise<Prison[]> {
    return this.restClient.get({ path: '/prisons' })
  }
}

import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class VisitSchedulerApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('visitSchedulerApiClient', config.apis.visitScheduler as ApiConfig, token)
  }

  async getSupportedPrisonIds(): Promise<string[]> {
    return this.restClient.get({
      path: '/config/prisons/supported',
    })
  }
}

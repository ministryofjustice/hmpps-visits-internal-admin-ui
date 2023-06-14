import RestClient from './restClient'
import config from '../config'
import { Prison } from './visitSchedulerApiTypes'

export default class VisitSchedulerApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('visitSchedulerApiClient', config.apis.visitScheduler, token)
  }

  async getAllPrisons(): Promise<Prison[]> {
    return this.restClient.get({
      path: '/admin/prisons',
    })
  }

  async getPrison(prisonId: string): Promise<Prison> {
    return this.restClient.get({
      path: `/admin/prisons/prison/${prisonId}`,
    })
  }

  async createPrison(prison: Prison): Promise<Prison> {
    return this.restClient.post({
      path: '/admin/prisons/prison',
      data: <Prison>{
        active: prison.active,
        code: prison.code,
        excludeDates: prison.excludeDates,
      },
    })
  }

  async activatePrison(prisonCode: string): Promise<Prison> {
    return this.restClient.put({
      path: `/admin/prisons/prison/${prisonCode}/activate`,
    })
  }

  async deactivatePrison(prisonCode: string): Promise<Prison> {
    return this.restClient.put({
      path: `/admin/prisons/prison/${prisonCode}/deactivate`,
    })
  }
}

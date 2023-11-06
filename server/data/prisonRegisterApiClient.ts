import RestClient from './restClient'
import config from '../config'
import { PrisonContactDetails, PrisonName } from './prisonRegisterApiTypes'

export default class PrisonRegisterApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('prisonRegisterApiClient', config.apis.prisonRegister, token)
  }

  async getPrisonNames(): Promise<PrisonName[]> {
    return this.restClient.get({ path: '/prisons/names' })
  }

  async getPrisonContactDetails(prisonId: string): Promise<PrisonContactDetails | null> {
    try {
      return await this.restClient.get({
        path: `/secure/prisons/id/${prisonId}/department/contact-details`,
        query: new URLSearchParams({
          departmentType: 'SOCIAL_VISIT',
        }).toString(),
      })
    } catch (error) {
      if (error.status === 404) {
        return null
      }
      throw error
    }
  }

  async createPrisonContactDetails(
    prisonId: string,
    prisonContactDetails: PrisonContactDetails,
  ): Promise<PrisonContactDetails> {
    return this.restClient.post({
      path: `/secure/prisons/id/${prisonId}/department/contact-details`,
      data: prisonContactDetails,
    })
  }

  async deletePrisonContactDetails(prisonId: string): Promise<void> {
    return this.restClient.delete({
      path: `/secure/prisons/id/${prisonId}/department/contact-details`,
      query: new URLSearchParams({
        departmentType: 'SOCIAL_VISIT',
      }).toString(),
    })
  }

  async updatePrisonContactDetails(
    prisonId: string,
    prisonContactDetails: PrisonContactDetails,
  ): Promise<PrisonContactDetails> {
    return this.restClient.put({
      path: `/secure/prisons/id/${prisonId}/department/contact-details?removeIfNull=true`,
      data: prisonContactDetails,
    })
  }
}

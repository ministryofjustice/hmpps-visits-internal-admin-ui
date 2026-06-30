import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { PrisonContactDetails, PrisonName } from './prisonRegisterApiTypes'

export default class PrisonRegisterApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prison Register API', config.apis.prisonRegister, logger, authenticationClient)
  }

  async getPrisonNames(): Promise<PrisonName[]> {
    return this.get({ path: '/prisons/names' }, asSystem())
  }

  async getPrisonContactDetails(prisonId: string): Promise<PrisonContactDetails | null> {
    try {
      return await this.get(
        {
          path: `/secure/prisons/id/${prisonId}/department/contact-details`,
          query: new URLSearchParams({
            departmentType: 'SOCIAL_VISIT',
          }).toString(),
        },
        asSystem(),
      )
    } catch (error) {
      if (error.responseStatus === 404) {
        return null
      }
      throw error
    }
  }

  async createPrisonContactDetails(
    prisonId: string,
    prisonContactDetails: PrisonContactDetails,
  ): Promise<PrisonContactDetails> {
    return this.post(
      {
        path: `/secure/prisons/id/${prisonId}/department/contact-details`,
        data: prisonContactDetails,
      },
      asSystem(),
    )
  }

  async deletePrisonContactDetails(prisonId: string): Promise<void> {
    return this.delete(
      {
        path: `/secure/prisons/id/${prisonId}/department/contact-details`,
        query: new URLSearchParams({
          departmentType: 'SOCIAL_VISIT',
        }).toString(),
      },
      asSystem(),
    )
  }

  async updatePrisonContactDetails(
    prisonId: string,
    prisonContactDetails: PrisonContactDetails,
  ): Promise<PrisonContactDetails> {
    return this.put(
      {
        path: `/secure/prisons/id/${prisonId}/department/contact-details?removeIfNull=true`,
        data: prisonContactDetails,
      },
      asSystem(),
    )
  }
}

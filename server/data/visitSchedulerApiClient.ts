import RestClient from './restClient'
import config from '../config'
import {
  CreateSessionTemplateDto,
  Prison,
  CategoryGroup,
  LocationGroup,
  SessionTemplate,
  SessionTemplatesRangeType,
  IncentiveLevelGroup,
} from './visitSchedulerApiTypes'

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

  // Session template
  async getSessionTemplates(prisonCode: string, rangeType: SessionTemplatesRangeType): Promise<SessionTemplate[]> {
    return this.restClient.get({
      path: `/admin/session-templates`,
      query: new URLSearchParams({
        prisonCode,
        rangeType,
      }).toString(),
    })
  }

  async getSingleSessionTemplate(reference: string): Promise<SessionTemplate> {
    return this.restClient.get({
      path: `/admin/session-templates/template/${reference}`,
    })
  }

  async activateSessionTemplate(reference: string): Promise<SessionTemplate> {
    return this.restClient.put({
      path: `/admin/session-templates/template/${reference}/activate`,
    })
  }

  async deactivateSessionTemplate(reference: string): Promise<SessionTemplate> {
    return this.restClient.put({
      path: `/admin/session-templates/template/${reference}/deactivate`,
    })
  }

  async deleteSessionTemplate(reference: string): Promise<void> {
    return this.restClient.delete({
      path: `/admin/session-templates/template/${reference}`,
    })
  }

  async createSessionTemplate(createSessionTemplateDto: CreateSessionTemplateDto): Promise<SessionTemplate> {
    return this.restClient.post({
      path: `/admin/session-templates/template`,
      data: createSessionTemplateDto,
    })
  }

  // Location groups
  async getLocationGroups(prisonCode: string): Promise<LocationGroup[]> {
    return this.restClient.get({
      path: `/admin/location-groups/${prisonCode}`,
    })
  }

  // Category groups
  async getCategoryGroups(prisonCode: string): Promise<CategoryGroup[]> {
    return this.restClient.get({
      path: `/admin/category-groups/${prisonCode}`,
    })
  }

  // Incentive level groups
  async getIncentiveLevelGroups(prisonCode: string): Promise<IncentiveLevelGroup[]> {
    return this.restClient.get({
      path: `/admin/incentive-groups/${prisonCode}`,
    })
  }
}

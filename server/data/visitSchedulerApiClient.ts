import RestClient from './restClient'
import config from '../config'
import {
  CreateSessionTemplateDto,
  PrisonDto,
  CategoryGroup,
  LocationGroup,
  SessionTemplate,
  SessionTemplatesRangeType,
  IncentiveLevelGroup,
  CreateLocationGroupDto,
} from './visitSchedulerApiTypes'

export default class VisitSchedulerApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('visitSchedulerApiClient', config.apis.visitScheduler, token)
  }

  async getAllPrisons(): Promise<PrisonDto[]> {
    return this.restClient.get({
      path: '/admin/prisons',
    })
  }

  async getPrison(prisonId: string): Promise<PrisonDto> {
    return this.restClient.get({
      path: `/admin/prisons/prison/${prisonId}`,
    })
  }

  async createPrison(prison: PrisonDto): Promise<PrisonDto> {
    return this.restClient.post({
      path: '/admin/prisons/prison',
      data: <PrisonDto>{
        active: prison.active,
        code: prison.code,
        excludeDates: prison.excludeDates,
      },
    })
  }

  async activatePrison(prisonCode: string): Promise<PrisonDto> {
    return this.restClient.put({
      path: `/admin/prisons/prison/${prisonCode}/activate`,
    })
  }

  async deactivatePrison(prisonCode: string): Promise<PrisonDto> {
    return this.restClient.put({
      path: `/admin/prisons/prison/${prisonCode}/deactivate`,
    })
  }

  async addExcludeDate(prisonCode: string, excludeDate: string): Promise<PrisonDto> {
    return this.restClient.put({
      path: `/admin/prisons/prison/${prisonCode}/exclude-date/add`,
      data: {
        excludeDate,
      },
    })
  }

  async removeExcludeDate(prisonCode: string, excludeDate: string): Promise<void> {
    await this.restClient.put({
      path: `/admin/prisons/prison/${prisonCode}/exclude-date/remove`,
      data: {
        excludeDate,
      },
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
  async getSingleLocationGroup(reference: string): Promise<LocationGroup> {
    return this.restClient.get({
      path: `/admin/location-groups/group/${reference}`,
    })
  }

  async getLocationGroups(prisonCode: string): Promise<LocationGroup[]> {
    return this.restClient.get({
      path: `/admin/location-groups/${prisonCode}`,
    })
  }

  async createLocationGroup(createLocationGroupDto: CreateLocationGroupDto): Promise<LocationGroup> {
    return this.restClient.post({
      path: `/admin/location-groups/group`,
      data: createLocationGroupDto,
    })
  }

  async deleteLocationGroup(reference: string): Promise<void> {
    return this.restClient.delete({
      path: `/admin/location-groups/group/${reference}`,
    })
  }

  // Category groups
  async getCategoryGroups(prisonCode: string): Promise<CategoryGroup[]> {
    return this.restClient.get({
      path: `/admin/category-groups/${prisonCode}`,
    })
  }

  // Incentive level groups
  async getSingleIncentiveGroup(reference: string): Promise<IncentiveLevelGroup> {
    return this.restClient.get({
      path: `/admin/incentive-groups/group/${reference}`,
    })
  }

  async getIncentiveGroups(prisonCode: string): Promise<IncentiveLevelGroup[]> {
    return this.restClient.get({
      path: `/admin/incentive-groups/${prisonCode}`,
    })
  }

  async deleteIncentiveGroup(reference: string): Promise<void> {
    return this.restClient.delete({
      path: `/admin/incentive-groups/group/group/${reference}`,
    })
  }
}

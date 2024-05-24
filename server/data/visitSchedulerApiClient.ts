import RestClient from './restClient'
import config from '../config'
import {
  CreateSessionTemplateDto,
  PrisonDto,
  CategoryGroup,
  LocationGroup,
  SessionTemplate,
  SessionTemplatesRangeType,
  IncentiveGroup,
  CreateLocationGroupDto,
  CreateIncentiveGroupDto,
  CreateCategoryGroupDto,
  UpdateSessionTemplateDto,
  RequestSessionTemplateVisitStatsDto,
  SessionTemplateVisitStatsDto,
  PageVisitDto,
  UpdatePrisonDto,
  PrisonUserClientType,
  PrisonUserClientDto,
} from './visitSchedulerApiTypes'

export default class VisitSchedulerApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('visitSchedulerApiClient', config.apis.visitScheduler, token)
  }

  async getBookedVisitsByDate(prisonId: string, date: string): Promise<PageVisitDto> {
    return this.restClient.get({
      path: `/visits/search`,
      query: new URLSearchParams({
        prisonId,
        visitStartDate: date,
        visitEndDate: date,
        visitStatus: 'BOOKED',
        page: '0',
        size: '1000',
      }).toString(),
    })
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
        adultAgeYears: prison.adultAgeYears,
        clients: prison.clients,
        code: prison.code,
        excludeDates: prison.excludeDates,
        maxAdultVisitors: prison.maxAdultVisitors,
        maxChildVisitors: prison.maxChildVisitors,
        maxTotalVisitors: prison.maxTotalVisitors,
        policyNoticeDaysMin: prison.policyNoticeDaysMin,
        policyNoticeDaysMax: prison.policyNoticeDaysMax,
      },
    })
  }

  async updatePrison(prisonCode: string, updatePrison: UpdatePrisonDto): Promise<PrisonDto> {
    return this.restClient.put({
      path: `/admin/prisons/prison/${prisonCode}`,
      data: <UpdatePrisonDto>{
        adultAgeYears: updatePrison.adultAgeYears,
        maxAdultVisitors: updatePrison.maxAdultVisitors,
        maxChildVisitors: updatePrison.maxChildVisitors,
        maxTotalVisitors: updatePrison.maxTotalVisitors,
        policyNoticeDaysMin: updatePrison.policyNoticeDaysMin,
        policyNoticeDaysMax: updatePrison.policyNoticeDaysMax,
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

  async activatePrisonClientType(prisonCode: string, type: PrisonUserClientType): Promise<PrisonUserClientDto> {
    return this.restClient.put({
      path: `/admin/prisons/prison/${prisonCode}/client/${type}/activate`,
    })
  }

  async deactivatePrisonClientType(prisonCode: string, type: PrisonUserClientType): Promise<PrisonUserClientDto> {
    return this.restClient.put({
      path: `/admin/prisons/prison/${prisonCode}/client/${type}/deactivate`,
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

  async updateSessionTemplate(
    reference: string,
    updateSessionTemplateDto: UpdateSessionTemplateDto,
  ): Promise<SessionTemplate> {
    return this.restClient.put({
      path: `/admin/session-templates/template/${reference}`,
      data: updateSessionTemplateDto,
    })
  }

  async getTemplateStats(
    requestVisitStatsDto: RequestSessionTemplateVisitStatsDto,
    reference: string,
  ): Promise<SessionTemplateVisitStatsDto> {
    return this.restClient.post({
      path: `/admin/session-templates/template/${reference}/stats`,
      data: requestVisitStatsDto,
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
  async getSingleCategoryGroup(reference: string): Promise<CategoryGroup> {
    return this.restClient.get({
      path: `/admin/category-groups/group/${reference}`,
    })
  }

  async getCategoryGroups(prisonCode: string): Promise<CategoryGroup[]> {
    return this.restClient.get({
      path: `/admin/category-groups/${prisonCode}`,
    })
  }

  async createCategoryGroup(createCategoryGroupDto: CreateCategoryGroupDto): Promise<CategoryGroup> {
    return this.restClient.post({
      path: `/admin/category-groups/group`,
      data: createCategoryGroupDto,
    })
  }

  async deleteCategoryGroup(reference: string): Promise<void> {
    return this.restClient.delete({
      path: `/admin/category-groups/group/${reference}`,
    })
  }

  // Incentive level groups
  async getSingleIncentiveGroup(reference: string): Promise<IncentiveGroup> {
    return this.restClient.get({
      path: `/admin/incentive-groups/group/${reference}`,
    })
  }

  async getIncentiveGroups(prisonCode: string): Promise<IncentiveGroup[]> {
    return this.restClient.get({
      path: `/admin/incentive-groups/${prisonCode}`,
    })
  }

  async createIncentiveGroup(createIncentiveGroupDto: CreateIncentiveGroupDto): Promise<IncentiveGroup> {
    return this.restClient.post({
      path: `/admin/incentive-groups/group`,
      data: createIncentiveGroupDto,
    })
  }

  async deleteIncentiveGroup(reference: string): Promise<void> {
    return this.restClient.delete({
      path: `/admin/incentive-groups/group/${reference}`,
    })
  }
}

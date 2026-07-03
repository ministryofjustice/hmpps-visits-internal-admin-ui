import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
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
  UserClientType,
  UserClientDto,
  ExcludeDateDto,
  UpdateLocationGroupDto,
} from './visitSchedulerApiTypes'

export default class VisitSchedulerApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Visit Scheduler API', config.apis.visitScheduler, logger, authenticationClient)
  }

  async getBookedVisitsByDate(prisonId: string, date: string): Promise<PageVisitDto> {
    return this.get(
      {
        path: `/visits/search`,
        query: new URLSearchParams({
          prisonId,
          visitStartDate: date,
          visitEndDate: date,
          visitStatus: 'BOOKED',
          page: '0',
          size: '1000',
        }).toString(),
      },
      asSystem(),
    )
  }

  async getAllPrisons(): Promise<PrisonDto[]> {
    return this.get(
      {
        path: '/admin/prisons',
      },
      asSystem(),
    )
  }

  async getPrison(prisonId: string): Promise<PrisonDto> {
    return this.get(
      {
        path: `/admin/prisons/prison/${prisonId}`,
      },
      asSystem(),
    )
  }

  async createPrison(prison: PrisonDto): Promise<PrisonDto> {
    return this.post(
      {
        path: '/admin/prisons/prison',
        data: <PrisonDto>{
          active: prison.active,
          adultAgeYears: prison.adultAgeYears,
          clients: prison.clients,
          code: prison.code,
          maxAdultVisitors: prison.maxAdultVisitors,
          maxChildVisitors: prison.maxChildVisitors,
          maxTotalVisitors: prison.maxTotalVisitors,
          policyNoticeDaysMin: prison.policyNoticeDaysMin,
          policyNoticeDaysMax: prison.policyNoticeDaysMax,
        },
      },
      asSystem(),
    )
  }

  async updatePrison(prisonCode: string, updatePrison: UpdatePrisonDto): Promise<PrisonDto> {
    return this.put(
      {
        path: `/admin/prisons/prison/${prisonCode}`,
        data: <UpdatePrisonDto>{
          adultAgeYears: updatePrison.adultAgeYears,
          maxAdultVisitors: updatePrison.maxAdultVisitors,
          maxChildVisitors: updatePrison.maxChildVisitors,
          maxTotalVisitors: updatePrison.maxTotalVisitors,
          policyNoticeDaysMin: updatePrison.policyNoticeDaysMin,
          policyNoticeDaysMax: updatePrison.policyNoticeDaysMax,
        },
      },
      asSystem(),
    )
  }

  async activatePrison(prisonCode: string): Promise<PrisonDto> {
    return this.put(
      {
        path: `/admin/prisons/prison/${prisonCode}/activate`,
      },
      asSystem(),
    )
  }

  async deactivatePrison(prisonCode: string): Promise<PrisonDto> {
    return this.put(
      {
        path: `/admin/prisons/prison/${prisonCode}/deactivate`,
      },
      asSystem(),
    )
  }

  async activatePrisonClientType(prisonCode: string, type: UserClientType): Promise<UserClientDto> {
    return this.put(
      {
        path: `/admin/prisons/prison/${prisonCode}/client/${type}/activate`,
      },
      asSystem(),
    )
  }

  async deactivatePrisonClientType(prisonCode: string, type: UserClientType): Promise<UserClientDto> {
    return this.put(
      {
        path: `/admin/prisons/prison/${prisonCode}/client/${type}/deactivate`,
      },
      asSystem(),
    )
  }

  async getExcludeDates(prisonCode: string): Promise<ExcludeDateDto[]> {
    return this.get(
      {
        path: `/prisons/prison/${prisonCode}/exclude-date`,
      },
      asSystem(),
    )
  }

  async addExcludeDate(prisonCode: string, excludeDate: string, username: string): Promise<void> {
    return this.put(
      {
        path: `/prisons/prison/${prisonCode}/exclude-date/add`,
        data: {
          excludeDate,
          actionedBy: username,
        },
      },
      asSystem(),
    )
  }

  async removeExcludeDate(prisonCode: string, excludeDate: string, username: string): Promise<void> {
    await this.put(
      {
        path: `/prisons/prison/${prisonCode}/exclude-date/remove`,
        data: {
          excludeDate,
          actionedBy: username,
        },
      },
      asSystem(),
    )
  }

  // Session template
  async getSessionTemplates(prisonCode: string, rangeType: SessionTemplatesRangeType): Promise<SessionTemplate[]> {
    return this.get(
      {
        path: `/admin/session-templates`,
        query: new URLSearchParams({
          prisonCode,
          rangeType,
        }).toString(),
      },
      asSystem(),
    )
  }

  async getSingleSessionTemplate(reference: string): Promise<SessionTemplate> {
    return this.get(
      {
        path: `/admin/session-templates/template/${reference}`,
      },
      asSystem(),
    )
  }

  async activateSessionTemplate(reference: string): Promise<SessionTemplate> {
    return this.put(
      {
        path: `/admin/session-templates/template/${reference}/activate`,
      },
      asSystem(),
    )
  }

  async deactivateSessionTemplate(reference: string): Promise<SessionTemplate> {
    return this.put(
      {
        path: `/admin/session-templates/template/${reference}/deactivate`,
      },
      asSystem(),
    )
  }

  async deleteSessionTemplate(reference: string): Promise<void> {
    return this.delete(
      {
        path: `/admin/session-templates/template/${reference}`,
      },
      asSystem(),
    )
  }

  async createSessionTemplate(createSessionTemplateDto: CreateSessionTemplateDto): Promise<SessionTemplate> {
    return this.post(
      {
        path: `/admin/session-templates/template`,
        data: createSessionTemplateDto,
      },
      asSystem(),
    )
  }

  async updateSessionTemplate(
    reference: string,
    updateSessionTemplateDto: UpdateSessionTemplateDto,
    validateRequest: boolean,
  ): Promise<SessionTemplate> {
    return this.put(
      {
        path: `/admin/session-templates/template/${reference}`,
        data: updateSessionTemplateDto,
        query: new URLSearchParams({
          validateRequest: validateRequest.toString(),
        }).toString(),
      },
      asSystem(),
    )
  }

  async getTemplateStats(
    requestVisitStatsDto: RequestSessionTemplateVisitStatsDto,
    reference: string,
  ): Promise<SessionTemplateVisitStatsDto> {
    return this.post(
      {
        path: `/admin/session-templates/template/${reference}/stats`,
        data: requestVisitStatsDto,
      },
      asSystem(),
    )
  }

  // Location groups
  async getSingleLocationGroup(reference: string): Promise<LocationGroup> {
    return this.get(
      {
        path: `/admin/location-groups/group/${reference}`,
      },
      asSystem(),
    )
  }

  async getLocationGroups(prisonCode: string): Promise<LocationGroup[]> {
    return this.get(
      {
        path: `/admin/location-groups/${prisonCode}`,
      },
      asSystem(),
    )
  }

  async createLocationGroup(createLocationGroupDto: CreateLocationGroupDto): Promise<LocationGroup> {
    return this.post(
      {
        path: `/admin/location-groups/group`,
        data: createLocationGroupDto,
      },
      asSystem(),
    )
  }

  async updateLocationGroup(reference: string, updateLocationGroupDto: UpdateLocationGroupDto): Promise<LocationGroup> {
    return this.put(
      {
        path: `/admin/location-groups/group/${reference}`,
        data: updateLocationGroupDto,
      },
      asSystem(),
    )
  }

  async deleteLocationGroup(reference: string): Promise<void> {
    return this.delete(
      {
        path: `/admin/location-groups/group/${reference}`,
      },
      asSystem(),
    )
  }

  // Category groups
  async getSingleCategoryGroup(reference: string): Promise<CategoryGroup> {
    return this.get(
      {
        path: `/admin/category-groups/group/${reference}`,
      },
      asSystem(),
    )
  }

  async getCategoryGroups(prisonCode: string): Promise<CategoryGroup[]> {
    return this.get(
      {
        path: `/admin/category-groups/${prisonCode}`,
      },
      asSystem(),
    )
  }

  async createCategoryGroup(createCategoryGroupDto: CreateCategoryGroupDto): Promise<CategoryGroup> {
    return this.post(
      {
        path: `/admin/category-groups/group`,
        data: createCategoryGroupDto,
      },
      asSystem(),
    )
  }

  async deleteCategoryGroup(reference: string): Promise<void> {
    return this.delete(
      {
        path: `/admin/category-groups/group/${reference}`,
      },
      asSystem(),
    )
  }

  // Incentive level groups
  async getSingleIncentiveGroup(reference: string): Promise<IncentiveGroup> {
    return this.get(
      {
        path: `/admin/incentive-groups/group/${reference}`,
      },
      asSystem(),
    )
  }

  async getIncentiveGroups(prisonCode: string): Promise<IncentiveGroup[]> {
    return this.get(
      {
        path: `/admin/incentive-groups/${prisonCode}`,
      },
      asSystem(),
    )
  }

  async createIncentiveGroup(createIncentiveGroupDto: CreateIncentiveGroupDto): Promise<IncentiveGroup> {
    return this.post(
      {
        path: `/admin/incentive-groups/group`,
        data: createIncentiveGroupDto,
      },
      asSystem(),
    )
  }

  async deleteIncentiveGroup(reference: string): Promise<void> {
    return this.delete(
      {
        path: `/admin/incentive-groups/group/${reference}`,
      },
      asSystem(),
    )
  }
}

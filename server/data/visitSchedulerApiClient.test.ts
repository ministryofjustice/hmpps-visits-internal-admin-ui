import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import VisitSchedulerApiClient from './visitSchedulerApiClient'
import TestData from '../routes/testutils/testData'
import {
  CreateCategoryGroupDto,
  CreateIncentiveGroupDto,
  CreateLocationGroupDto,
  CreateSessionTemplateDto,
  PrisonDto,
  UserClientDto,
  UserClientType,
  RequestSessionTemplateVisitStatsDto,
  UpdateLocationGroupDto,
  UpdatePrisonDto,
  UpdateSessionTemplateDto,
} from './visitSchedulerApiTypes'

describe('visitSchedulerApiClient', () => {
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  let visitSchedulerApiClient: VisitSchedulerApiClient

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    visitSchedulerApiClient = new VisitSchedulerApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getAllPrisons', () => {
    it('should return an array of all supported Prisons', async () => {
      const results = TestData.prisonDtos()

      nock(config.apis.visitScheduler.url)
        .get('/admin/prisons')
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, results)

      const output = await visitSchedulerApiClient.getAllPrisons()

      expect(output).toEqual(results)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('getPrison', () => {
    it('should return details of specified prison', async () => {
      const prison = TestData.prisonDto()

      nock(config.apis.visitScheduler.url)
        .get(`/admin/prisons/prison/${prison.code}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, prison)

      const output = await visitSchedulerApiClient.getPrison(prison.code)

      expect(output).toEqual(prison)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('createPrison', () => {
    it('should add prison to list of supported prisons', async () => {
      const prison = TestData.prisonDto()

      nock(config.apis.visitScheduler.url)
        .post('/admin/prisons/prison', <PrisonDto>{
          active: prison.active,
          adultAgeYears: prison.adultAgeYears,
          clients: prison.clients,
          code: prison.code,
          maxAdultVisitors: prison.maxAdultVisitors,
          maxChildVisitors: prison.maxChildVisitors,
          maxTotalVisitors: prison.maxTotalVisitors,
          policyNoticeDaysMin: prison.policyNoticeDaysMin,
          policyNoticeDaysMax: prison.policyNoticeDaysMax,
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(201, prison)

      const output = await visitSchedulerApiClient.createPrison(prison)

      expect(output).toStrictEqual(prison)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('updatePrison', () => {
    it('should return updated prison', async () => {
      const prisonDto = TestData.prisonDto()
      const updatePrisonDto = TestData.updatePrisonDto({
        adultAgeYears: 18,
        maxAdultVisitors: 2,
        maxChildVisitors: 4,
        maxTotalVisitors: 6,
        policyNoticeDaysMax: 28,
        policyNoticeDaysMin: 2,
      })

      nock(config.apis.visitScheduler.url)
        .put(`/admin/prisons/prison/${prisonDto.code}`, <UpdatePrisonDto>{
          adultAgeYears: updatePrisonDto.adultAgeYears,
          maxAdultVisitors: updatePrisonDto.maxAdultVisitors,
          maxChildVisitors: updatePrisonDto.maxChildVisitors,
          maxTotalVisitors: updatePrisonDto.maxTotalVisitors,
          policyNoticeDaysMin: updatePrisonDto.policyNoticeDaysMin,
          policyNoticeDaysMax: updatePrisonDto.policyNoticeDaysMax,
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(201, prisonDto)

      const output = await visitSchedulerApiClient.updatePrison(prisonDto.code, updatePrisonDto)

      expect(output).toStrictEqual(prisonDto)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('activatePrison', () => {
    it('should return activated prison', async () => {
      const prison = TestData.prisonDto()

      nock(config.apis.visitScheduler.url)
        .put(`/admin/prisons/prison/${prison.code}/activate`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, prison)

      const output = await visitSchedulerApiClient.activatePrison(prison.code)

      expect(output).toEqual(prison)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('deactivatePrison', () => {
    it('should return deactivated prison', async () => {
      const prison = TestData.prisonDto()

      nock(config.apis.visitScheduler.url)
        .put(`/admin/prisons/prison/${prison.code}/deactivate`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, prison)

      const output = await visitSchedulerApiClient.deactivatePrison(prison.code)

      expect(output).toEqual(prison)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('activatePrisonClientType', () => {
    it('should make call to activate the given client type for the given prison', async () => {
      const prisonCode = 'HEI'
      const prisonUserClientType: UserClientType = 'STAFF'

      const response: UserClientDto = { active: true, userType: 'STAFF' }

      nock(config.apis.visitScheduler.url)
        .put(`/admin/prisons/prison/${prisonCode}/client/${prisonUserClientType}/activate`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, response)

      const output = await visitSchedulerApiClient.activatePrisonClientType(prisonCode, prisonUserClientType)

      expect(output).toStrictEqual(response)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('deactivatePrisonClientType', () => {
    it('should make call to deactivate the given client type for the given prison', async () => {
      const prisonCode = 'HEI'
      const prisonUserClientType: UserClientType = 'STAFF'

      const response: UserClientDto = { active: false, userType: 'STAFF' }

      nock(config.apis.visitScheduler.url)
        .put(`/admin/prisons/prison/${prisonCode}/client/${prisonUserClientType}/deactivate`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, response)

      const output = await visitSchedulerApiClient.deactivatePrisonClientType(prisonCode, prisonUserClientType)

      expect(output).toStrictEqual(response)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('getSessionTemplates', () => {
    it('should return all session templates for a prison', async () => {
      const sessionTemplates = [TestData.sessionTemplate()]

      nock(config.apis.visitScheduler.url)
        .get(`/admin/session-templates`)
        .query({
          prisonCode: 'HEI',
          rangeType: 'ALL',
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, sessionTemplates)

      const output = await visitSchedulerApiClient.getSessionTemplates('HEI', 'ALL')

      expect(output).toEqual(sessionTemplates)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('getSingleSessionTemplate', () => {
    it('should return a session template', async () => {
      const singleSessionTemplate = TestData.sessionTemplate()

      nock(config.apis.visitScheduler.url)
        .get(`/admin/session-templates/template/${singleSessionTemplate.reference}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, singleSessionTemplate)

      const output = await visitSchedulerApiClient.getSingleSessionTemplate(singleSessionTemplate.reference)

      expect(output).toEqual(singleSessionTemplate)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('activateSessionTemplate', () => {
    it('should return activated prison', async () => {
      const sessionTemplate = TestData.sessionTemplate()

      nock(config.apis.visitScheduler.url)
        .put(`/admin/session-templates/template/${sessionTemplate.reference}/activate`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, sessionTemplate)

      const output = await visitSchedulerApiClient.activateSessionTemplate(sessionTemplate.reference)

      expect(output).toEqual(sessionTemplate)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('deactivateSessionTemplate', () => {
    it('should return activated prison', async () => {
      const sessionTemplate = TestData.sessionTemplate({ active: false })

      nock(config.apis.visitScheduler.url)
        .put(`/admin/session-templates/template/${sessionTemplate.reference}/deactivate`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, sessionTemplate)

      const output = await visitSchedulerApiClient.deactivateSessionTemplate(sessionTemplate.reference)

      expect(output).toEqual(sessionTemplate)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteSessionTemplate', () => {
    it('should delete session template', async () => {
      const sessionTemplate = TestData.sessionTemplate()

      nock(config.apis.visitScheduler.url)
        .delete(`/admin/session-templates/template/${sessionTemplate.reference}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200)

      await visitSchedulerApiClient.deleteSessionTemplate(sessionTemplate.reference)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('createSessionTemplate', () => {
    it('should add a new session template', async () => {
      const createSessionTemplateDto = TestData.createSessionTemplateDto()

      nock(config.apis.visitScheduler.url)
        .post('/admin/session-templates/template', <CreateSessionTemplateDto>{
          name: createSessionTemplateDto.name,
          weeklyFrequency: createSessionTemplateDto.weeklyFrequency,
          dayOfWeek: createSessionTemplateDto.dayOfWeek,
          prisonId: createSessionTemplateDto.prisonId,
          sessionCapacity: createSessionTemplateDto.sessionCapacity,
          sessionDateRange: createSessionTemplateDto.sessionDateRange,
          sessionTimeSlot: createSessionTemplateDto.sessionTimeSlot,
          visitRoom: createSessionTemplateDto.visitRoom,
          includeCategoryGroupType: createSessionTemplateDto.includeCategoryGroupType,
          categoryGroupReferences: [],
          includeIncentiveGroupType: createSessionTemplateDto.includeIncentiveGroupType,
          incentiveLevelGroupReferences: [],
          includeLocationGroupType: createSessionTemplateDto.includeLocationGroupType,
          locationGroupReferences: [],
          clients: createSessionTemplateDto.clients,
          visitOrderRestriction: 'VO_PVO',
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(201, createSessionTemplateDto)

      const output = await visitSchedulerApiClient.createSessionTemplate(createSessionTemplateDto)

      expect(output).toEqual(createSessionTemplateDto)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateSessionTemplate', () => {
    it('should update a new session template', async () => {
      const updateSessionTemplateDto = TestData.updateSessionTemplateDto()
      const reference = 'ABC-DEF-GHI'
      const validateRequest = true
      nock(config.apis.visitScheduler.url)
        .put(`/admin/session-templates/template/${reference}?&validateRequest=${validateRequest}`, <
          UpdateSessionTemplateDto
        >{
          name: updateSessionTemplateDto.name,
          sessionCapacity: updateSessionTemplateDto.sessionCapacity,
          sessionDateRange: updateSessionTemplateDto.sessionDateRange,
          sessionTimeSlot: updateSessionTemplateDto.sessionTimeSlot,
          visitRoom: updateSessionTemplateDto.visitRoom,
          includeCategoryGroupType: true,
          includeIncentiveGroupType: true,
          includeLocationGroupType: true,
          categoryGroupReferences: ['-cat~abc~de'],
          incentiveLevelGroupReferences: ['-inc~abc~de'],
          locationGroupReferences: ['-loc~abc~de'],
          clients: [
            { active: true, userType: 'PUBLIC' },
            { active: true, userType: 'STAFF' },
          ],
          visitOrderRestriction: 'VO_PVO',
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(201, updateSessionTemplateDto)

      const output = await visitSchedulerApiClient.updateSessionTemplate(
        reference,
        updateSessionTemplateDto,
        validateRequest,
      )

      expect(output).toEqual(updateSessionTemplateDto)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('getTemplateStats', () => {
    it('should return statistics for a session template', async () => {
      const requestVisitStatsDto = TestData.requestVisitStatsDto()
      const sessionTemplateVisitStatsDto = TestData.sessionTemplateVisitStatsDto()
      const reference = 'ABC-DEF-GHI'
      nock(config.apis.visitScheduler.url)
        .post(`/admin/session-templates/template/${reference}/stats`, <RequestSessionTemplateVisitStatsDto>{
          visitsFromDate: requestVisitStatsDto.visitsFromDate,
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(201, sessionTemplateVisitStatsDto)

      const output = await visitSchedulerApiClient.getTemplateStats(requestVisitStatsDto, reference)

      expect(output).toEqual(sessionTemplateVisitStatsDto)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('getSingleLocationGroup', () => {
    it('should return a single location groups', async () => {
      const singleLocationGroup = TestData.locationGroup()

      nock(config.apis.visitScheduler.url)
        .get(`/admin/location-groups/group/${singleLocationGroup.reference}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, singleLocationGroup)

      const output = await visitSchedulerApiClient.getSingleLocationGroup(singleLocationGroup.reference)

      expect(output).toEqual(singleLocationGroup)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('getLocationGroups', () => {
    it('should return all location groups for a prison', async () => {
      const prisonCode = 'HEI'
      const locationGroups = [TestData.locationGroup()]

      nock(config.apis.visitScheduler.url)
        .get(`/admin/location-groups/${prisonCode}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, locationGroups)

      const output = await visitSchedulerApiClient.getLocationGroups('HEI')

      expect(output).toEqual(locationGroups)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('createLocationGroup', () => {
    it('should add a new location group', async () => {
      const createLocationGroupDto = TestData.createLocationGroupDto()
      const singleLocationGroup = TestData.locationGroup()

      nock(config.apis.visitScheduler.url)
        .post('/admin/location-groups/group', <CreateLocationGroupDto>{
          name: createLocationGroupDto.name,
          prisonId: createLocationGroupDto.prisonId,
          locations: createLocationGroupDto.locations,
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(201, singleLocationGroup)

      const output = await visitSchedulerApiClient.createLocationGroup(createLocationGroupDto)

      expect(output).toEqual(singleLocationGroup)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateLocationGroup', () => {
    it('should update location group', async () => {
      const updateLocationGroupDto = TestData.updateLocationGroupDto()
      const singleLocationGroup = TestData.locationGroup()

      nock(config.apis.visitScheduler.url)
        .put(`/admin/location-groups/group/${singleLocationGroup.reference}`, <UpdateLocationGroupDto>{
          name: updateLocationGroupDto.name,
          locations: updateLocationGroupDto.locations,
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, singleLocationGroup)

      const output = await visitSchedulerApiClient.updateLocationGroup(
        singleLocationGroup.reference,
        updateLocationGroupDto,
      )

      expect(output).toEqual(singleLocationGroup)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteLocationGroup', () => {
    it('should delete a location group', async () => {
      const locationGroup = TestData.locationGroup()

      nock(config.apis.visitScheduler.url)
        .delete(`/admin/location-groups/group/${locationGroup.reference}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200)

      await visitSchedulerApiClient.deleteLocationGroup(locationGroup.reference)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('getSingleCategoryGroup', () => {
    it('should return a single category group', async () => {
      const getSingleCategoryGroup = TestData.categoryGroup()

      nock(config.apis.visitScheduler.url)
        .get(`/admin/category-groups/group/${getSingleCategoryGroup.reference}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, getSingleCategoryGroup)

      const output = await visitSchedulerApiClient.getSingleCategoryGroup(getSingleCategoryGroup.reference)

      expect(output).toEqual(getSingleCategoryGroup)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('getCategoryGroups', () => {
    it('should return all category groups for a prison', async () => {
      const prisonCode = 'HEI'
      const categoryGroups = [TestData.categoryGroup()]

      nock(config.apis.visitScheduler.url)
        .get(`/admin/category-groups/${prisonCode}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, categoryGroups)

      const output = await visitSchedulerApiClient.getCategoryGroups('HEI')

      expect(output).toEqual(categoryGroups)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('createCategoryGroup', () => {
    it('should add a new category group', async () => {
      const createCategoryGroupDto = TestData.createCategoryGroupDto()
      const singleCategoryGroup = TestData.categoryGroup()

      nock(config.apis.visitScheduler.url)
        .post('/admin/category-groups/group', <CreateCategoryGroupDto>{
          categories: createCategoryGroupDto.categories,
          name: createCategoryGroupDto.name,
          prisonId: createCategoryGroupDto.prisonId,
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(201, singleCategoryGroup)

      const output = await visitSchedulerApiClient.createCategoryGroup(createCategoryGroupDto)

      expect(output).toEqual(singleCategoryGroup)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteCategoryGroup', () => {
    it('should delete a category group', async () => {
      const categoryGroup = TestData.categoryGroup()

      nock(config.apis.visitScheduler.url)
        .delete(`/admin/category-groups/group/${categoryGroup.reference}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200)

      await visitSchedulerApiClient.deleteCategoryGroup(categoryGroup.reference)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('getSingleIncentiveGroup', () => {
    it('should return an incentive level group', async () => {
      const getSingleIncentiveGroup = TestData.incentiveGroup()

      nock(config.apis.visitScheduler.url)
        .get(`/admin/incentive-groups/group/${getSingleIncentiveGroup.reference}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, getSingleIncentiveGroup)

      const output = await visitSchedulerApiClient.getSingleIncentiveGroup(getSingleIncentiveGroup.reference)

      expect(output).toEqual(getSingleIncentiveGroup)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('getIncentiveGroups', () => {
    it('should return all incentive level groups for a prison', async () => {
      const prisonCode = 'HEI'
      const incentiveGroups = [TestData.incentiveGroup()]

      nock(config.apis.visitScheduler.url)
        .get(`/admin/incentive-groups/${prisonCode}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, incentiveGroups)

      const output = await visitSchedulerApiClient.getIncentiveGroups('HEI')

      expect(output).toEqual(incentiveGroups)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('createIncentiveGroup', () => {
    it('should add a new incentive group', async () => {
      const createIncentiveGroupDto = TestData.createIncentiveGroupDto()
      const singleIncentiveGroup = TestData.incentiveGroup()

      nock(config.apis.visitScheduler.url)
        .post('/admin/incentive-groups/group', <CreateIncentiveGroupDto>{
          name: createIncentiveGroupDto.name,
          prisonId: createIncentiveGroupDto.prisonId,
          incentiveLevels: createIncentiveGroupDto.incentiveLevels,
        })
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(201, singleIncentiveGroup)

      const output = await visitSchedulerApiClient.createIncentiveGroup(createIncentiveGroupDto)

      expect(output).toEqual(singleIncentiveGroup)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteIncentiveGroup', () => {
    it('should delete an incentive group', async () => {
      const incentiveGroup = TestData.incentiveGroup()

      nock(config.apis.visitScheduler.url)
        .delete(`/admin/incentive-groups/group/${incentiveGroup.reference}`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200)

      await visitSchedulerApiClient.deleteIncentiveGroup(incentiveGroup.reference)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })
})

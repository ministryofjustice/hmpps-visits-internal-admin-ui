import nock from 'nock'
import config from '../config'
import VisitSchedulerApiClient from './visitSchedulerApiClient'
import TestData from '../routes/testutils/testData'
import {
  CreateCategoryGroupDto,
  CreateIncentiveGroupDto,
  CreateLocationGroupDto,
  CreateSessionTemplateDto,
  PageVisitDto,
  PrisonDto,
  PrisonUserClientDto,
  PrisonUserClientType,
  RequestSessionTemplateVisitStatsDto,
  UpdateLocationGroupDto,
  UpdatePrisonDto,
  UpdateSessionTemplateDto,
} from './visitSchedulerApiTypes'

describe('visitSchedulerApiClient', () => {
  let fakeVisitSchedulerApi: nock.Scope
  let visitSchedulerApiClient: VisitSchedulerApiClient
  const token = 'token-1'

  beforeEach(() => {
    fakeVisitSchedulerApi = nock(config.apis.visitScheduler.url)
    visitSchedulerApiClient = new VisitSchedulerApiClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getBookedVisitsByDate', () => {
    it('should return visits booked on given date', async () => {
      const results: PageVisitDto = {
        totalElements: 1,
      }

      fakeVisitSchedulerApi
        .get(`/visits/search`)
        .query({
          prisonId: 'HEI',
          visitStartDate: '2022-05-23',
          visitEndDate: '2022-05-23',
          visitStatus: 'BOOKED',
          page: '0',
          size: '1000',
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, results)

      const output = await visitSchedulerApiClient.getBookedVisitsByDate('HEI', '2022-05-23')

      expect(output).toEqual(results)
    })
  })

  describe('getAllPrisons', () => {
    it('should return an array of all supported Prisons', async () => {
      const results = TestData.prisonDtos()

      fakeVisitSchedulerApi.get('/admin/prisons').matchHeader('authorization', `Bearer ${token}`).reply(200, results)

      const output = await visitSchedulerApiClient.getAllPrisons()

      expect(output).toEqual(results)
    })
  })

  describe('getPrison', () => {
    it('should return details of specified prison', async () => {
      const prison = TestData.prisonDto()

      fakeVisitSchedulerApi
        .get(`/admin/prisons/prison/${prison.code}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prison)

      const output = await visitSchedulerApiClient.getPrison(prison.code)

      expect(output).toEqual(prison)
    })
  })

  describe('createPrison', () => {
    it('should add prison to list of supported prisons', async () => {
      const prison = TestData.prisonDto()

      fakeVisitSchedulerApi
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
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, prison)

      const output = await visitSchedulerApiClient.createPrison(prison)

      expect(output).toStrictEqual(prison)
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

      fakeVisitSchedulerApi
        .put(`/admin/prisons/prison/${prisonDto.code}`, <UpdatePrisonDto>{
          adultAgeYears: updatePrisonDto.adultAgeYears,
          maxAdultVisitors: updatePrisonDto.maxAdultVisitors,
          maxChildVisitors: updatePrisonDto.maxChildVisitors,
          maxTotalVisitors: updatePrisonDto.maxTotalVisitors,
          policyNoticeDaysMin: updatePrisonDto.policyNoticeDaysMin,
          policyNoticeDaysMax: updatePrisonDto.policyNoticeDaysMax,
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, prisonDto)

      const output = await visitSchedulerApiClient.updatePrison(prisonDto.code, updatePrisonDto)

      expect(output).toStrictEqual(prisonDto)
    })
  })

  describe('activatePrison', () => {
    it('should return activated prison', async () => {
      const prison = TestData.prisonDto()

      fakeVisitSchedulerApi
        .put(`/admin/prisons/prison/${prison.code}/activate`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prison)

      const output = await visitSchedulerApiClient.activatePrison(prison.code)

      expect(output).toEqual(prison)
    })
  })

  describe('deactivatePrison', () => {
    it('should return deactivated prison', async () => {
      const prison = TestData.prisonDto()

      fakeVisitSchedulerApi
        .put(`/admin/prisons/prison/${prison.code}/deactivate`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prison)

      const output = await visitSchedulerApiClient.deactivatePrison(prison.code)

      expect(output).toEqual(prison)
    })
  })

  describe('activatePrisonClientType', () => {
    it('should make call to activate the given client type for the given prison', async () => {
      const prisonCode = 'HEI'
      const prisonUserClientType: PrisonUserClientType = 'STAFF'

      const response: PrisonUserClientDto = { active: true, userType: 'STAFF' }

      fakeVisitSchedulerApi
        .put(`/admin/prisons/prison/${prisonCode}/client/${prisonUserClientType}/activate`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, response)

      const output = await visitSchedulerApiClient.activatePrisonClientType(prisonCode, prisonUserClientType)

      expect(output).toStrictEqual(response)
    })
  })

  describe('deactivatePrisonClientType', () => {
    it('should make call to deactivate the given client type for the given prison', async () => {
      const prisonCode = 'HEI'
      const prisonUserClientType: PrisonUserClientType = 'STAFF'

      const response: PrisonUserClientDto = { active: false, userType: 'STAFF' }

      fakeVisitSchedulerApi
        .put(`/admin/prisons/prison/${prisonCode}/client/${prisonUserClientType}/deactivate`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, response)

      const output = await visitSchedulerApiClient.deactivatePrisonClientType(prisonCode, prisonUserClientType)

      expect(output).toStrictEqual(response)
    })
  })

  describe('getExcludeDates', () => {
    it('should make call to get exclude dates for a prison', async () => {
      const excludeDateDto = [TestData.excludeDateDto()]
      const prisonCode = 'HEI'
      fakeVisitSchedulerApi
        .get(`/prisons/prison/${prisonCode}/exclude-date`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, excludeDateDto)

      const output = await visitSchedulerApiClient.getExcludeDates(prisonCode)

      expect(output).toEqual(excludeDateDto)
    })
  })

  describe('addExcludedDate', () => {
    it('should make call to add exclude date to a prison and return the PrisonDto', async () => {
      const excludeDate = '2023-12-26'
      const prisonCode = 'HEI'

      fakeVisitSchedulerApi
        .put(`/prisons/prison/${prisonCode}/exclude-date/add`, { excludeDate, actionedBy: 'user1' })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, null)

      const output = await visitSchedulerApiClient.addExcludeDate(prisonCode, '2023-12-26', 'user1')

      expect(output).toEqual(null)
    })
  })

  describe('removeExcludedDate', () => {
    it('should make call to remove exclude date from a prison', async () => {
      const excludeDate = '2023-12-26'
      const prisonCode = 'HEI'

      fakeVisitSchedulerApi
        .put(`/prisons/prison/${prisonCode}/exclude-date/remove`, { excludeDate, actionedBy: 'user1' })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200)

      await visitSchedulerApiClient.removeExcludeDate(prisonCode, excludeDate, 'user1')
      expect(fakeVisitSchedulerApi.isDone()).toBe(true)
    })
  })

  describe('getSessionTemplates', () => {
    it('should return all session templates for a prison', async () => {
      const sessionTemplates = [TestData.sessionTemplate()]

      fakeVisitSchedulerApi
        .get(`/admin/session-templates`)
        .query({
          prisonCode: 'HEI',
          rangeType: 'ALL',
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, sessionTemplates)

      const output = await visitSchedulerApiClient.getSessionTemplates('HEI', 'ALL')

      expect(output).toEqual(sessionTemplates)
    })
  })

  describe('getSingleSessionTemplate', () => {
    it('should return a session template', async () => {
      const singleSessionTemplate = TestData.sessionTemplate()

      fakeVisitSchedulerApi
        .get(`/admin/session-templates/template/${singleSessionTemplate.reference}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, singleSessionTemplate)

      const output = await visitSchedulerApiClient.getSingleSessionTemplate(singleSessionTemplate.reference)

      expect(output).toEqual(singleSessionTemplate)
    })
  })

  describe('activateSessionTemplate', () => {
    it('should return activated prison', async () => {
      const sessionTemplate = TestData.sessionTemplate()

      fakeVisitSchedulerApi
        .put(`/admin/session-templates/template/${sessionTemplate.reference}/activate`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, sessionTemplate)

      const output = await visitSchedulerApiClient.activateSessionTemplate(sessionTemplate.reference)

      expect(output).toEqual(sessionTemplate)
    })
  })

  describe('deactivateSessionTemplate', () => {
    it('should return activated prison', async () => {
      const sessionTemplate = TestData.sessionTemplate({ active: false })

      fakeVisitSchedulerApi
        .put(`/admin/session-templates/template/${sessionTemplate.reference}/deactivate`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, sessionTemplate)

      const output = await visitSchedulerApiClient.deactivateSessionTemplate(sessionTemplate.reference)

      expect(output).toEqual(sessionTemplate)
    })
  })

  describe('deleteSessionTemplate', () => {
    it('should make call to remove exclude date from a prison', async () => {
      const sessionTemplate = TestData.sessionTemplate()

      fakeVisitSchedulerApi
        .delete(`/admin/session-templates/template/${sessionTemplate.reference}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200)

      await visitSchedulerApiClient.deleteSessionTemplate(sessionTemplate.reference)
      expect(fakeVisitSchedulerApi.isDone()).toBe(true)
    })
  })

  describe('createSessionTemplate', () => {
    it('should add a new session template', async () => {
      const createSessionTemplateDto = TestData.createSessionTemplateDto()

      fakeVisitSchedulerApi
        .post('/admin/session-templates/template', <CreateSessionTemplateDto>{
          name: createSessionTemplateDto.name,
          weeklyFrequency: createSessionTemplateDto.weeklyFrequency,
          dayOfWeek: createSessionTemplateDto.dayOfWeek,
          prisonId: createSessionTemplateDto.prisonId,
          sessionCapacity: createSessionTemplateDto.sessionCapacity,
          sessionDateRange: createSessionTemplateDto.sessionDateRange,
          sessionTimeSlot: createSessionTemplateDto.sessionTimeSlot,
          visitRoom: createSessionTemplateDto.visitRoom,
          categoryGroupReferences: [],
          incentiveLevelGroupReferences: [],
          includeLocationGroupType: createSessionTemplateDto.includeLocationGroupType,
          locationGroupReferences: [],
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, createSessionTemplateDto)

      const output = await visitSchedulerApiClient.createSessionTemplate(createSessionTemplateDto)

      expect(output).toEqual(createSessionTemplateDto)
    })
  })

  describe('updateSessionTemplate', () => {
    it('should update a new session template', async () => {
      const updateSessionTemplateDto = TestData.updateSessionTemplateDto()
      const reference = 'ABC-DEF-GHI'
      fakeVisitSchedulerApi
        .put(`/admin/session-templates/template/${reference}`, <UpdateSessionTemplateDto>{
          name: updateSessionTemplateDto.name,
          sessionCapacity: updateSessionTemplateDto.sessionCapacity,
          sessionDateRange: updateSessionTemplateDto.sessionDateRange,
          sessionTimeSlot: updateSessionTemplateDto.sessionTimeSlot,
          visitRoom: updateSessionTemplateDto.visitRoom,
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, updateSessionTemplateDto)

      const output = await visitSchedulerApiClient.updateSessionTemplate(reference, updateSessionTemplateDto)

      expect(output).toEqual(updateSessionTemplateDto)
    })
  })

  describe('getTemplateStats', () => {
    it('should return statistics for a session template', async () => {
      const requestVisitStatsDto = TestData.requestVisitStatsDto()
      const sessionTemplateVisitStatsDto = TestData.sessionTemplateVisitStatsDto()
      const reference = 'ABC-DEF-GHI'
      fakeVisitSchedulerApi
        .post(`/admin/session-templates/template/${reference}/stats`, <RequestSessionTemplateVisitStatsDto>{
          visitsFromDate: requestVisitStatsDto.visitsFromDate,
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, sessionTemplateVisitStatsDto)

      const output = await visitSchedulerApiClient.getTemplateStats(requestVisitStatsDto, reference)

      expect(output).toEqual(sessionTemplateVisitStatsDto)
    })
  })

  describe('getSingleLocationGroup', () => {
    it('should return a single location groups', async () => {
      const singleLocationGroup = TestData.locationGroup()

      fakeVisitSchedulerApi
        .get(`/admin/location-groups/group/${singleLocationGroup.reference}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, singleLocationGroup)

      const output = await visitSchedulerApiClient.getSingleLocationGroup(singleLocationGroup.reference)

      expect(output).toEqual(singleLocationGroup)
    })
  })

  describe('getLocationGroups', () => {
    it('should return all location groups for a prison', async () => {
      const prisonCode = 'HEI'
      const locationGroups = [TestData.locationGroup()]

      fakeVisitSchedulerApi
        .get(`/admin/location-groups/${prisonCode}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, locationGroups)

      const output = await visitSchedulerApiClient.getLocationGroups('HEI')

      expect(output).toEqual(locationGroups)
    })
  })

  describe('createLocationGroup', () => {
    it('should add a new location group', async () => {
      const createLocationGroupDto = TestData.createLocationGroupDto()
      const singleLocationGroup = TestData.locationGroup()

      fakeVisitSchedulerApi
        .post('/admin/location-groups/group', <CreateLocationGroupDto>{
          name: createLocationGroupDto.name,
          prisonId: createLocationGroupDto.prisonId,
          locations: createLocationGroupDto.locations,
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, singleLocationGroup)

      const output = await visitSchedulerApiClient.createLocationGroup(createLocationGroupDto)

      expect(output).toEqual(singleLocationGroup)
    })
  })

  describe('updateLocationGroup', () => {
    it('should update location group', async () => {
      const updateLocationGroupDto = TestData.updateLocationGroupDto()
      const singleLocationGroup = TestData.locationGroup()

      fakeVisitSchedulerApi
        .post(`/admin/location-groups/group/${singleLocationGroup.reference}`, <UpdateLocationGroupDto>{
          name: updateLocationGroupDto.name,
          locations: updateLocationGroupDto.locations,
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, singleLocationGroup)

      const output = await visitSchedulerApiClient.updateLocationGroup(
        singleLocationGroup.reference,
        updateLocationGroupDto,
      )

      expect(output).toEqual(singleLocationGroup)
    })
  })

  describe('deleteLocationGroup', () => {
    it('should delete a location group', async () => {
      const locationGroup = TestData.locationGroup()

      fakeVisitSchedulerApi
        .delete(`/admin/location-groups/group/${locationGroup.reference}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200)

      await visitSchedulerApiClient.deleteLocationGroup(locationGroup.reference)
      expect(fakeVisitSchedulerApi.isDone()).toBe(true)
    })
  })

  describe('getSingleCategoryGroup', () => {
    it('should return a single category group', async () => {
      const getSingleCategoryGroup = TestData.categoryGroup()

      fakeVisitSchedulerApi
        .get(`/admin/category-groups/group/${getSingleCategoryGroup.reference}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, getSingleCategoryGroup)

      const output = await visitSchedulerApiClient.getSingleCategoryGroup(getSingleCategoryGroup.reference)

      expect(output).toEqual(getSingleCategoryGroup)
    })
  })

  describe('getCategoryGroups', () => {
    it('should return all category groups for a prison', async () => {
      const prisonCode = 'HEI'
      const categoryGroups = [TestData.categoryGroup()]

      fakeVisitSchedulerApi
        .get(`/admin/category-groups/${prisonCode}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, categoryGroups)

      const output = await visitSchedulerApiClient.getCategoryGroups('HEI')

      expect(output).toEqual(categoryGroups)
    })
  })

  describe('createCategoryGroup', () => {
    it('should add a new category group', async () => {
      const createCategoryGroupDto = TestData.createCategoryGroupDto()
      const singleCategoryGroup = TestData.categoryGroup()

      fakeVisitSchedulerApi
        .post('/admin/category-groups/group', <CreateCategoryGroupDto>{
          categories: createCategoryGroupDto.categories,
          name: createCategoryGroupDto.name,
          prisonId: createCategoryGroupDto.prisonId,
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, singleCategoryGroup)

      const output = await visitSchedulerApiClient.createCategoryGroup(createCategoryGroupDto)

      expect(output).toEqual(singleCategoryGroup)
    })
  })

  describe('deleteCategoryGroup', () => {
    it('should delete a category group', async () => {
      const categoryGroup = TestData.categoryGroup()

      fakeVisitSchedulerApi
        .delete(`/admin/category-groups/group/${categoryGroup.reference}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200)

      await visitSchedulerApiClient.deleteCategoryGroup(categoryGroup.reference)
      expect(fakeVisitSchedulerApi.isDone()).toBe(true)
    })
  })

  describe('getSingleIncentiveGroup', () => {
    it('should return an incentive level group', async () => {
      const getSingleIncentiveGroup = TestData.incentiveGroup()

      fakeVisitSchedulerApi
        .get(`/admin/incentive-groups/group/${getSingleIncentiveGroup.reference}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, getSingleIncentiveGroup)

      const output = await visitSchedulerApiClient.getSingleIncentiveGroup(getSingleIncentiveGroup.reference)

      expect(output).toEqual(getSingleIncentiveGroup)
    })
  })

  describe('getIncentiveGroups', () => {
    it('should return all incentive level groups for a prison', async () => {
      const prisonCode = 'HEI'
      const incentiveGroups = [TestData.incentiveGroup()]

      fakeVisitSchedulerApi
        .get(`/admin/incentive-groups/${prisonCode}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, incentiveGroups)

      const output = await visitSchedulerApiClient.getIncentiveGroups('HEI')

      expect(output).toEqual(incentiveGroups)
    })
  })

  describe('createIncentiveGroup', () => {
    it('should add a new incentive group', async () => {
      const createIncentiveGroupDto = TestData.createIncentiveGroupDto()
      const singleIncentiveGroup = TestData.incentiveGroup()

      fakeVisitSchedulerApi
        .post('/admin/incentive-groups/group', <CreateIncentiveGroupDto>{
          name: createIncentiveGroupDto.name,
          prisonId: createIncentiveGroupDto.prisonId,
          incentiveLevels: createIncentiveGroupDto.incentiveLevels,
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, singleIncentiveGroup)

      const output = await visitSchedulerApiClient.createIncentiveGroup(createIncentiveGroupDto)

      expect(output).toEqual(singleIncentiveGroup)
    })
  })

  describe('deleteIncentiveGroup', () => {
    it('should delete an incentive group', async () => {
      const incentiveGroup = TestData.incentiveGroup()

      fakeVisitSchedulerApi
        .delete(`/admin/incentive-groups/group/${incentiveGroup.reference}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200)

      await visitSchedulerApiClient.deleteIncentiveGroup(incentiveGroup.reference)
      expect(fakeVisitSchedulerApi.isDone()).toBe(true)
    })
  })
})

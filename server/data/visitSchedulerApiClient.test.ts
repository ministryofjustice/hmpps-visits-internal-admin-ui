import nock from 'nock'
import config from '../config'
import VisitSchedulerApiClient from './visitSchedulerApiClient'
import TestData from '../routes/testutils/testData'
import { CreateSessionTemplateDto, Prison } from './visitSchedulerApiTypes'

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

  describe('getAllPrisons', () => {
    it('should return an array of all supported Prisons', async () => {
      const results = TestData.prisons()

      fakeVisitSchedulerApi.get('/admin/prisons').matchHeader('authorization', `Bearer ${token}`).reply(200, results)

      const output = await visitSchedulerApiClient.getAllPrisons()

      expect(output).toEqual(results)
    })
  })

  describe('getPrison', () => {
    it('should return details of specified prison', async () => {
      const prison = TestData.prison()

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
      const prison: Prison = {
        active: false,
        code: 'BHI',
        excludeDates: [],
      }

      fakeVisitSchedulerApi
        .post('/admin/prisons/prison', <Prison>{
          active: prison.active,
          code: prison.code,
          excludeDates: prison.excludeDates,
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, prison)

      const output = await visitSchedulerApiClient.createPrison(prison)

      expect(output).toEqual(prison)
    })
  })

  describe('activatePrison', () => {
    it('should return activated prison', async () => {
      const prison = TestData.prison()

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
      const prison = TestData.prison()

      fakeVisitSchedulerApi
        .put(`/admin/prisons/prison/${prison.code}/deactivate`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prison)

      const output = await visitSchedulerApiClient.deactivatePrison(prison.code)

      expect(output).toEqual(prison)
    })
  })

  describe('addExcludedDate', () => {
    it('should return prison including the excluded date', async () => {
      const prison = TestData.prison({ excludeDates: ['2023-12-25', '2023-12-26'] })
      const excludeDate = '2023-12-26'

      fakeVisitSchedulerApi
        .put(`/admin/prisons/prison/${prison.code}/exclude-date/add`, { excludeDate })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prison)

      const output = await visitSchedulerApiClient.addExcludeDate(prison.code, '2023-12-26')

      expect(output).toEqual(prison)
    })
  })

  describe('removeExcludedDate', () => {
    it('should return prison without the date excluded', async () => {
      const prison = TestData.prison({ excludeDates: ['2023-12-25', '2023-12-26'] })
      const excludeDate = '2023-12-26'

      fakeVisitSchedulerApi
        .put(`/admin/prisons/prison/${prison.code}/exclude-date/remove`, { excludeDate })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { ...prison, excludeDates: ['2023-12-25'] })

      const output = await visitSchedulerApiClient.removeExcludeDate(prison.code, '2023-12-26')

      expect(output).toMatchObject({ excludeDates: ['2023-12-25'] })
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
          locationGroupReferences: [],
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, createSessionTemplateDto)

      const output = await visitSchedulerApiClient.createSessionTemplate(createSessionTemplateDto)

      expect(output).toEqual(createSessionTemplateDto)
    })
  })
})

import SessionTemplateService from './sessionTemplateService'
import TestData from '../routes/testutils/testData'
import { createMockHmppsAuthClient, createMockVisitSchedulerApiClient } from '../data/testutils/mocks'
import { VisitStatsSummary } from '../@types/visits-admin'

const token = 'some token'

describe('Session template service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let sessionTemplateService: SessionTemplateService

  const VisitSchedulerApiClientFactory = jest.fn()

  const sessionTemplates = [TestData.sessionTemplate()]
  const singleSessionTemplate = TestData.sessionTemplate()
  const createSessionTemplateDto = TestData.createSessionTemplateDto()
  const updateSessionTemplateDto = TestData.updateSessionTemplateDto()

  beforeEach(() => {
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    sessionTemplateService = new SessionTemplateService(VisitSchedulerApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.useRealTimers()
  })

  describe('getSingleSessionTemplate', () => {
    it('should return a single session template', async () => {
      visitSchedulerApiClient.getSingleSessionTemplate.mockResolvedValue(singleSessionTemplate)

      const results = await sessionTemplateService.getSingleSessionTemplate('user', 'HEI')

      expect(results).toEqual(singleSessionTemplate)
    })
  })

  describe('getSessionTemplates', () => {
    it('should return an array of all session templates for a prison', async () => {
      visitSchedulerApiClient.getSessionTemplates.mockResolvedValue(sessionTemplates)

      const results = await sessionTemplateService.getSessionTemplates('user', 'HEI', 'ALL')

      expect(results).toEqual(sessionTemplates)
      expect(visitSchedulerApiClient.getSessionTemplates).toHaveBeenCalledWith('HEI', 'ALL')
    })
  })

  describe('activateSessionTemplate', () => {
    it('should activate a session template', async () => {
      await sessionTemplateService.activateSessionTemplate('user', singleSessionTemplate.reference)
      expect(visitSchedulerApiClient.activateSessionTemplate).toHaveBeenCalledWith(singleSessionTemplate.reference)
    })
  })

  describe('deactivateSessionTemplate', () => {
    it('should deactivate a session template', async () => {
      await sessionTemplateService.deactivateSessionTemplate('user', singleSessionTemplate.reference)
      expect(visitSchedulerApiClient.deactivateSessionTemplate).toHaveBeenCalledWith(singleSessionTemplate.reference)
    })
  })

  describe('deleteSessionTemplate', () => {
    it('should delete a session template', async () => {
      await sessionTemplateService.deleteSessionTemplate('user', singleSessionTemplate.reference)
      expect(visitSchedulerApiClient.deleteSessionTemplate).toHaveBeenCalledWith(singleSessionTemplate.reference)
    })
  })

  describe('createSessionTemplate', () => {
    it('should create a session template', async () => {
      visitSchedulerApiClient.createSessionTemplate.mockResolvedValue(singleSessionTemplate)

      const results = await sessionTemplateService.createSessionTemplate('user', createSessionTemplateDto)

      expect(results).toEqual(singleSessionTemplate)
    })
  })

  describe('updateSessionTemplate', () => {
    it('should update a session template', async () => {
      visitSchedulerApiClient.updateSessionTemplate.mockResolvedValue(singleSessionTemplate)

      const results = await sessionTemplateService.updateSessionTemplate(
        'user',
        'ABC-DEF-GHI',
        updateSessionTemplateDto,
      )

      expect(results).toEqual(singleSessionTemplate)
    })
  })

  describe('getTemplateStats', () => {
    const visitsFromDate = '2024-01-10'

    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date(visitsFromDate))
    })

    it('should return the upcoming visit stats summary in ascending date order for a session template', async () => {
      const requestVisitStatsDto = TestData.requestVisitStatsDto({
        visitsFromDate,
      })

      const sessionTemplateVisitStatsDto = TestData.sessionTemplateVisitStatsDto({
        cancelCount: 5,
        visitCount: 6,
        visitsByDate: [
          { visitDate: '2024-01-15', visitCounts: { open: 1, closed: 2 } },
          { visitDate: '2024-01-25', visitCounts: { open: 0, closed: 3 } },
        ],
        cancelVisitsByDate: [
          { visitDate: '2024-01-20', visitCounts: { open: 1, closed: 0 } },
          { visitDate: '2024-01-25', visitCounts: { open: 3, closed: 1 } },
        ],
      })

      const expectedResults: VisitStatsSummary = {
        bookedCount: 6,
        cancelCount: 5,
        minimumCapacity: sessionTemplateVisitStatsDto.minimumCapacity,
        dates: {
          '2024-01-15': { booked: 3 },
          '2024-01-20': { cancelled: 1 },
          '2024-01-25': { booked: 3, cancelled: 4 },
        },
      }

      visitSchedulerApiClient.getTemplateStats.mockResolvedValue(sessionTemplateVisitStatsDto)
      const results = await sessionTemplateService.getTemplateStats('user', 'ab-cd-ef')

      expect(visitSchedulerApiClient.getTemplateStats).toHaveBeenCalledWith(requestVisitStatsDto, 'ab-cd-ef')
      expect(results).toEqual(expectedResults)
    })

    it('should return handle no upcoming visit stats', async () => {
      const requestVisitStatsDto = TestData.requestVisitStatsDto({
        visitsFromDate,
      })

      const sessionTemplateVisitStatsDto = TestData.sessionTemplateVisitStatsDto({
        cancelCount: 0,
        visitCount: 0,
        visitsByDate: [],
        cancelVisitsByDate: [],
      })

      const expectedResults: VisitStatsSummary = {
        bookedCount: 0,
        cancelCount: 0,
        minimumCapacity: sessionTemplateVisitStatsDto.minimumCapacity,
        dates: {},
      }

      visitSchedulerApiClient.getTemplateStats.mockResolvedValue(sessionTemplateVisitStatsDto)
      const results = await sessionTemplateService.getTemplateStats('user', 'ab-cd-ef')

      expect(visitSchedulerApiClient.getTemplateStats).toHaveBeenCalledWith(requestVisitStatsDto, 'ab-cd-ef')
      expect(results).toEqual(expectedResults)
    })
  })
})

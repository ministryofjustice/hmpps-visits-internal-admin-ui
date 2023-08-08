import SessionTemplateService from './sessionTemplateService'
import TestData from '../routes/testutils/testData'
import { createMockHmppsAuthClient, createMockVisitSchedulerApiClient } from '../data/testutils/mocks'

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
})

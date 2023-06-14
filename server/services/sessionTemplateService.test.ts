import SessionTemplateService from './sessionTemplateService'
import TestData from '../routes/testutils/testData'
import { createMockHmppsAuthClient, createMockVisitSchedulerApiClient } from '../data/testutils/mocks'

const token = 'some token'

describe('Prisons service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let sessionTemplateService: SessionTemplateService

  const VisitSchedulerApiClientFactory = jest.fn()

  const sessionTemplates = [TestData.sessionTemplate()]

  beforeEach(() => {
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    sessionTemplateService = new SessionTemplateService(VisitSchedulerApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getSessionTemplates', () => {
    it('should return an array of all supported Prisons', async () => {
      visitSchedulerApiClient.getSessionTemplates.mockResolvedValue(sessionTemplates)

      const results = await sessionTemplateService.getSessionTemplates('user', 'HEI')

      expect(results).toEqual(sessionTemplates)
    })
  })
})
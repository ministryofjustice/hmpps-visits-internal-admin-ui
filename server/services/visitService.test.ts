import { createMockHmppsAuthClient, createMockVisitSchedulerApiClient } from '../data/testutils/mocks'
import VisitService from './visitService'
import { PageVisitDto } from '../data/visitSchedulerApiTypes'

const token = 'some token'

describe('Location group service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let visitService: VisitService

  const VisitSchedulerApiClientFactory = jest.fn()

  const pageVisitDto: PageVisitDto = {
    totalElements: 1,
  }

  beforeEach(() => {
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    visitService = new VisitService(VisitSchedulerApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getVisitCountByDate', () => {
    it('should return an a single location group', async () => {
      visitSchedulerApiClient.getBookedVisitsByDate.mockResolvedValue(pageVisitDto)

      const results = await visitService.getVisitCountByDate('user', 'HEI', '2022-05-23')

      expect(results).toEqual(pageVisitDto.totalElements)
      expect(visitSchedulerApiClient.getBookedVisitsByDate).toHaveBeenCalledWith('HEI', '2022-05-23')
    })
  })
})

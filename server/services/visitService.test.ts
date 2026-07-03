import { createMockVisitSchedulerApiClient } from '../data/testutils/mocks'
import VisitService from './visitService'
import { PageVisitDto } from '../data/visitSchedulerApiTypes'

describe('Visit service', () => {
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let visitService: VisitService

  const pageVisitDto: PageVisitDto = {
    totalElements: 1,
  }

  beforeEach(() => {
    visitService = new VisitService(visitSchedulerApiClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getVisitCountByDate', () => {
    it('should return a count of visits booked on the given date', async () => {
      visitSchedulerApiClient.getBookedVisitsByDate.mockResolvedValue(pageVisitDto)

      const results = await visitService.getVisitCountByDate('HEI', '2022-05-23')

      expect(results).toEqual(pageVisitDto.totalElements)
      expect(visitSchedulerApiClient.getBookedVisitsByDate).toHaveBeenCalledWith('HEI', '2022-05-23')
    })
  })
})

import CategoryGroupService from './categoryGroupService'
import TestData from '../routes/testutils/testData'
import { createMockHmppsAuthClient, createMockVisitSchedulerApiClient } from '../data/testutils/mocks'

const token = 'some token'

describe('Category group service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let categoryGroupService: CategoryGroupService

  const VisitSchedulerApiClientFactory = jest.fn()

  beforeEach(() => {
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    categoryGroupService = new CategoryGroupService(VisitSchedulerApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getCategoryGroups', () => {
    it('should return an array of all category groups for a prison', async () => {
      const categoryGroups = [TestData.categoryGroup()]
      visitSchedulerApiClient.getCategoryGroups.mockResolvedValue(categoryGroups)

      const results = await categoryGroupService.getCategoryGroups('user', 'HEI')

      expect(results).toEqual(categoryGroups)
      expect(visitSchedulerApiClient.getCategoryGroups).toHaveBeenCalledWith('HEI')
    })
  })
})

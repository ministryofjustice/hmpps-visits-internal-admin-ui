import IncentiveLevelGroupService from './incentiveLevelGroupService'
import TestData from '../routes/testutils/testData'
import { createMockHmppsAuthClient, createMockVisitSchedulerApiClient } from '../data/testutils/mocks'

const token = 'some token'

describe('Incentive level group service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let incentiveLevelGroupService: IncentiveLevelGroupService

  const VisitSchedulerApiClientFactory = jest.fn()

  beforeEach(() => {
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    incentiveLevelGroupService = new IncentiveLevelGroupService(VisitSchedulerApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getIncentiveLevelGroups', () => {
    it('should return an array of all incentive level groups for a prison', async () => {
      const incentiveLevelGroups = [TestData.incentiveLevelGroup()]
      visitSchedulerApiClient.getIncentiveLevelGroups.mockResolvedValue(incentiveLevelGroups)

      const results = await incentiveLevelGroupService.getIncentiveLevelGroups('user', 'HEI')

      expect(results).toEqual(incentiveLevelGroups)
      expect(visitSchedulerApiClient.getIncentiveLevelGroups).toHaveBeenCalledWith('HEI')
    })
  })
})

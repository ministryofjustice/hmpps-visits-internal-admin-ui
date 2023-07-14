import IncentiveGroupService from './incentiveGroupService'
import TestData from '../routes/testutils/testData'
import { createMockHmppsAuthClient, createMockVisitSchedulerApiClient } from '../data/testutils/mocks'

const token = 'some token'

describe('Incentive level group service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let incentiveGroupService: IncentiveGroupService

  const VisitSchedulerApiClientFactory = jest.fn()

  beforeEach(() => {
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    incentiveGroupService = new IncentiveGroupService(VisitSchedulerApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getSingleIncentiveGroup', () => {
    it('should return an incentive group', async () => {
      const singleIncentiveGroup = TestData.incentiveLevelGroup()
      visitSchedulerApiClient.getSingleIncentiveGroup.mockResolvedValue(singleIncentiveGroup)

      const results = await incentiveGroupService.getSingleIncentiveGroup('user', singleIncentiveGroup.reference)

      expect(results).toEqual(singleIncentiveGroup)
      expect(visitSchedulerApiClient.getSingleIncentiveGroup).toHaveBeenCalledWith(singleIncentiveGroup.reference)
    })
  })

  describe('getIncentiveGroups', () => {
    it('should return an array of all incentive level groups for a prison', async () => {
      const IncentiveGroups = [TestData.incentiveLevelGroup()]
      visitSchedulerApiClient.getIncentiveGroups.mockResolvedValue(IncentiveGroups)

      const results = await incentiveGroupService.getIncentiveGroups('user', 'HEI')

      expect(results).toEqual(IncentiveGroups)
      expect(visitSchedulerApiClient.getIncentiveGroups).toHaveBeenCalledWith('HEI')
    })
  })
})

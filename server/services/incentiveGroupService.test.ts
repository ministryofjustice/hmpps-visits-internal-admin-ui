import IncentiveGroupService from './incentiveGroupService'
import TestData from '../routes/testutils/testData'
import { createMockVisitSchedulerApiClient } from '../data/testutils/mocks'

describe('Incentive level group service', () => {
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let incentiveGroupService: IncentiveGroupService

  const singleIncentiveGroup = TestData.incentiveGroup()
  const incentiveGroups = [TestData.incentiveGroup()]
  const createIncentiveGroupDto = TestData.createIncentiveGroupDto()

  beforeEach(() => {
    incentiveGroupService = new IncentiveGroupService(visitSchedulerApiClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getSingleIncentiveGroup', () => {
    it('should return an incentive group', async () => {
      visitSchedulerApiClient.getSingleIncentiveGroup.mockResolvedValue(singleIncentiveGroup)

      const results = await incentiveGroupService.getSingleIncentiveGroup(singleIncentiveGroup.reference)

      expect(results).toEqual(singleIncentiveGroup)
      expect(visitSchedulerApiClient.getSingleIncentiveGroup).toHaveBeenCalledWith(singleIncentiveGroup.reference)
    })
  })

  describe('getIncentiveGroups', () => {
    it('should return an array of all incentive level groups for a prison', async () => {
      visitSchedulerApiClient.getIncentiveGroups.mockResolvedValue(incentiveGroups)

      const results = await incentiveGroupService.getIncentiveGroups('HEI')

      expect(results).toEqual(incentiveGroups)
      expect(visitSchedulerApiClient.getIncentiveGroups).toHaveBeenCalledWith('HEI')
    })
  })

  describe('createIncentiveGroup', () => {
    it('should create a session template', async () => {
      visitSchedulerApiClient.createIncentiveGroup.mockResolvedValue(singleIncentiveGroup)

      const results = await incentiveGroupService.createIncentiveGroup('user', createIncentiveGroupDto)

      expect(results).toEqual(singleIncentiveGroup)
    })
  })

  describe('deleteIncentiveGroup', () => {
    it('should delete a location group', async () => {
      await incentiveGroupService.deleteIncentiveGroup('user', singleIncentiveGroup.reference)
      expect(visitSchedulerApiClient.deleteIncentiveGroup).toHaveBeenCalledWith(singleIncentiveGroup.reference)
    })
  })
})

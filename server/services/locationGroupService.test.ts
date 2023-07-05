import LocationGroupService from './locationGroupService'
import TestData from '../routes/testutils/testData'
import { createMockHmppsAuthClient, createMockVisitSchedulerApiClient } from '../data/testutils/mocks'

const token = 'some token'

describe('Location group service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let locationGroupService: LocationGroupService

  const VisitSchedulerApiClientFactory = jest.fn()

  beforeEach(() => {
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    locationGroupService = new LocationGroupService(VisitSchedulerApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getLocationGroups', () => {
    it('should return an array of all location groups for a prison', async () => {
      const locationGroups = [TestData.locationGroup()]
      visitSchedulerApiClient.getLocationGroups.mockResolvedValue(locationGroups)

      const results = await locationGroupService.getLocationGroups('user', 'HEI')

      expect(results).toEqual(locationGroups)
      expect(visitSchedulerApiClient.getLocationGroups).toHaveBeenCalledWith('HEI')
    })
  })
})

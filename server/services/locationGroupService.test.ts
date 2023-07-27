import LocationGroupService from './locationGroupService'
import TestData from '../routes/testutils/testData'
import { createMockHmppsAuthClient, createMockVisitSchedulerApiClient } from '../data/testutils/mocks'

const token = 'some token'

describe('Location group service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let locationGroupService: LocationGroupService

  const VisitSchedulerApiClientFactory = jest.fn()

  const locationGroups = [TestData.locationGroup()]
  const singleLocationGroup = TestData.locationGroup()
  const createLocationGroupDto = TestData.createLocationGroupDto()

  beforeEach(() => {
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    locationGroupService = new LocationGroupService(VisitSchedulerApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getSingleLocationGroup', () => {
    it('should return an a single location group', async () => {
      visitSchedulerApiClient.getSingleLocationGroup.mockResolvedValue(singleLocationGroup)

      const results = await locationGroupService.getSingleLocationGroup('user', singleLocationGroup.reference)

      expect(results).toEqual(singleLocationGroup)
      expect(visitSchedulerApiClient.getSingleLocationGroup).toHaveBeenCalledWith(singleLocationGroup.reference)
    })
  })

  describe('getLocationGroups', () => {
    it('should return an array of all location groups for a prison', async () => {
      visitSchedulerApiClient.getLocationGroups.mockResolvedValue(locationGroups)

      const results = await locationGroupService.getLocationGroups('user', 'HEI')

      expect(results).toEqual(locationGroups)
      expect(visitSchedulerApiClient.getLocationGroups).toHaveBeenCalledWith('HEI')
    })
  })

  describe('createLocationGroup', () => {
    it('should create a location group', async () => {
      visitSchedulerApiClient.createLocationGroup.mockResolvedValue(singleLocationGroup)

      const results = await locationGroupService.createLocationGroup('user', createLocationGroupDto)

      expect(results).toEqual(singleLocationGroup)
    })
  })

  describe('deleteLocationGroup', () => {
    it('should delete a location group', async () => {
      await locationGroupService.deleteLocationGroup('user', singleLocationGroup.reference)
      expect(visitSchedulerApiClient.deleteLocationGroup).toHaveBeenCalledWith(singleLocationGroup.reference)
    })
  })
})

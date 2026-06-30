import LocationGroupService from './locationGroupService'
import TestData from '../routes/testutils/testData'
import { createMockVisitSchedulerApiClient } from '../data/testutils/mocks'

describe('Location group service', () => {
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let locationGroupService: LocationGroupService

  const locationGroups = [TestData.locationGroup()]
  const singleLocationGroup = TestData.locationGroup()
  const createLocationGroupDto = TestData.createLocationGroupDto()
  const updateLocationGroupDto = TestData.updateLocationGroupDto()

  beforeEach(() => {
    locationGroupService = new LocationGroupService(visitSchedulerApiClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getSingleLocationGroup', () => {
    it('should return an a single location group', async () => {
      visitSchedulerApiClient.getSingleLocationGroup.mockResolvedValue(singleLocationGroup)

      const results = await locationGroupService.getSingleLocationGroup(singleLocationGroup.reference)

      expect(results).toEqual(singleLocationGroup)
      expect(visitSchedulerApiClient.getSingleLocationGroup).toHaveBeenCalledWith(singleLocationGroup.reference)
    })
  })

  describe('getLocationGroups', () => {
    it('should return an array of all location groups for a prison', async () => {
      visitSchedulerApiClient.getLocationGroups.mockResolvedValue(locationGroups)

      const results = await locationGroupService.getLocationGroups('HEI')

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

  describe('updateLocationGroup', () => {
    it('should update a location group', async () => {
      visitSchedulerApiClient.updateLocationGroup.mockResolvedValue(singleLocationGroup)

      const results = await locationGroupService.updateLocationGroup(
        'user',
        singleLocationGroup.reference,
        updateLocationGroupDto,
      )

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

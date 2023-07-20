import CategoryGroupService from './categoryGroupService'
import TestData from '../routes/testutils/testData'
import { createMockHmppsAuthClient, createMockVisitSchedulerApiClient } from '../data/testutils/mocks'

const token = 'some token'

describe('Category group service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let categoryGroupService: CategoryGroupService

  const VisitSchedulerApiClientFactory = jest.fn()

  const singleCategoryGroup = TestData.categoryGroup()
  const categoryGroups = [TestData.categoryGroup()]
  const createCategoryGroupDto = TestData.createCategoryGroupDto()

  beforeEach(() => {
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    categoryGroupService = new CategoryGroupService(VisitSchedulerApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getSingleCategoryGroup', () => {
    it('should return a category group', async () => {
      visitSchedulerApiClient.getSingleCategoryGroup.mockResolvedValue(singleCategoryGroup)

      const results = await categoryGroupService.getSingleCategoryGroup('user', singleCategoryGroup.reference)

      expect(results).toEqual(singleCategoryGroup)
      expect(visitSchedulerApiClient.getSingleCategoryGroup).toHaveBeenCalledWith(singleCategoryGroup.reference)
    })
  })

  describe('getCategoryGroups', () => {
    it('should return an array of all category groups for a prison', async () => {
      visitSchedulerApiClient.getCategoryGroups.mockResolvedValue(categoryGroups)

      const results = await categoryGroupService.getCategoryGroups('user', 'HEI')

      expect(results).toEqual(categoryGroups)
      expect(visitSchedulerApiClient.getCategoryGroups).toHaveBeenCalledWith('HEI')
    })
  })

  describe('createCategoryGroup', () => {
    it('should create a category', async () => {
      visitSchedulerApiClient.createCategoryGroup.mockResolvedValue(singleCategoryGroup)

      const results = await categoryGroupService.createCategoryGroup('user', createCategoryGroupDto)

      expect(results).toEqual(singleCategoryGroup)
    })
  })
})

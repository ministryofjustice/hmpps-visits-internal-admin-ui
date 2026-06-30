import CategoryGroupService from './categoryGroupService'
import TestData from '../routes/testutils/testData'
import { createMockVisitSchedulerApiClient } from '../data/testutils/mocks'

describe('Category group service', () => {
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let categoryGroupService: CategoryGroupService

  const singleCategoryGroup = TestData.categoryGroup()
  const categoryGroups = [TestData.categoryGroup()]
  const createCategoryGroupDto = TestData.createCategoryGroupDto()

  beforeEach(() => {
    categoryGroupService = new CategoryGroupService(visitSchedulerApiClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getSingleCategoryGroup', () => {
    it('should return a category group', async () => {
      visitSchedulerApiClient.getSingleCategoryGroup.mockResolvedValue(singleCategoryGroup)

      const results = await categoryGroupService.getSingleCategoryGroup(singleCategoryGroup.reference)

      expect(results).toEqual(singleCategoryGroup)
      expect(visitSchedulerApiClient.getSingleCategoryGroup).toHaveBeenCalledWith(singleCategoryGroup.reference)
    })
  })

  describe('getCategoryGroups', () => {
    it('should return an array of all category groups for a prison', async () => {
      visitSchedulerApiClient.getCategoryGroups.mockResolvedValue(categoryGroups)

      const results = await categoryGroupService.getCategoryGroups('HEI')

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

  describe('deleteCategoryGroup', () => {
    it('should delete a category group', async () => {
      await categoryGroupService.deleteCategoryGroup('user', singleCategoryGroup.reference)
      expect(visitSchedulerApiClient.deleteCategoryGroup).toHaveBeenCalledWith(singleCategoryGroup.reference)
    })
  })
})

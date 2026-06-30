import { createMockVisitSchedulerApiClient } from '../data/testutils/mocks'
import ExcludeDateService from './excludeDateService'

describe('Exclude date service', () => {
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let excludeDateService: ExcludeDateService

  const excludeDate = '2023-07-06'
  const prisonCode = 'HEI'
  const username = 'user'

  beforeEach(() => {
    excludeDateService = new ExcludeDateService(visitSchedulerApiClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('addExcludeDate', () => {
    it('should add an exclude date to a prison', async () => {
      await excludeDateService.addExcludeDate('user', prisonCode, excludeDate)
      expect(visitSchedulerApiClient.addExcludeDate).toHaveBeenCalledWith('HEI', excludeDate, username)
    })
  })

  describe('removeExcludeDate', () => {
    it('should remove an exclude date to a prison', async () => {
      await excludeDateService.removeExcludeDate('user', prisonCode, excludeDate)
      expect(visitSchedulerApiClient.removeExcludeDate).toHaveBeenCalledWith('HEI', excludeDate, username)
    })
  })
})

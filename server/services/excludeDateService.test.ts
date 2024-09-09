import { createMockHmppsAuthClient, createMockVisitSchedulerApiClient } from '../data/testutils/mocks'
import ExcludeDateService from './excludeDateService'

const token = 'some token'

describe('Category group service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let excludeDateService: ExcludeDateService

  const VisitSchedulerApiClientFactory = jest.fn()

  const excludeDate = '2023-07-06'
  const prisonCode = 'HEI'
  const username = 'user'

  beforeEach(() => {
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    excludeDateService = new ExcludeDateService(VisitSchedulerApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
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

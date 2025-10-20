import TestData from '../routes/testutils/testData'
import { createMockHmppsAuthClient, createMockVisitAllocationApiClient } from '../data/testutils/mocks'
import VisitAllocationService from './visitAllocationService'

const token = 'some token'

describe('Visit allocation service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const visitAllocationApiClient = createMockVisitAllocationApiClient()

  let visitAllocationService: VisitAllocationService

  const VisitAllocationApiClientFactory = jest.fn()

  const prisonCode = 'HEI'

  beforeEach(() => {
    VisitAllocationApiClientFactory.mockReturnValue(visitAllocationApiClient)
    visitAllocationService = new VisitAllocationService(VisitAllocationApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('resetNegativeBalances', () => {
    it('should reset negative visit balances for prisoners in given prison', async () => {
      visitAllocationApiClient.resetNegativeBalances.mockResolvedValue()
      await visitAllocationService.resetNegativeBalances({ username: 'user', prisonCode })

      expect(visitAllocationApiClient.resetNegativeBalances).toHaveBeenCalledWith(prisonCode)
    })
  })

  describe('getNegativeBalanceCount', () => {
    it('should get negative balance count for given prison', async () => {
      const prisonNegativeBalanceCount = TestData.prisonNegativeBalanceCount()
      visitAllocationApiClient.getNegativeBalanceCount.mockResolvedValue(prisonNegativeBalanceCount)
      const result = await visitAllocationService.getNegativeBalanceCount({ username: 'user', prisonCode })

      expect(result).toStrictEqual(prisonNegativeBalanceCount)
      expect(visitAllocationApiClient.getNegativeBalanceCount).toHaveBeenCalledWith(prisonCode)
    })
  })
})

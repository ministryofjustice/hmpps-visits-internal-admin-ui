import TestData from '../routes/testutils/testData'
import { createMockVisitAllocationApiClient } from '../data/testutils/mocks'
import VisitAllocationService from './visitAllocationService'

describe('Visit allocation service', () => {
  const visitAllocationApiClient = createMockVisitAllocationApiClient()

  let visitAllocationService: VisitAllocationService

  const prisonCode = 'HEI'

  beforeEach(() => {
    visitAllocationService = new VisitAllocationService(visitAllocationApiClient)
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
      const result = await visitAllocationService.getNegativeBalanceCount({ prisonCode })

      expect(result).toStrictEqual(prisonNegativeBalanceCount)
      expect(visitAllocationApiClient.getNegativeBalanceCount).toHaveBeenCalledWith(prisonCode)
    })
  })
})

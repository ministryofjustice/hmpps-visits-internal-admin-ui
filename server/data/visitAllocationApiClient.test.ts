import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import TestData from '../routes/testutils/testData'
import VisitAllocationApiClient from './visitAllocationApiClient'

describe('visitAllocationApiClient', () => {
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  let visitAllocationApiClient: VisitAllocationApiClient

  const prisonCode = 'HEI'

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    visitAllocationApiClient = new VisitAllocationApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('resetNegativeBalances', () => {
    it('should reset negative visit balances for prisoners in given prison', async () => {
      nock(config.apis.visitAllocation.url)
        .post(`/admin/prison/${prisonCode}/reset`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200)

      await visitAllocationApiClient.resetNegativeBalances(prisonCode)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('getNegativeBalanceCount', () => {
    it('should get negative balance count for given prison', async () => {
      const prisonNegativeBalanceCount = TestData.prisonNegativeBalanceCount()

      nock(config.apis.visitAllocation.url)
        .get(`/admin/prison/${prisonCode}/reset/count`)
        .matchHeader('authorization', 'Bearer test-system-token')
        .reply(200, prisonNegativeBalanceCount)

      const output = await visitAllocationApiClient.getNegativeBalanceCount(prisonCode)
      expect(output).toStrictEqual(prisonNegativeBalanceCount)

      expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
    })
  })
})

import nock from 'nock'
import config from '../config'
import TestData from '../routes/testutils/testData'
import VisitAllocationApiClient from './visitAllocationApiClient'

describe('visitAllocationApiClient', () => {
  let fakeVisitAllocationApi: nock.Scope
  let visitAllocationApiClient: VisitAllocationApiClient
  const token = 'token-1'

  const prisonCode = 'HEI'

  beforeEach(() => {
    fakeVisitAllocationApi = nock(config.apis.prisonRegister.url)
    visitAllocationApiClient = new VisitAllocationApiClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('resetNegativeBalances', () => {
    it('should reset negative visit balances for prisoners in given prison', async () => {
      fakeVisitAllocationApi
        .post(`/admin/prison/${prisonCode}/reset`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200)

      await visitAllocationApiClient.resetNegativeBalances(prisonCode)
      expect(fakeVisitAllocationApi.isDone()).toBeTruthy()
    })
  })

  describe('getNegativeBalanceCount', () => {
    it('should get negative balances for given prison', async () => {
      const prisonNegativeBalanceCount = TestData.prisonNegativeBalanceCount()

      fakeVisitAllocationApi
        .get(`/admin/prison/${prisonCode}/reset/count`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prisonNegativeBalanceCount)

      const output = await visitAllocationApiClient.getNegativeBalanceCount(prisonCode)
      expect(output).toStrictEqual(prisonNegativeBalanceCount)
    })
  })
})

import nock from 'nock'
import config from '../config'
import VisitSchedulerApiClient from './visitSchedulerApiClient'

describe('visitSchedulerApiClient', () => {
  let fakeVisitSchedulerApi: nock.Scope
  let visitSchedulerApiClient: VisitSchedulerApiClient
  const token = 'token-1'

  beforeEach(() => {
    fakeVisitSchedulerApi = nock(config.apis.visitScheduler.url)
    visitSchedulerApiClient = new VisitSchedulerApiClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getSupportedPrisonIds', () => {
    it('should return an array of supported prison IDs', async () => {
      const results = ['BLI', 'HEI']

      fakeVisitSchedulerApi
        .get('/config/prisons/supported')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, results)

      const output = await visitSchedulerApiClient.getSupportedPrisonIds()

      expect(output).toEqual(results)
    })
  })
})

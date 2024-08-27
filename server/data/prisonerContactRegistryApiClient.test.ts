import nock from 'nock'
import config from '../config'
import TestData from '../routes/testutils/testData'
import PrisonerContactRegistryApiClient from './prisonerContactRegistryApiClient'

describe('prisonerContactRegistryApiClient', () => {
  let fakePrisonerContactRegistryApi: nock.Scope
  let prisonerContactRegistryApiClient: PrisonerContactRegistryApiClient
  const token = 'token-1'

  beforeEach(() => {
    fakePrisonerContactRegistryApi = nock(config.apis.prisonRegister.url)
    prisonerContactRegistryApiClient = new PrisonerContactRegistryApiClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getSocialContacts', () => {
    it('should call get social contacts for given prisoner ID and approvedOnly flag', async () => {
      const prisoner = TestData.permittedPrisonerDto()
      const contacts = [TestData.contact()]
      const approvedOnly = true

      fakePrisonerContactRegistryApi
        .get(`/prisoners/${prisoner.prisonerId}/contacts/social`)
        .query({
          approvedVisitorsOnly: approvedOnly,
          hasDateOfBirth: true,
          withAddress: false,
        })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, contacts)

      const output = await prisonerContactRegistryApiClient.getSocialContacts({
        prisonerId: prisoner.prisonerId,
        approvedOnly,
      })
      expect(output).toStrictEqual(contacts)
    })
  })
})

import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import TestData from '../routes/testutils/testData'
import BookerRegistryApiClient from './bookerRegistryApiClient'
import {
  CreatePermittedPrisonerDto,
  SearchBookerDto,
  UpdateRegisteredPrisonersPrisonDto,
} from './bookerRegistryApiTypes'

describe('bookerRegistryApiClient', () => {
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>
  let bookerRegistryApiClient: BookerRegistryApiClient

  const booker = TestData.bookerDto()
  const prisoner = TestData.permittedPrisonerDto()

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn().mockResolvedValue('test-system-token'),
    } as unknown as jest.Mocked<AuthenticationClient>

    bookerRegistryApiClient = new BookerRegistryApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('Booker', () => {
    describe('getBookerByReference', () => {
      it('should get booker details for given reference', async () => {
        nock(config.apis.bookerRegistry.url)
          .get(`/public/booker/config/${booker.reference}`)
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(200, booker)

        const output = await bookerRegistryApiClient.getBookerByReference(booker.reference)
        expect(output).toStrictEqual(booker)
        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })

      it('should return null if booker is not found for given reference', async () => {
        nock(config.apis.bookerRegistry.url)
          .get(`/public/booker/config/${booker.reference}`)
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(404)

        const output = await bookerRegistryApiClient.getBookerByReference(booker.reference)
        expect(output).toBeNull()
        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })
    })

    describe('getBookersByEmail', () => {
      it('should get booker details for given email', async () => {
        nock(config.apis.bookerRegistry.url)
          .post('/public/booker/config/search', <SearchBookerDto>{ email: booker.email })
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(200, [booker])

        const output = await bookerRegistryApiClient.getBookersByEmail(booker.email)
        expect(output).toStrictEqual([booker])
        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })

      it('should return null if no bookers are found for given email', async () => {
        nock(config.apis.bookerRegistry.url)
          .post('/public/booker/config/search', <SearchBookerDto>{ email: booker.email })
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(404)

        const output = await bookerRegistryApiClient.getBookersByEmail(booker.email)
        expect(output).toBeNull()
        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })
    })

    describe('clearBookerDetails', () => {
      it('should get booker details for given email', async () => {
        nock(config.apis.bookerRegistry.url)
          .delete(`/public/booker/config/${booker.reference}`)
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(200, booker)

        const output = await bookerRegistryApiClient.clearBookerDetails(booker.reference)
        expect(output).toStrictEqual(booker)
        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Prisoner', () => {
    describe('addPrisoner', () => {
      it('should call add prisoner for given booker reference and prisoner ID', async () => {
        nock(config.apis.bookerRegistry.url)
          .put(`/public/booker/config/${booker.reference}/prisoner`, <CreatePermittedPrisonerDto>{
            prisonerId: prisoner.prisonerId,
            prisonCode: prisoner.prisonCode,
          })
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(201, prisoner)

        const output = await bookerRegistryApiClient.addPrisoner(
          booker.reference,
          prisoner.prisonerId,
          prisoner.prisonCode,
        )
        expect(output).toStrictEqual(prisoner)
        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })
    })

    describe('updateRegisteredPrison', () => {
      it('should update registered prison for given booker reference and prisoner ID', async () => {
        const newPrisonId = 'ABC'

        nock(config.apis.bookerRegistry.url)
          .put(`/public/booker/config/${booker.reference}/prisoner/${prisoner.prisonerId}/prison`, <
            UpdateRegisteredPrisonersPrisonDto
          >{
            prisonId: newPrisonId,
          })
          .matchHeader('authorization', 'Bearer test-system-token')
          .reply(201, prisoner)

        await bookerRegistryApiClient.updateRegisteredPrison(booker.reference, prisoner.prisonerId, newPrisonId)
        expect(mockAuthenticationClient.getToken).toHaveBeenCalledTimes(1)
      })
    })
  })
})

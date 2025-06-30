import TestData from '../routes/testutils/testData'
import { createMockBookerRegistryApiClient, createMockHmppsAuthClient } from '../data/testutils/mocks'
import BookerService from './bookerService'

const token = 'some token'

describe('Booker service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const bookerRegistryApiClient = createMockBookerRegistryApiClient()

  let bookerService: BookerService

  const BookerRegistryApiClientFactory = jest.fn()

  const booker = TestData.bookerDto()
  const prisoner = TestData.permittedPrisonerDto()
  const visitorId = 1234

  beforeEach(() => {
    BookerRegistryApiClientFactory.mockReturnValue(bookerRegistryApiClient)
    bookerService = new BookerService(BookerRegistryApiClientFactory, hmppsAuthClient)

    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Booker', () => {
    describe('getBookerByReference', () => {
      it('should get booker details given booker reference', async () => {
        bookerRegistryApiClient.getBookerByReference.mockResolvedValue(booker)
        const results = await bookerService.getBookerByReference('user', booker.reference)

        expect(bookerRegistryApiClient.getBookerByReference).toHaveBeenCalledWith(booker.reference)
        expect(results).toStrictEqual(booker)
      })
    })

    describe('getBookersByEmailOrReference', () => {
      it('should get booker details given email address', async () => {
        bookerRegistryApiClient.getBookersByEmail.mockResolvedValue([booker])
        const results = await bookerService.getBookersByEmailOrReference('user', booker.email)

        expect(bookerRegistryApiClient.getBookersByEmail).toHaveBeenCalledWith(booker.email)
        expect(bookerRegistryApiClient.getBookerByReference).not.toHaveBeenCalled()
        expect(results).toStrictEqual([booker])
      })

      it('should get booker details given reference', async () => {
        bookerRegistryApiClient.getBookerByReference.mockResolvedValue(booker)
        const results = await bookerService.getBookersByEmailOrReference('user', booker.reference)

        expect(bookerRegistryApiClient.getBookerByReference).toHaveBeenCalledWith(booker.reference)
        expect(bookerRegistryApiClient.getBookersByEmail).not.toHaveBeenCalled()
        expect(results).toStrictEqual([booker])
      })
    })

    describe('clearBookerDetails', () => {
      it('should clear booker details given booker reference', async () => {
        bookerRegistryApiClient.clearBookerDetails.mockResolvedValue(booker)
        const results = await bookerService.clearBookerDetails('user', booker.reference)

        expect(bookerRegistryApiClient.clearBookerDetails).toHaveBeenCalledWith(booker.reference)
        expect(results).toStrictEqual(booker)
      })
    })
  })

  describe('Prisoner', () => {
    describe('addPrisoner', () => {
      it('should add prisoner to booker', async () => {
        bookerRegistryApiClient.addPrisoner.mockResolvedValue(prisoner)
        const results = await bookerService.addPrisoner(
          'user',
          booker.reference,
          prisoner.prisonerId,
          prisoner.prisonCode,
        )

        expect(bookerRegistryApiClient.addPrisoner).toHaveBeenCalledWith(
          booker.reference,
          prisoner.prisonerId,
          prisoner.prisonCode,
        )
        expect(results).toStrictEqual(prisoner)
      })
    })

    describe('updateRegisteredPrison', () => {
      it('should update registered prison for a given booker reference and prison ID', async () => {
        const newPrisonId = 'ABC'
        bookerRegistryApiClient.updateRegisteredPrison.mockResolvedValue()

        await bookerService.updateRegisteredPrison('user', booker.reference, prisoner.prisonerId, newPrisonId)

        expect(bookerRegistryApiClient.updateRegisteredPrison).toHaveBeenCalledWith(
          booker.reference,
          prisoner.prisonerId,
          newPrisonId,
        )
      })
    })

    describe('activatePrisoner', () => {
      it('should activate prisoner for booker', async () => {
        bookerRegistryApiClient.activatePrisoner.mockResolvedValue()
        await bookerService.activatePrisoner('user', booker.reference, prisoner.prisonerId)

        expect(bookerRegistryApiClient.activatePrisoner).toHaveBeenCalledWith(booker.reference, prisoner.prisonerId)
      })
    })

    describe('deactivatePrisoner', () => {
      it('should deactivate prisoner for booker', async () => {
        bookerRegistryApiClient.deactivatePrisoner.mockResolvedValue()
        await bookerService.deactivatePrisoner('user', booker.reference, prisoner.prisonerId)

        expect(bookerRegistryApiClient.deactivatePrisoner).toHaveBeenCalledWith(booker.reference, prisoner.prisonerId)
      })
    })
  })

  describe('Visitor', () => {
    describe('addVisitor', () => {
      it('should add visitor to given prisoner and booker', async () => {
        bookerRegistryApiClient.addVisitor.mockResolvedValue()
        await bookerService.addVisitor('user', booker.reference, prisoner.prisonerId, visitorId)

        expect(bookerRegistryApiClient.addVisitor).toHaveBeenCalledWith(
          booker.reference,
          prisoner.prisonerId,
          visitorId,
        )
      })
    })

    describe('activateVisitor', () => {
      it('should activate visitor for prisoner and booker', async () => {
        bookerRegistryApiClient.activateVisitor.mockResolvedValue()
        await bookerService.activateVisitor('user', booker.reference, prisoner.prisonerId, visitorId)

        expect(bookerRegistryApiClient.activateVisitor).toHaveBeenCalledWith(
          booker.reference,
          prisoner.prisonerId,
          visitorId,
        )
      })
    })

    describe('deactivateVisitor', () => {
      it('should deactivate visitor for prisoner and booker', async () => {
        bookerRegistryApiClient.deactivateVisitor.mockResolvedValue()
        await bookerService.deactivateVisitor('user', booker.reference, prisoner.prisonerId, visitorId)

        expect(bookerRegistryApiClient.deactivateVisitor).toHaveBeenCalledWith(
          booker.reference,
          prisoner.prisonerId,
          visitorId,
        )
      })
    })
  })
})

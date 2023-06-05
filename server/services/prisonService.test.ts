import { NotFound } from 'http-errors'
import PrisonService from './prisonService'
import TestData from '../routes/testutils/testData'
import {
  createMockHmppsAuthClient,
  createMockPrisonRegisterApiClient,
  createMockVisitSchedulerApiClient,
} from '../data/testutils/mocks'
import { createMockPrisonService } from './testutils/mocks'

const token = 'some token'

describe('Supported prisons service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const prisonRegisterApiClient = createMockPrisonRegisterApiClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()
  const fakePrisonService = createMockPrisonService()

  let supportedPrisonsService: PrisonService

  const PrisonRegisterApiClientFactory = jest.fn()
  const VisitSchedulerApiClientFactory = jest.fn()

  const allPrisons = TestData.prisons()
  const prison = TestData.prison()
  const prisonRegisterPrisons = TestData.prisonRegisterPrisons()

  beforeEach(() => {
    PrisonRegisterApiClientFactory.mockReturnValue(prisonRegisterApiClient)
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    supportedPrisonsService = new PrisonService(
      VisitSchedulerApiClientFactory,
      PrisonRegisterApiClientFactory,
      hmppsAuthClient,
    )

    prisonRegisterApiClient.getPrisons.mockResolvedValue(prisonRegisterPrisons)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getAllPrisons', () => {
    it('should return an array of all supported Prisons', async () => {
      visitSchedulerApiClient.getAllPrisons.mockResolvedValue(allPrisons)

      const results = await supportedPrisonsService.getAllPrisons('user')

      expect(results).toEqual(allPrisons)
    })
  })

  describe('getPrison', () => {
    it('should return an array of all supported Prisons', async () => {
      visitSchedulerApiClient.getPrison.mockResolvedValue(prison)
      const prisonName = 'Hewell (HMP)'
      const results = await supportedPrisonsService.getPrison('user', 'HEI')

      expect(results).toEqual({
        prison,
        prisonName,
      })
    })
  })

  describe('getPrisonName', () => {
    it('should return prison name for given prison ID', async () => {
      const results = await supportedPrisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)
      expect(results).toBe(prisonRegisterPrisons[0].prisonName)
    })

    it('should throw a 404 error if no name found for prison ID', async () => {
      await expect(supportedPrisonsService.getPrisonName('user', 'XYZ')).rejects.toThrow(NotFound)
    })
  })

  describe('getPrisonNames', () => {
    it('should return object with all prisonId / prisonNames as key / value', async () => {
      const results = await supportedPrisonsService.getPrisonNames('user')
      expect(results).toStrictEqual({
        [prisonRegisterPrisons[0].prisonId]: prisonRegisterPrisons[0].prisonName,
        [prisonRegisterPrisons[1].prisonId]: prisonRegisterPrisons[1].prisonName,
        [prisonRegisterPrisons[2].prisonId]: prisonRegisterPrisons[2].prisonName,
      })
    })
  })

  describe('activatePrison', () => {
    it('should change prison to active', async () => {
      await fakePrisonService.activatePrison('user', 'HEI')
      expect(fakePrisonService.activatePrison).toHaveBeenCalledTimes(1)
      expect(fakePrisonService.activatePrison).toHaveBeenCalledWith('user', 'HEI')
    })
  })

  // describe('createPrison', () => {
  //   it('should set validation errors if no establishment selected', async () => {
  //     supportedPrisonsService.createPrison.mockResolvedValue()
  //     const result = await supportedPrisonsService.createPrison('BLI', 'user')

  //     expect(supportedPrisonsService.createPrison).toHaveBeenCalledTimes(1)
  //     expect(supportedPrisonsService.createPrison).toHaveBeenCalledWith('BLI', 'user')
  //     expect(result).toEqual(null)
  //   })
  // })

  describe('API response caching', () => {
    it('should call Prison register API to get all prison names and then use internal cache for subsequent calls', async () => {
      const results = []

      results[0] = await supportedPrisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)
      results[1] = await supportedPrisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)

      expect(results[0]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(results[1]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(prisonRegisterApiClient.getPrisons).toHaveBeenCalledTimes(1)
    })

    it('should refresh internal cache of all prisons after 24 hours', async () => {
      jest.useFakeTimers()

      const A_DAY_IN_MS = 24 * 60 * 60 * 1000
      const results = []

      results[0] = await supportedPrisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)
      results[1] = await supportedPrisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)
      jest.advanceTimersByTime(A_DAY_IN_MS)
      results[2] = await supportedPrisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)

      expect(results[0]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(results[1]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(results[2]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(prisonRegisterApiClient.getPrisons).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })
  })
})

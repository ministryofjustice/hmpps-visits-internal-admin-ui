import { NotFound } from 'http-errors'
import PrisonService from './prisonService'
import TestData from '../routes/testutils/testData'
import {
  createMockHmppsAuthClient,
  createMockPrisonRegisterApiClient,
  createMockVisitSchedulerApiClient,
} from '../data/testutils/mocks'

const token = 'some token'

describe('Prisons service', () => {
  const hmppsAuthClient = createMockHmppsAuthClient()
  const prisonRegisterApiClient = createMockPrisonRegisterApiClient()
  const visitSchedulerApiClient = createMockVisitSchedulerApiClient()

  let prisonsService: PrisonService

  const PrisonRegisterApiClientFactory = jest.fn()
  const VisitSchedulerApiClientFactory = jest.fn()

  const prisonDto = TestData.prisonDto()
  const prison = TestData.prison()
  const prisonRegisterPrisons = TestData.prisonRegisterPrisons()

  beforeEach(() => {
    PrisonRegisterApiClientFactory.mockReturnValue(prisonRegisterApiClient)
    VisitSchedulerApiClientFactory.mockReturnValue(visitSchedulerApiClient)
    prisonsService = new PrisonService(VisitSchedulerApiClientFactory, PrisonRegisterApiClientFactory, hmppsAuthClient)

    prisonRegisterApiClient.getPrisons.mockResolvedValue(prisonRegisterPrisons)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getPrison', () => {
    it('should return a Prison', async () => {
      visitSchedulerApiClient.getPrison.mockResolvedValue(prisonDto)
      const results = await prisonsService.getPrison('user', prisonDto.code)

      expect(results).toStrictEqual(prison)
    })

    it('should return Prison with UNKNOWN name if not in prison register', async () => {
      const prisonDtoNotInRegister = TestData.prisonDto({ code: 'XYZ' })
      const prisonNotInRegister = TestData.prison({ ...prisonDtoNotInRegister, name: 'UNKNOWN' })

      visitSchedulerApiClient.getPrison.mockResolvedValue(prisonDtoNotInRegister)
      const results = await prisonsService.getPrison('user', prisonDtoNotInRegister.code)

      expect(results).toStrictEqual(prisonNotInRegister)
    })
  })

  describe('getAllPrisons', () => {
    const allPrisonDtos = TestData.prisonDtos()
    const allPrisons = TestData.prisons()

    it('should return an array of all supported Prisons', async () => {
      visitSchedulerApiClient.getAllPrisons.mockResolvedValue(allPrisonDtos)

      const results = await prisonsService.getAllPrisons('user')

      expect(results).toStrictEqual(allPrisons)
    })

    it('should return an array of all supported Prisons sorted by prison name', async () => {
      const unsortedPrisonDtos = [allPrisonDtos[2], allPrisonDtos[0], allPrisonDtos[1]]
      visitSchedulerApiClient.getAllPrisons.mockResolvedValue(unsortedPrisonDtos)

      const results = await prisonsService.getAllPrisons('user')

      expect(results).toStrictEqual(allPrisons)
    })
  })

  describe('Prison contact details', () => {
    const prisonContactDetails = TestData.prisonContactDetails()

    const prisonContactDetailsEmptyStrings = TestData.prisonContactDetails({
      emailAddress: '',
      phoneNumber: '',
      webAddress: '',
    })

    const prisonContactDetailsNulls = TestData.prisonContactDetails({
      emailAddress: null,
      phoneNumber: null,
      webAddress: null,
    })

    describe('getPrisonContactDetails', () => {
      it('should return prison SOCIAL_VISIT contact details from the Prison Register', async () => {
        prisonRegisterApiClient.getPrisonContactDetails.mockResolvedValue(prisonContactDetails)

        const results = await prisonsService.getPrisonContactDetails('user', prison.code)
        expect(results).toStrictEqual(prisonContactDetails)
        expect(prisonRegisterApiClient.getPrisonContactDetails).toHaveBeenCalledWith('HEI')
      })
    })

    describe('createPrisonContactDetails', () => {
      it('should create prison SOCIAL_VISIT contact details for selected prison', async () => {
        prisonRegisterApiClient.createPrisonContactDetails.mockResolvedValue(prisonContactDetails)

        const results = await prisonsService.createPrisonContactDetails('user', prison.code, prisonContactDetails)
        expect(results).toStrictEqual(prisonContactDetails)
        expect(prisonRegisterApiClient.createPrisonContactDetails).toHaveBeenCalledWith('HEI', prisonContactDetails)
      })

      it('should create prison SOCIAL_VISIT contact details for selected prison - with empty values sent as NULL', async () => {
        prisonRegisterApiClient.createPrisonContactDetails.mockResolvedValue(prisonContactDetailsNulls)

        const results = await prisonsService.createPrisonContactDetails(
          'user',
          prison.code,
          prisonContactDetailsEmptyStrings,
        )
        expect(results).toStrictEqual(prisonContactDetailsNulls)
        expect(prisonRegisterApiClient.createPrisonContactDetails).toHaveBeenCalledWith(
          'HEI',
          prisonContactDetailsNulls,
        )
      })
    })

    describe('deletePrisonContactDetails', () => {
      it('should delete prison SOCIAL_VISIT contact details for selected prison', async () => {
        await prisonsService.deletePrisonContactDetails('user', prison.code)
        expect(prisonRegisterApiClient.deletePrisonContactDetails).toHaveBeenCalledWith('HEI')
      })
    })

    describe('updatePrisonContactDetails', () => {
      it('should update prison SOCIAL_VISIT contact details for selected prison', async () => {
        prisonRegisterApiClient.updatePrisonContactDetails.mockResolvedValue(prisonContactDetails)

        const results = await prisonsService.updatePrisonContactDetails('user', prison.code, prisonContactDetails)
        expect(results).toStrictEqual(prisonContactDetails)
        expect(prisonRegisterApiClient.updatePrisonContactDetails).toHaveBeenCalledWith('HEI', prisonContactDetails)
      })

      it('should update prison SOCIAL_VISIT contact details for selected prison - with empty values sent as NULL', async () => {
        prisonRegisterApiClient.updatePrisonContactDetails.mockResolvedValue(prisonContactDetailsNulls)

        const results = await prisonsService.updatePrisonContactDetails(
          'user',
          prison.code,
          prisonContactDetailsEmptyStrings,
        )
        expect(results).toStrictEqual(prisonContactDetailsNulls)
        expect(prisonRegisterApiClient.updatePrisonContactDetails).toHaveBeenCalledWith(
          'HEI',
          prisonContactDetailsNulls,
        )
      })
    })
  })

  describe('createPrison', () => {
    it('should add prison to supported prisons', async () => {
      const newPrison = TestData.prisonDto({ active: false })

      await prisonsService.createPrison('user', prisonDto.code)
      expect(visitSchedulerApiClient.createPrison).toHaveBeenCalledWith(newPrison)
    })
  })

  describe('getPrisonName', () => {
    it('should return prison name for given prison ID', async () => {
      const results = await prisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)
      expect(results).toBe(prisonRegisterPrisons[0].prisonName)
    })

    it('should throw a 404 error if no name found for prison ID', async () => {
      await expect(prisonsService.getPrisonName('user', 'XYZ')).rejects.toThrow(NotFound)
    })
  })

  describe('getPrisonNames', () => {
    it('should return object with all prisonId / prisonNames as key / value', async () => {
      const results = await prisonsService.getPrisonNames('user')
      expect(results).toStrictEqual({
        [prisonRegisterPrisons[0].prisonId]: prisonRegisterPrisons[0].prisonName,
        [prisonRegisterPrisons[1].prisonId]: prisonRegisterPrisons[1].prisonName,
        [prisonRegisterPrisons[2].prisonId]: prisonRegisterPrisons[2].prisonName,
      })
    })
  })

  describe('activatePrison', () => {
    it('should change prison to active', async () => {
      await prisonsService.activatePrison('user', prisonDto.code)
      expect(visitSchedulerApiClient.activatePrison).toHaveBeenCalledWith('HEI')
    })
  })

  describe('deactivatePrison', () => {
    it('should change prison to inactive', async () => {
      await prisonsService.deactivatePrison('user', prisonDto.code)
      expect(visitSchedulerApiClient.deactivatePrison).toHaveBeenCalledWith('HEI')
    })
  })

  describe('addExcludeDate', () => {
    it('should add an exclude date to a prison', async () => {
      const excludeDate = '2023-07-06'
      await prisonsService.addExcludeDate('user', prisonDto.code, excludeDate)
      expect(visitSchedulerApiClient.addExcludeDate).toHaveBeenCalledWith('HEI', excludeDate)
    })
  })

  describe('removeExcludeDate', () => {
    it('should remove an exclude date to a prison', async () => {
      const excludeDate = '2023-07-06'
      await prisonsService.removeExcludeDate('user', prisonDto.code, excludeDate)
      expect(visitSchedulerApiClient.removeExcludeDate).toHaveBeenCalledWith('HEI', excludeDate)
    })
  })

  describe('API response caching', () => {
    it('should call Prison register API to get all prison names and then use internal cache for subsequent calls', async () => {
      const results = []

      results[0] = await prisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)
      results[1] = await prisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)

      expect(results[0]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(results[1]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(prisonRegisterApiClient.getPrisons).toHaveBeenCalledTimes(1)
    })

    it('should refresh internal cache of all prisons after 24 hours', async () => {
      jest.useFakeTimers()

      const A_DAY_IN_MS = 24 * 60 * 60 * 1000
      const results = []

      results[0] = await prisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)
      results[1] = await prisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)
      jest.advanceTimersByTime(A_DAY_IN_MS)
      results[2] = await prisonsService.getPrisonName('user', prisonRegisterPrisons[0].prisonId)

      expect(results[0]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(results[1]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(results[2]).toEqual(prisonRegisterPrisons[0].prisonName)
      expect(prisonRegisterApiClient.getPrisons).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })
  })
})

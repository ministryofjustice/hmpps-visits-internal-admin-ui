import type { Express } from 'express'
import { appWithAllRoutes, flashProvider } from '../../testutils/appSetup'
import { createMockPrisonService, createMockSessionTemplateService } from '../../../services/testutils/mocks'
import TestData from '../../testutils/testData'
import { FlashErrorMessage } from '../../../@types/visits-admin'

let app: Express
let flashData: Record<string, string | FlashErrorMessage>

const prisonService = createMockPrisonService()
const sessionTemplateService = createMockSessionTemplateService()

const prisonNames = TestData.prisonNames()
const prison = TestData.prison()
const prisonName = prisonNames[prison.code]

beforeEach(() => {
  flashData = {}
  flashProvider.mockImplementation(key => flashData[key])

  prisonService.getPrison.mockResolvedValue({ prison, prisonName })

  app = appWithAllRoutes({ services: { prisonService, sessionTemplateService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Add / Remove excluded date', () => {
  describe('Show excluded dates', () => {
    it('should render the list of excluded dates', () => {
      expect({}).toEqual({})
    })

    it('should render date added status message set in flash', () => {
      expect({}).toEqual({})
    })

    it('should render any error messages set in flash', () => {
      expect({}).toEqual({})
    })
  })

  describe('Add an excluded date', () => {
    expect({}).toEqual({})
  })

  describe('Remove an excluded date', () => {
    expect({}).toEqual({})
  })
})

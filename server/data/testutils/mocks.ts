import { BookerRegistryApiClient, PrisonRegisterApiClient, VisitAllocationApiClient, VisitSchedulerApiClient } from '..'

jest.mock('..')

export const createMockBookerRegistryApiClient = () =>
  new BookerRegistryApiClient(null) as jest.Mocked<BookerRegistryApiClient>

export const createMockPrisonRegisterApiClient = () =>
  new PrisonRegisterApiClient(null) as jest.Mocked<PrisonRegisterApiClient>

export const createMockVisitAllocationApiClient = () =>
  new VisitAllocationApiClient(null) as jest.Mocked<VisitAllocationApiClient>

export const createMockVisitSchedulerApiClient = () =>
  new VisitSchedulerApiClient(null) as jest.Mocked<VisitSchedulerApiClient>

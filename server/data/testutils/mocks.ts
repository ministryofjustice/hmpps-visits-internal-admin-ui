/* eslint-disable import/first */
/*
 * Import from '..' (server/data/index.ts) fails if applicationInfo not mocked first. This is
 * because paths in it differ between running app (in 'dist') and where ts-jest runs.
 */
import type { ApplicationInfo } from '../../applicationInfo'

const testAppInfo: ApplicationInfo = {
  applicationName: 'test',
  buildNumber: '1',
  gitRef: 'long ref',
  gitShortHash: 'short ref',
  branchName: 'main',
}

jest.mock('../../applicationInfo', () => {
  return jest.fn(() => testAppInfo)
})

import {
  BookerRegistryApiClient,
  HmppsAuthClient,
  PrisonerContactRegistryApiClient,
  PrisonRegisterApiClient,
  VisitAllocationApiClient,
  VisitSchedulerApiClient,
} from '..'

jest.mock('..')

export const createMockHmppsAuthClient = () => new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

export const createMockBookerRegistryApiClient = () =>
  new BookerRegistryApiClient(null) as jest.Mocked<BookerRegistryApiClient>

export const createMockPrisonerContactRegistryApiClient = () =>
  new PrisonerContactRegistryApiClient(null) as jest.Mocked<PrisonerContactRegistryApiClient>

export const createMockPrisonRegisterApiClient = () =>
  new PrisonRegisterApiClient(null) as jest.Mocked<PrisonRegisterApiClient>

export const createMockVisitAllocationApiClient = () =>
  new VisitAllocationApiClient(null) as jest.Mocked<VisitAllocationApiClient>

export const createMockVisitSchedulerApiClient = () =>
  new VisitSchedulerApiClient(null) as jest.Mocked<VisitSchedulerApiClient>

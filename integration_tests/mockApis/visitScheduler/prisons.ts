import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import TestData from '../../../server/routes/testutils/testData'
import {
  PrisonDto,
  PrisonExcludeDateDto,
  PrisonUserClientDto,
  PrisonUserClientType,
  UpdatePrisonDto,
} from '../../../server/data/visitSchedulerApiTypes'

export default {
  stubGetAllPrisons: (prisons: PrisonDto[] = TestData.prisonDtos()): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/visitScheduler/admin/prisons',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisons,
      },
    })
  },
  stubGetPrison: (prison: PrisonDto): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/prisons/prison/${prison.code}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prison,
      },
    })
  },
  stubCreatePrison: (prison: PrisonDto): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/visitScheduler/admin/prisons/prison',
        bodyPatterns: [
          {
            equalToJson: {
              active: prison.active,
              adultAgeYears: prison.adultAgeYears,
              clients: prison.clients,
              code: prison.code,
              excludeDates: prison.excludeDates,
              maxAdultVisitors: prison.maxAdultVisitors,
              maxChildVisitors: prison.maxChildVisitors,
              maxTotalVisitors: prison.maxTotalVisitors,
              policyNoticeDaysMin: prison.policyNoticeDaysMin,
              policyNoticeDaysMax: prison.policyNoticeDaysMax,
            },
          },
        ],
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prison,
      },
    })
  },
  stubUpdatePrison: ({
    prisonDto,
    updatePrisonDto,
  }: {
    prisonDto: PrisonDto
    updatePrisonDto: UpdatePrisonDto
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/admin/prisons/prison/${prisonDto.code}`,
        bodyPatterns: [
          {
            equalToJson: {
              adultAgeYears: updatePrisonDto.adultAgeYears,
              maxAdultVisitors: updatePrisonDto.maxAdultVisitors,
              maxChildVisitors: updatePrisonDto.maxChildVisitors,
              maxTotalVisitors: updatePrisonDto.maxTotalVisitors,
              policyNoticeDaysMin: updatePrisonDto.policyNoticeDaysMin,
              policyNoticeDaysMax: updatePrisonDto.policyNoticeDaysMax,
            },
          },
        ],
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisonDto,
      },
    })
  },
  stubActivatePrisonClientType: ({
    prisonCode,
    type,
  }: {
    prisonCode: string
    type: PrisonUserClientType
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/admin/prisons/prison/${prisonCode}/client/${type}/activate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: <PrisonUserClientDto>{ active: true, userType: type },
      },
    })
  },
  stubDeactivatePrisonClientType: ({
    prisonCode,
    type,
  }: {
    prisonCode: string
    type: PrisonUserClientType
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/admin/prisons/prison/${prisonCode}/client/${type}/deactivate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: <PrisonUserClientDto>{ active: false, userType: type },
      },
    })
  },
  stubActivatePrison: (prisonCode: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/admin/prisons/prison/${prisonCode}/activate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: TestData.prisonDto({ active: true }),
      },
    })
  },
  stubDeactivatePrison: (prisonCode: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/admin/prisons/prison/${prisonCode}/deactivate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: TestData.prisonDto({ active: false }),
      },
    })
  },
  stubGetExcludeDates: ({
    prisonCode,
    excludeDates,
  }: {
    prisonCode: string
    excludeDates: PrisonExcludeDateDto
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/prisons/prison/${prisonCode}/exclude-date`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: excludeDates,
      },
    })
  },
  stubAddExcludeDate: ({
    prisonCode,
    excludeDate,
    actionedBy = 'user1',
  }: {
    prisonCode: string
    excludeDate: string
    actionedBy: string
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/prisons/prison/${prisonCode}/exclude-date/add`,
        bodyPatterns: [
          {
            equalToJson: { excludeDate, actionedBy },
          },
        ],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },
  stubRemoveExcludeDate: ({
    prisonCode,
    excludeDate,
    actionedBy = 'user1',
  }: {
    prisonCode: string
    excludeDate: string
    actionedBy: string
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/prisons/prison/${prisonCode}/exclude-date/remove`,
        bodyPatterns: [
          {
            equalToJson: { excludeDate, actionedBy },
          },
        ],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },
}

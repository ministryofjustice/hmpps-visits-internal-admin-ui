import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { BookerDto, PermittedPrisonerDto } from '../../server/data/bookerRegistryApiTypes'

export default {
  stubGetBookerByReference: ({ booker }: { booker: BookerDto }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/bookerRegistry/public/booker/config/${booker.reference}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: booker,
      },
    })
  },

  stubGetBookersByEmail: ({ email, bookers }: { email: string; bookers: BookerDto[] }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/bookerRegistry/public/booker/config/search',
        bodyPatterns: [
          {
            equalToJson: { email },
          },
        ],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: bookers,
      },
    })
  },

  stubCreateBookerPrisoner: ({
    booker,
    prisoner,
  }: {
    booker: BookerDto
    prisoner: PermittedPrisonerDto
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/bookerRegistry/public/booker/config/${booker.reference}/prisoner`,
        bodyPatterns: [
          {
            equalToJson: {
              prisonerId: prisoner.prisonerId,
              active: true,
              prisonCode: prisoner.prisonCode,
            },
          },
        ],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisoner,
      },
    })
  },

  stubClearBookerDetails: (booker: BookerDto): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'DELETE',
        url: `/bookerRegistry/public/booker/config/${booker.reference}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...booker, permittedPrisoners: [] },
      },
    })
  },

  stubBookerRegistryPing: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/bookerRegistry/health/ping',
      },
      response: {
        status: 200,
      },
    })
  },
}

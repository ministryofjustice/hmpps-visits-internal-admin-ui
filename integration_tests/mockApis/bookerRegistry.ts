import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { BookerDto, PermittedPrisonerDto } from '../../server/data/bookerRegistryApiTypes'
import { ContactDto } from '../../server/data/prisonerContactRegistryApiTypes'

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

  stubCreateBookerPrisonerVisitor: ({
    booker,
    prisoner,
    contact,
  }: {
    booker: BookerDto
    prisoner: PermittedPrisonerDto
    contact: ContactDto
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/bookerRegistry/public/booker/config/${booker.reference}/prisoner/${prisoner.prisonerId}/visitor`,
        bodyPatterns: [
          {
            equalToJson: {
              visitorId: contact.personId,
              active: true,
            },
          },
        ],
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { visitorId: contact.personId, active: true },
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

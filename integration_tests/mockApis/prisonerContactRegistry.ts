import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { ContactDto } from '../../server/data/prisonerContactRegistryApiTypes'

export default {
  stubGetAllSocialContacts: ({
    prisonerId,
    contacts,
  }: {
    prisonerId: string
    contacts: ContactDto[]
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/prisonerContactRegistry/v2/prisoners/${prisonerId}/contacts/social`,
        queryParameters: {
          hasDateOfBirth: { equalTo: 'false' },
          withAddress: { equalTo: 'false' },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: contacts,
      },
    })
  },

  stubGetApprovedSocialContacts: ({
    prisonerId,
    contacts,
  }: {
    prisonerId: string
    contacts: ContactDto[]
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        urlPath: `/prisonerContactRegistry/v2/prisoners/${prisonerId}/contacts/social/approved`,
        queryParameters: {
          hasDateOfBirth: { equalTo: 'false' },
          withAddress: { equalTo: 'false' },
        },
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: contacts,
      },
    })
  },
}

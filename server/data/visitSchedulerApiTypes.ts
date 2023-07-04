import { components, operations } from '../@types/visit-scheduler-api'

export type SessionLocationGroup = components['schemas']['SessionLocationGroupDto']

export type Prison = components['schemas']['PrisonDto']

export type SessionTemplate = components['schemas']['SessionTemplateDto']
export type SessionTemplatesRangeType = operations['getSessionTemplates']['parameters']['query']['rangeType']

export type CreateSessionTemplateDto = components['schemas']['CreateSessionTemplateDto']

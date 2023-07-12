import { components, operations } from '../@types/visit-scheduler-api'

// Category groups
export type CategoryGroup = components['schemas']['SessionCategoryGroupDto']

// Incentive groups
export type IncentiveLevelGroup = components['schemas']['SessionIncentiveLevelGroupDto']

// Location groups
export type LocationGroup = components['schemas']['SessionLocationGroupDto']
export type CreateLocationGroupDto = components['schemas']['CreateLocationGroupDto']

// Prison
export type PrisonDto = components['schemas']['PrisonDto']

// Session templates
export type CreateSessionTemplateDto = components['schemas']['CreateSessionTemplateDto']
export type SessionTemplate = components['schemas']['SessionTemplateDto']
export type SessionTemplatesRangeType = operations['getSessionTemplates']['parameters']['query']['rangeType']

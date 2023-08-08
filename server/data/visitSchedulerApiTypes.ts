import { components, operations } from '../@types/visit-scheduler-api'

// Category groups
export type CategoryGroup = components['schemas']['SessionCategoryGroupDto']
export type CreateCategoryGroupDto = components['schemas']['CreateCategoryGroupDto']
export type PrisonerCategories = CategoryGroup['categories'][number]

// Incentive groups
export type IncentiveLevelGroup = components['schemas']['SessionIncentiveLevelGroupDto']
export type CreateIncentiveGroupDto = components['schemas']['CreateIncentiveGroupDto']
export type IncentiveLevels = IncentiveLevelGroup['incentiveLevels'][number]

// Location groups
export type LocationGroup = components['schemas']['SessionLocationGroupDto']
export type CreateLocationGroupDto = components['schemas']['CreateLocationGroupDto']

// Prison
export type PrisonDto = components['schemas']['PrisonDto']

// Session templates
export type CreateSessionTemplateDto = components['schemas']['CreateSessionTemplateDto']
export type SessionTemplate = components['schemas']['SessionTemplateDto']
export type SessionTemplatesRangeType = operations['getSessionTemplates']['parameters']['query']['rangeType']
export type UpdateSessionTemplateDto = components['schemas']['UpdateSessionTemplateDto']

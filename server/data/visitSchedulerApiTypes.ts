import { components, operations } from '../@types/visit-scheduler-api'

// Category groups
export type CategoryGroup = components['schemas']['SessionCategoryGroupDto']
export type CreateCategoryGroupDto = components['schemas']['CreateCategoryGroupDto']
export type PrisonerCategories = CategoryGroup['categories'][number]

// Incentive groups
export type IncentiveGroup = components['schemas']['SessionIncentiveLevelGroupDto']
export type CreateIncentiveGroupDto = components['schemas']['CreateIncentiveGroupDto']
export type IncentiveLevels = IncentiveGroup['incentiveLevels'][number]

// Location groups
export type LocationGroup = components['schemas']['SessionLocationGroupDto']
export type CreateLocationGroupDto = components['schemas']['CreateLocationGroupDto']

// Prison
export type PrisonDto = components['schemas']['PrisonDto']
export type PrisonUserClientType = components['schemas']['PrisonUserClientDto']['userType']
export type PrisonUserClientDto = components['schemas']['PrisonUserClientDto']
export type UpdatePrisonDto = components['schemas']['UpdatePrisonDto']

// Session templates
export type CreateSessionTemplateDto = components['schemas']['CreateSessionTemplateDto']
export type SessionTemplate = components['schemas']['SessionTemplateDto']
export type SessionTemplatesRangeType = operations['getSessionTemplates']['parameters']['query']['rangeType']
export type UpdateSessionTemplateDto = components['schemas']['UpdateSessionTemplateDto']
export type RequestSessionTemplateVisitStatsDto = components['schemas']['RequestSessionTemplateVisitStatsDto']
export type SessionCapacity = components['schemas']['SessionCapacityDto']
export type SessionTemplateVisitStatsDto = components['schemas']['SessionTemplateVisitStatsDto']

// Visits
export type PageVisitDto = components['schemas']['PageVisitDto']

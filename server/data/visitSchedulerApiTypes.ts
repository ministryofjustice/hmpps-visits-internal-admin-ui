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
export type UpdateLocationGroupDto = components['schemas']['UpdateLocationGroupDto']

// Prison
// A prison always has exactly one STAFF client, and optionally one PUBLIC client (SYSTEM / PRISONER are not used)
export type PrisonUserClientDto = components['schemas']['PrisonUserClientDto']
export type StaffPrisonUserClientDto = PrisonUserClientDto & { userType: 'STAFF' }
export type PublicPrisonUserClientDto = PrisonUserClientDto & { userType: 'PUBLIC' }
export type PrisonDto = Omit<components['schemas']['PrisonDto'], 'clients'> & {
  clients: [StaffPrisonUserClientDto] | [StaffPrisonUserClientDto, PublicPrisonUserClientDto]
}
export type UserClientType = components['schemas']['UserClientDto']['userType']
export type UserClientDto = components['schemas']['UserClientDto']
export type UpdatePrisonDto = components['schemas']['UpdatePrisonDto']

// Session templates
export type CreateSessionTemplateDto = components['schemas']['CreateSessionTemplateDto']
export type SessionTemplate = components['schemas']['SessionTemplateDto']
export type SessionTemplatesRangeType = operations['getSessionTemplates']['parameters']['query']['rangeType']
export type UpdateSessionTemplateDto = components['schemas']['UpdateSessionTemplateDto']
export type RequestSessionTemplateVisitStatsDto = components['schemas']['RequestSessionTemplateVisitStatsDto']
export type SessionCapacity = components['schemas']['SessionCapacityDto']
export type SessionTemplateVisitStatsDto = components['schemas']['SessionTemplateVisitStatsDto']
export type VisitOrderRestrictions = components['schemas']['SessionTemplateDto']['visitOrderRestriction']

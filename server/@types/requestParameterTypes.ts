export interface BookerParams {
  reference: string
}

export interface BookerPrisonerParams {
  reference: string
  prisonerId: string
}

export interface PrisonParams {
  prisonId: string
}

export interface PrisonReferenceParams {
  prisonId: string
  reference: string
}

export interface PrisonActionParams {
  action: 'add' | 'edit'
  prisonId: string
}

import { ValidationError } from 'express-validator'

export type FlashErrorMessage = ValidationError[] | Record<'msg', string>[]

import { FieldValidationError } from 'express-validator'
import { FlashErrorMessage, FlashFormValues, MoJAlert } from '../visits-admin'
import type { UserDetails } from '../../services/userService'
import { BookerDto } from '../../data/bookerRegistryApiTypes'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number

    bookerSearchResults: BookerDto[]
  }
}

export declare global {
  namespace Express {
    interface User extends Partial<UserDetails> {
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      flash(type: 'errors', message: FieldValidationError[] | FlashErrorMessage[]): number
      flash(type: 'errors'): FieldValidationError[] | FlashErrorMessage[]

      flash(type: 'formValues', message: FlashFormValues): number
      flash(type: 'formValues'): FlashFormValues[]

      flash(type: 'messages', message: MoJAlert): number
      flash(type: 'messages'): MoJAlert[]

      logout(done: (err: unknown) => void): void
    }

    interface Locals {
      user: Express.User
    }
  }
}

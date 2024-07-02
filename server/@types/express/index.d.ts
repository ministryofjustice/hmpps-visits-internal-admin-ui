import { FlashErrorMessage } from '../visits-admin'
import type { UserDetails } from '../../services/userService'
import { BookerDto } from '../../data/bookerRegistryApiTypes'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number

    // Current booker for booker management
    booker?: BookerDto
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
      flash(type: 'errors', message: FlashErrorMessage): number

      flash(type: 'formValues', message: Record<string, string | string[]>): number
      flash(type: 'formValues'): [Record<string, string | string[]>]

      flash(type: 'message', message: Record<string, string | string[]>): number
      logout(done: (err: unknown) => void): void
    }

    interface Locals {
      user: Express.User
    }
  }
}

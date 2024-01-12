import { FlashErrorMessage } from '../visits-admin'
import type { UserDetails } from '../../services/userService'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
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
      logout(done: (err: unknown) => void): void
    }

    interface Locals {
      user: Express.User
    }
  }
}

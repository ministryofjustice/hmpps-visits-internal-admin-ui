/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/register/auth': {
    /**
     * Authenticate one login details against pre populated bookers
     * @description Authenticate one login details against pre populated bookers and return BookerReference object to be used for all other api calls for booker information
     */
    put: operations['bookerAuthorisation']
  }
  '/public/booker/config': {
    /**
     * Create or Update bookers details
     * @description Create or Update bookers details
     */
    put: operations['createOrUpdateBookerDetails']
  }
  '/public/booker/{bookerReference}/permitted/prisoners': {
    /**
     * Get permitted prisoners associated with a booker.
     * @description Get permitted prisoners associated with a booker.
     */
    get: operations['getPermittedPrisonersForBooker']
  }
  '/public/booker/{bookerReference}/permitted/prisoners/{prisonerId}/permitted/visitors': {
    /**
     * Get permitted visitors for a permitted prisoner associated with that booker.
     * @description Get permitted visitors for a permitted prisoner associated with that booker.
     */
    get: operations['getPermittedVisitorsForPrisoner']
  }
  '/public/booker/config/{bookerReference}': {
    /**
     * Clear bookers details
     * @description Clear bookers details, keeps booker reference and email
     */
    delete: operations['clearBookerDetails']
  }
}

export type webhooks = Record<string, never>

export interface components {
  schemas: {
    ErrorResponseDto: {
      /** Format: int32 */
      status: number
      /** Format: int32 */
      errorCode?: number
      userMessage?: string
      developerMessage?: string
      moreInfo?: string
    }
    /** @description Auth detail Dto */
    AuthDetailDto: {
      /** @description auth reference/sub */
      oneLoginSub: string
      /** @description auth email */
      email: string
      /** @description auth phone number */
      phoneNumber?: string
    }
    /** @description Booker reference Object, to be used with all other api call for booker information */
    BookerReference: {
      /** @description This value is the booker reference and should be used to acquire booker information */
      value: string
    }
    ErrorResponse: {
      /** Format: int32 */
      status: number
      /** Format: int32 */
      errorCode?: number
      userMessage?: string
      developerMessage?: string
      moreInfo?: string
    }
    /** @description Create booker with associated permitted prisoner data. */
    CreateBookerDto: {
      /** @description auth email */
      email: string
      /** @description details of permitted prisoners to visit */
      permittedPrisoners: components['schemas']['CreatePermittedPrisonerDto'][]
    }
    /** @description Create permitted prisoner with permitted visitors associated with the booker. */
    CreatePermittedPrisonerDto: {
      /**
       * @description prisoner Id
       * @example A1234AA
       */
      prisonerId: string
      /** @description list of permitted visitors for permitted prisoner */
      visitorIds: number[]
    }
    /** @description Booker of visits. */
    BookerDto: {
      /** @description This is the booker reference and should be used to acquire booker information */
      reference: string
      /** @description auth reference/sub */
      oneLoginSub: string
      /** @description auth email */
      email: string
      /** @description Permitted prisoners list */
      permittedPrisoners: components['schemas']['PermittedPrisonerDto'][]
    }
    /** @description Permitted prisoner associated with the booker. */
    PermittedPrisonerDto: {
      /**
       * @description prisoner Id
       * @example A1234AA
       */
      prisonerId: string
      /**
       * @description Active / Inactive permitted prisoner
       * @example true
       */
      active: boolean
      /** @description Permitted visitors */
      permittedVisitors: components['schemas']['PermittedVisitorDto'][]
    }
    /** @description Permitted visitor associated with the permitted prisoner. */
    PermittedVisitorDto: {
      /**
       * Format: int64
       * @description Identifier for this contact (Person in NOMIS)
       * @example 5871791
       */
      visitorId: number
      /**
       * @description Active / Inactive permitted visitor
       * @example true
       */
      active: boolean
    }
  }
  responses: never
  parameters: never
  requestBodies: never
  headers: never
  pathItems: never
}

export type $defs = Record<string, never>

export type external = Record<string, never>

export interface operations {
  /**
   * Authenticate one login details against pre populated bookers
   * @description Authenticate one login details against pre populated bookers and return BookerReference object to be used for all other api calls for booker information
   */
  bookerAuthorisation: {
    requestBody: {
      content: {
        'application/json': components['schemas']['AuthDetailDto']
      }
    }
    responses: {
      /** @description One login details matched with pre populated booker */
      200: {
        content: {
          'application/json': components['schemas']['BookerReference']
        }
      }
      /** @description Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponseDto']
        }
      }
      /** @description Incorrect permissions for this action */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponseDto']
        }
      }
    }
  }
  /**
   * Create or Update bookers details
   * @description Create or Update bookers details
   */
  createOrUpdateBookerDetails: {
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateBookerDto']
      }
    }
    responses: {
      /** @description Have created or updated correctly */
      200: {
        content: {
          '*/*': components['schemas']['BookerDto']
        }
      }
      /** @description Incorrect request to access this endpoint */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** @description Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponseDto']
        }
      }
      /** @description Incorrect permissions for this action */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponseDto']
        }
      }
    }
  }
  /**
   * Get permitted prisoners associated with a booker.
   * @description Get permitted prisoners associated with a booker.
   */
  getPermittedPrisonersForBooker: {
    parameters: {
      query?: {
        /**
         * @description Returns active / inactive permitted prisoners or returns all permitted prisoners if this parameter is not passed.
         * @example true
         */
        active?: boolean
      }
      path: {
        /**
         * @description Booker's unique reference.
         * @example A12345DC
         */
        bookerReference: string
      }
    }
    responses: {
      /** @description Returned permitted prisoners associated with a booker */
      200: {
        content: {
          '*/*': components['schemas']['PermittedPrisonerDto'][]
        }
      }
      /** @description Incorrect request to get permitted prisoners associated with a booker */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** @description Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** @description Incorrect permissions to get permitted prisoners associated with a booker */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /**
   * Get permitted visitors for a permitted prisoner associated with that booker.
   * @description Get permitted visitors for a permitted prisoner associated with that booker.
   */
  getPermittedVisitorsForPrisoner: {
    parameters: {
      query?: {
        /**
         * @description Returns active / inactive permitted visitors for a permitted prisoner or returns all permitted visitors for the permitted prisoner if this parameter is not passed.
         * @example true
         */
        active?: boolean
      }
      path: {
        bookerReference: string
        /**
         * @description prisonerId Id for whom permitted visitors need to be returned.
         * @example A12345DC
         */
        prisonerId: string
      }
    }
    responses: {
      /** @description Returned permitted visitors for a permitted prisoner associated with that booker */
      200: {
        content: {
          '*/*': components['schemas']['PermittedVisitorDto'][]
        }
      }
      /** @description Incorrect request to get permitted visitors for a permitted prisoner associated with that booker */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** @description Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** @description Incorrect permissions to get permitted visitors for a permitted prisoner associated with that booker */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /**
   * Clear bookers details
   * @description Clear bookers details, keeps booker reference and email
   */
  clearBookerDetails: {
    parameters: {
      path: {
        bookerReference: string
      }
    }
    responses: {
      /** @description Have cleared the booker details */
      200: {
        content: {
          '*/*': components['schemas']['BookerDto']
        }
      }
      /** @description Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponseDto']
        }
      }
      /** @description Incorrect permissions for this action */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponseDto']
        }
      }
    }
  }
}
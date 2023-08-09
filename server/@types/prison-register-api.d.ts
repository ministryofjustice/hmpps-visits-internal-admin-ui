/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/secure/prisons/id/{prisonId}/videolink-conferencing-centre/email-address': {
    /** Get a prison's Videolink Conferencing Centre email address */
    get: operations['getEmailForVideoConferencingCentre']
    /** Set or change a prison's Videolink Conferencing Centre email address */
    put: operations['putEmailAddressForVideolinkConferencingCentre']
    /** Remove a prison's Videolink Conferencing Centre email address */
    delete: operations['deleteEmailAddressForVideolinkConferencingCentre']
  }
  '/secure/prisons/id/{prisonId}/offender-management-unit/email-address': {
    /** Get a prison's Offender Management Unit email address */
    get: operations['getEmailForOffenderManagementUnit']
    /** Set or change a prison's Offender Management Unit email address */
    put: operations['putEmailAddressForOffenderManagementUnit']
    /** Remove a prison's Offender Management Unit email address */
    delete: operations['deleteEmailAddressForOffenderManagementUnit']
  }
  '/queue-admin/retry-dlq/{dlqName}': {
    put: operations['retryDlq']
  }
  '/queue-admin/retry-all-dlqs': {
    put: operations['retryAllDlqs']
  }
  '/queue-admin/purge-queue/{queueName}': {
    put: operations['purgeQueue']
  }
  '/prison-maintenance/id/{prisonId}': {
    /**
     * Update specified prison details
     * @description Updates prison information, role required is MAINTAIN_REF_DATA
     */
    put: operations['updatePrison']
  }
  '/prison-maintenance/id/{prisonId}/address/{addressId}': {
    /**
     * Update specified address details
     * @description Updates address information, role required is MAINTAIN_REF_DATA
     */
    put: operations['updateAddress']
    /**
     * Delete specified address for specified Prison
     * @description Deletes address information for a Prison, role required is MAINTAIN_REF_DATA
     */
    delete: operations['deleteAddress']
  }
  '/prison-maintenance': {
    /**
     * Adds a new prison
     * @description Adds new prison information, role required is MAINTAIN_REF_DATA
     */
    post: operations['insertPrison']
  }
  '/prison-maintenance/id/{prisonId}/address': {
    /**
     * Add Address to existing Prison
     * @description Adds an additional Address to an existing Prison, role required is MAINTAIN_REF_DATA
     */
    post: operations['addAddress']
  }
  '/queue-admin/get-dlq-messages/{dlqName}': {
    get: operations['getDlqMessages']
  }
  '/prisons': {
    /**
     * Get all prisons
     * @description All prisons
     */
    get: operations['getPrisons']
  }
  '/prisons/search': {
    /**
     * Get prisons from active and text search
     * @description All prisons
     */
    get: operations['getPrisonsBySearchFilter']
  }
  '/prisons/id/{prisonId}': {
    /**
     * Get specified prison
     * @description Information on a specific prison
     */
    get: operations['getPrisonFromId']
  }
  '/prisons/id/{prisonId}/address/{addressId}': {
    /**
     * Get specified prison
     * @description Information on a specific prison address
     */
    get: operations['getAddressFromId']
  }
  '/gp/prison/{prisonId}': {
    /** Get GP practice code about specified prison */
    get: operations['getPrisonFromId_1']
  }
  '/gp/practice/{gpPracticeCode}': {
    /** Get specified prison from GP practice code */
    get: operations['getPrisonFromGpPrescriber']
  }
}

export type webhooks = Record<string, never>

export interface components {
  schemas: {
    DlqMessage: {
      body: {
        [key: string]: Record<string, never> | undefined
      }
      messageId: string
    }
    RetryDlqResult: {
      /** Format: int32 */
      messagesFoundCount: number
      messages: components['schemas']['DlqMessage'][]
    }
    PurgeQueueResult: {
      /** Format: int32 */
      messagesFoundCount: number
    }
    /** @description Prison Update Record */
    UpdatePrisonDto: {
      /**
       * @description Name of the prison
       * @example HMP Moorland
       */
      prisonName: string
      /** @description Whether the prison is still active */
      active: boolean
      /** @description If this is a male prison */
      male: boolean
      /** @description If this is a female prison */
      female: boolean
      /** @description If this is a contracted prison */
      contracted: boolean
      /** @description Set of types for this prison */
      prisonTypes: ('HMP' | 'YOI' | 'IRC' | 'STC' | 'YCS')[]
      /** @description Set of categories for this prison */
      categories: ('A' | 'B' | 'C' | 'D')[]
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
    /** @description List of address for this prison */
    AddressDto: {
      /**
       * Format: int64
       * @description Unique ID of the address
       * @example 10000
       */
      id: number
      /**
       * @description Address line 1
       * @example Bawtry Road
       */
      addressLine1?: string
      /**
       * @description Address line 2
       * @example Hatfield Woodhouse
       */
      addressLine2?: string
      /**
       * @description Village/Town/City
       * @example Doncaster
       */
      town: string
      /**
       * @description County
       * @example South Yorkshire
       */
      county?: string
      /**
       * @description Postcode
       * @example DN7 6BW
       */
      postcode: string
      /**
       * @description Country
       * @example England
       */
      country: string
    }
    /** @description Prison Information */
    PrisonDto: {
      /**
       * @description Prison ID
       * @example MDI
       */
      prisonId: string
      /**
       * @description Name of the prison
       * @example Moorland HMP
       */
      prisonName: string
      /** @description Whether the prison is still active */
      active: boolean
      /** @description Whether the prison has male prisoners */
      male: boolean
      /** @description Whether the prison has female prisoners */
      female: boolean
      /** @description Whether the prison is contracted */
      contracted: boolean
      /** @description List of types for this prison */
      types: components['schemas']['PrisonTypeDto'][]
      /** @description List of the categories for this prison */
      categories: ('A' | 'B' | 'C' | 'D')[]
      /** @description List of address for this prison */
      addresses: components['schemas']['AddressDto'][]
      /** @description List of operators for this prison */
      operators: components['schemas']['PrisonOperatorDto'][]
    }
    /** @description List of operators for this prison */
    PrisonOperatorDto: {
      /**
       * @description Prison operator name
       * @example PSP, G4S
       */
      name: string
    }
    /** @description List of types for this prison */
    PrisonTypeDto: {
      /**
       * @description Prison type code
       * @example HMP
       * @enum {string}
       */
      code: 'HMP' | 'YOI' | 'IRC' | 'STC' | 'YCS'
      /**
       * @description Prison type description
       * @example Her Majesty’s Prison
       */
      description: string
    }
    /** @description Address Update Record */
    UpdateAddressDto: {
      /**
       * @description Address line 1
       * @example Bawtry Road
       */
      addressLine1?: string
      /**
       * @description Address line 2
       * @example Hatfield Woodhouse
       */
      addressLine2?: string
      /**
       * @description Village/Town/City
       * @example Doncaster
       */
      town: string
      /**
       * @description County
       * @example South Yorkshire
       */
      county?: string
      /**
       * @description Postcode
       * @example DN7 6BW
       */
      postcode: string
      /**
       * @description Country
       * @example England
       */
      country: string
    }
    /** @description Prison Insert Record */
    InsertPrisonDto: {
      /**
       * @description Prison Id
       * @example MDI
       */
      prisonId: string
      /**
       * @description Name of the prison
       * @example HMP Moorland
       */
      prisonName: string
      /** @description Whether the prison is still active */
      active: boolean
      /** @description If this is a male prison */
      male: boolean
      /** @description If this is a female prison */
      female: boolean
      /** @description If this is a contracted prison */
      contracted: boolean
      /**
       * @description Set of types for this prison
       * @example HMP
       */
      prisonTypes: ('HMP' | 'YOI' | 'IRC' | 'STC' | 'YCS')[]
      /** @description List of addresses for this prison */
      addresses: components['schemas']['UpdateAddressDto'][]
      /** @description Set of categories for this prison */
      categories: ('A' | 'B' | 'C' | 'D')[]
    }
    GetDlqResult: {
      /** Format: int32 */
      messagesFoundCount: number
      /** Format: int32 */
      messagesReturnedCount: number
      messages: components['schemas']['DlqMessage'][]
    }
  }
  responses: never
  parameters: never
  requestBodies: never
  headers: never
  pathItems: never
}

export type external = Record<string, never>

export interface operations {
  getEmailForVideoConferencingCentre: {
    /** Get a prison's Videolink Conferencing Centre email address */
    parameters: {
      /**
       * @description Prison ID
       * @example MDI
       */
      path: {
        prisonId: string
      }
    }
    responses: {
      /** @description Returns the email address */
      200: {
        content: {
          'text/plain': unknown
        }
      }
      /** @description Client error - invalid prisonId or similar */
      400: {
        content: {
          'text/plain': string
        }
      }
      /** @description The prison does not have a Videolink Conferencing Centre email address */
      404: {
        content: {
          'text/plain': string
        }
      }
    }
  }
  putEmailAddressForVideolinkConferencingCentre: {
    /** Set or change a prison's Videolink Conferencing Centre email address */
    parameters: {
      /**
       * @description Prison ID
       * @example MDI
       */
      path: {
        prisonId: string
      }
    }
    requestBody: {
      content: {
        'text/plain': string
      }
    }
    responses: {
      /** @description The email address was created */
      201: never
      /** @description The email address was updated */
      204: never
      /** @description Client error - invalid prisonId, email address or similar */
      400: never
      /** @description No prison found for the supplied prison id */
      404: never
    }
  }
  deleteEmailAddressForVideolinkConferencingCentre: {
    /** Remove a prison's Videolink Conferencing Centre email address */
    parameters: {
      /**
       * @description Prison ID
       * @example MDI
       */
      path: {
        prisonId: string
      }
    }
    responses: {
      /** @description The email address was removed */
      204: never
      /** @description Client error - invalid prisonId or similar */
      400: never
    }
  }
  getEmailForOffenderManagementUnit: {
    /** Get a prison's Offender Management Unit email address */
    parameters: {
      /**
       * @description Prison ID
       * @example MDI
       */
      path: {
        prisonId: string
      }
    }
    responses: {
      /** @description Returns the email address */
      200: {
        content: {
          'text/plain': unknown
        }
      }
      /** @description Client error - invalid prisonId or similar */
      400: {
        content: {
          'text/plain': string
        }
      }
      /** @description The prison does not have a Offender Management Unit email address */
      404: {
        content: {
          'text/plain': string
        }
      }
    }
  }
  putEmailAddressForOffenderManagementUnit: {
    /** Set or change a prison's Offender Management Unit email address */
    parameters: {
      /**
       * @description Prison ID
       * @example MDI
       */
      path: {
        prisonId: string
      }
    }
    requestBody: {
      content: {
        'text/plain': string
      }
    }
    responses: {
      /** @description The email address was created */
      201: never
      /** @description The email address was updated */
      204: never
      /** @description Client error - invalid prisonId, email address, media type or similar */
      400: never
      /** @description No prison found for the supplied prison id */
      404: never
    }
  }
  deleteEmailAddressForOffenderManagementUnit: {
    /** Remove a prison's Offender Management Unit email address */
    parameters: {
      /**
       * @description Prison ID
       * @example MDI
       */
      path: {
        prisonId: string
      }
    }
    responses: {
      /** @description The email address was removed */
      204: never
      /** @description Client error - invalid prisonId or similar */
      400: never
    }
  }
  retryDlq: {
    parameters: {
      path: {
        dlqName: string
      }
    }
    responses: {
      /** @description OK */
      200: {
        content: {
          '*/*': components['schemas']['RetryDlqResult']
        }
      }
    }
  }
  retryAllDlqs: {
    responses: {
      /** @description OK */
      200: {
        content: {
          '*/*': components['schemas']['RetryDlqResult'][]
        }
      }
    }
  }
  purgeQueue: {
    parameters: {
      path: {
        queueName: string
      }
    }
    responses: {
      /** @description OK */
      200: {
        content: {
          '*/*': components['schemas']['PurgeQueueResult']
        }
      }
    }
  }
  updatePrison: {
    /**
     * Update specified prison details
     * @description Updates prison information, role required is MAINTAIN_REF_DATA
     */
    parameters: {
      /**
       * @description Prison Id
       * @example MDI
       */
      path: {
        prisonId: string
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdatePrisonDto']
      }
    }
    responses: {
      /** @description Prison Information Updated */
      200: {
        content: {
          'application/json': components['schemas']['PrisonDto']
        }
      }
      /** @description Information request to update prison */
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
      /** @description Incorrect permissions to make prison update */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** @description Prison ID not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  updateAddress: {
    /**
     * Update specified address details
     * @description Updates address information, role required is MAINTAIN_REF_DATA
     */
    parameters: {
      /**
       * @description Prison Id
       * @example MDI
       */
      /**
       * @description Address Id
       * @example 234231
       */
      path: {
        prisonId: string
        addressId: string
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateAddressDto']
      }
    }
    responses: {
      /** @description Address Information Updated */
      200: {
        content: {
          'application/json': components['schemas']['AddressDto']
        }
      }
      /** @description Bad Information request to update address */
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
      /** @description Incorrect permissions to make address update */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** @description Address Id not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  deleteAddress: {
    /**
     * Delete specified address for specified Prison
     * @description Deletes address information for a Prison, role required is MAINTAIN_REF_DATA
     */
    parameters: {
      /**
       * @description Prison Id
       * @example MDI
       */
      /**
       * @description Address Id
       * @example 234231
       */
      path: {
        prisonId: string
        addressId: string
      }
    }
    responses: {
      /** @description Address Information Deleted */
      200: never
      /** @description Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** @description Incorrect permissions to make address update */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** @description Address Id not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  insertPrison: {
    /**
     * Adds a new prison
     * @description Adds new prison information, role required is MAINTAIN_REF_DATA
     */
    requestBody: {
      content: {
        'application/json': components['schemas']['InsertPrisonDto']
      }
    }
    responses: {
      /** @description Prison Information Inserted */
      201: {
        content: {
          'application/json': components['schemas']['PrisonDto']
        }
      }
      /** @description Information request to add prison */
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
      /** @description Incorrect permissions to make prison insert */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  addAddress: {
    /**
     * Add Address to existing Prison
     * @description Adds an additional Address to an existing Prison, role required is MAINTAIN_REF_DATA
     */
    parameters: {
      /**
       * @description Prison Id
       * @example MDI
       */
      path: {
        prisonId: string
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateAddressDto']
      }
    }
    responses: {
      /** @description New Address added to Prison */
      200: {
        content: {
          'application/json': components['schemas']['AddressDto']
        }
      }
      /** @description Bad Information request to update address */
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
      /** @description Incorrect permissions to add Prison address */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** @description Prison Id not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  getDlqMessages: {
    parameters: {
      query?: {
        maxMessages?: number
      }
      path: {
        dlqName: string
      }
    }
    responses: {
      /** @description OK */
      200: {
        content: {
          '*/*': components['schemas']['GetDlqResult']
        }
      }
    }
  }
  getPrisons: {
    /**
     * Get all prisons
     * @description All prisons
     */
    responses: {
      /** @description Successful Operation */
      200: {
        content: {
          'application/json': components['schemas']['PrisonDto'][]
        }
      }
    }
  }
  getPrisonsBySearchFilter: {
    /**
     * Get prisons from active and text search
     * @description All prisons
     */
    parameters?: {
      /**
       * @description Active
       * @example true
       */
      /**
       * @description Text search
       * @example Sheffield
       */
      /**
       * @description Genders to filter by
       * @example MALE, FEMALE
       */
      /**
       * @description Prison type codes to filter by
       * @example HMP, YOI
       */
      query?: {
        active?: boolean
        textSearch?: string
        genders?: ('MALE' | 'FEMALE')[]
        prisonTypeCodes?: ('HMP' | 'YOI' | 'IRC' | 'STC' | 'YCS')[]
      }
    }
    responses: {
      /** @description Successful Operation */
      200: {
        content: {
          'application/json': components['schemas']['PrisonDto'][]
        }
      }
    }
  }
  getPrisonFromId: {
    /**
     * Get specified prison
     * @description Information on a specific prison
     */
    parameters: {
      /**
       * @description Prison ID
       * @example MDI
       */
      path: {
        prisonId: string
      }
    }
    responses: {
      /** @description Successful Operation */
      200: {
        content: {
          'application/json': components['schemas']['PrisonDto']
        }
      }
    }
  }
  getAddressFromId: {
    /**
     * Get specified prison
     * @description Information on a specific prison address
     */
    parameters: {
      /**
       * @description Prison ID
       * @example MDI
       */
      /**
       * @description Address Id
       * @example 234231
       */
      path: {
        prisonId: string
        addressId: string
      }
    }
    responses: {
      /** @description Successful Operation */
      200: {
        content: {
          'application/json': components['schemas']['AddressDto']
        }
      }
    }
  }
  getPrisonFromId_1: {
    /** Get GP practice code about specified prison */
    parameters: {
      /**
       * @description Prison ID
       * @example MDI
       */
      path: {
        prisonId: string
      }
    }
    responses: {
      /** @description Bad request.  Wrong format for prison_id. */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** @description Prison not found. */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  getPrisonFromGpPrescriber: {
    /** Get specified prison from GP practice code */
    parameters: {
      /**
       * @description GP Practice Code
       * @example Y05537
       */
      path: {
        gpPracticeCode: string
      }
    }
    responses: {
      /** @description Bad request.  Wrong format for GP practice code. */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** @description No prison linked to the GP practice code. */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
}

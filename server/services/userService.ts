import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import {ParamsDictionary, Query} from "express-serve-static-core";

interface UserDetails {
  name: string
  displayName: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(token)
    return { ...user, displayName: convertToTitleCase(user.name) }
  }

  async getToken(username: string): Promise<string> {
    return await this.hmppsAuthClient.getSystemClientToken(username)
  }

  // @ts-ignore
  getUserName(request: Request<ParamsDictionary, any, any, QueryString.ParsedQs, Record<string, any>>) : string {
    return request.locals.user.username
  }
}

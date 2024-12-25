import { Context } from 'koa'

interface I_Params {
  sessionId: string | null
  value: any
  status: number
}

export interface I_Controllers {
  path: string | RegExp
  method?: string
  log?: boolean
  controller: (this: Context) => Promise<I_Params>
}

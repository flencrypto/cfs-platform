declare module '@prisma/client' {
  class BaseDelegate {
    [key: string]: any
  }

  export class PrismaClient {
    [key: string]: any
    constructor(...args: any[])
    $disconnect(): Promise<void>
  }

  export namespace Prisma {
    type JsonValue = any
    type JsonObject = Record<string, JsonValue>
    type JsonArray = JsonValue[]
    type Decimal = number
    type ContestWhereInput = Record<string, any>
    type DecimalFilter = Record<string, any>
    type UserUpdateInput = Record<string, any>
    type UserProfileUpdateInput = Record<string, any>
    type UserProfileCreateInput = Record<string, any>
  }
}

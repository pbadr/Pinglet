export type PingServerResponse = {
  serverName: string,
  serverLocation: string,
  responseTime: number,
}

type User = {
  userId: string,
  countryCode: string,
}

export type RoomInfo = {
  roomOwnerId?: string,
  roomId: string,
  usersConnected: User[],
  totalUsers: number,
}

export type AveragePing = {
  serverName: string,
  averagePing: number,
}

export type PingServerResponse = {
  serverName: string,
  serverLocation: string,
  responseTime: number,
}

export type RoomInfo = {
  roomOwnerId?: string,
  roomId: string,
  usersConnected: string[],
  totalUsers: number,
}

export type averagePing = {
  [serverName: string]: number
}

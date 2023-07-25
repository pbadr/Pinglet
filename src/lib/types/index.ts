export type PingServerResponse = {
  serverName: string,
  serverLocation: string,
  responseTime: number,
}

export type RoomInfo = {
  roomId: string,
  usersConnected: number
}

export type averagePing = {
  [serverName: string]: number
}

export type PingInformation = {
  serverName: string,
  serverLocation: string,
  responseTime: number,
}

export type ClientPings = {
  [clientName: string]: PingInformation
}

/* ClientPings could be in the following format:
{
  "Client 1": {
    serverName: "Server 1",
    serverLocation: "Server Location",
    responseTime: x
  }, ...
}

*/

type PingAverages = {
  [serverName: string]: number
}
/* PingAverages could be in the following format:
{
  "Server 1": x,
  "Server 2": y,
  ...
}

*/

export function calculateAveragePing(clientPings: ClientPings) {
}


export function getBestServer(pingAverages: PingAverages) {
}

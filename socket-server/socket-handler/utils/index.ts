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
  const pingAverages: PingAverages = {};
  for (const clientName in clientPings) {
    const ping = clientPings[clientName];
    if (!pingAverages[ping.serverName]) {
      pingAverages[ping.serverName] = 0;
    }
    pingAverages[ping.serverName] += ping.responseTime;
  }

  for (const serverName in pingAverages) {
    pingAverages[serverName] /= Object.keys(clientPings).length;
  }

  return pingAverages;
}


export function getBestServer(pingAverages: PingAverages) {
  let bestServer: string | null = null;
  let bestPing: number | null = null;
  for (const serverName in pingAverages) {
    const ping = pingAverages[serverName];
    if (bestPing === null || ping < bestPing) {
      bestPing = ping;
      bestServer = serverName;
    }
  }

  return bestServer;
}

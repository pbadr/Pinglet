export type PingInformation = {
  serverName: string,
  serverLocation: string,
  responseTime: number,
}


export function getAverageBestPing(clientPings: Map<string, PingInformation[]>): Map<string, number> {
  let averagePing: Map<string, number> = new Map();
  clientPings.forEach((pings, _) => {
    pings.forEach((pingInformation) => {
      if (!averagePing.has(pingInformation.serverName))
        averagePing.set(pingInformation.serverName, 0);

      averagePing.set(
        pingInformation.serverName,
        averagePing.get(pingInformation.serverName)! + pingInformation.responseTime
      );
    });
  });

  averagePing.forEach((responseTime, serverName) => {
    const average = Math.trunc(responseTime / clientPings.size);
    averagePing.set(serverName, average);
  });

  return averagePing;
}

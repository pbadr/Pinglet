// @ts-ignore
export function getAverageBestPing(clientPings) {
  let averagePing = new Map();
  // @ts-ignore
  clientPings.forEach((pings, _) => {
    // @ts-ignore
    pings.forEach((pingInformation) => {
      if (!averagePing.has(pingInformation.serverName))
        averagePing.set(pingInformation.serverName, 0);

      averagePing.set(
        pingInformation.serverName,
        averagePing.get(pingInformation.serverName) + pingInformation.responseTime
      );
    });
  });

  averagePing.forEach((responseTime, serverName) => {
    const average = Math.trunc(responseTime / clientPings.size);
    averagePing.set(serverName, average);
  });

  return averagePing;
}

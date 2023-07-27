// @ts-nocheck
import geoip from "geoip-lite";

export function getAverageBestPing(clientPings) {
  let averagePing = new Map();
  clientPings.forEach((pings, _) => {
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

export function getUserFromSocket(socket) {
  const remoteIP = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;

  const geo = geoip.lookup(remoteIP);

  return {
    userId: socket.id,
    countryCode: geo.country.toLowerCase(),
  }
}

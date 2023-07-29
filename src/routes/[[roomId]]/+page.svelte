<script lang="ts">
  import socket from '$lib/socket/socket-handler';

  import { onMount, onDestroy } from 'svelte';

  import serverLocations from '$lib/location-server';
  import { pingServer } from '$lib/ping-server';

  import type { PingServerResponse, RoomInfo, AveragePing } from '$lib/types';
  import CreateRoom from '$lib/components/CreateRoom.svelte';
  import PingList from '$lib/components/PingList.svelte';

  import { page } from '$app/stores';

  $: userId = '';
  $: room = {} as RoomInfo;
  $: logs = [] as AveragePing[];
  $: usersDonePinging = 0;
  $: pinging = false;
  $: bestPingMessage = '';
  $: error = '';

  onMount(() => {
    console.log($page.url.href)
    // Get room ID from URL and join room
    const roomId = $page.params.roomId;
    if (roomId) {
      socket.emit('join-room', roomId);
    }
    
    // On connect
    socket.on('connect', () => {
      console.log('Connected from client');
      userId = socket.id;
    });

    // On room created
    socket.on('room-created', (roomInfo: RoomInfo) => {
      console.log(`Room created: ${roomInfo.roomId}`);
      console.log(`${socket.id} is now in room ${roomInfo.roomId}`)

      room = roomInfo;
      error = '';
    });

    // On user joined
    socket.on('user-joined', (roomInfo: RoomInfo) => {
      console.log(`User joined: ${roomInfo.roomId}`);
      console.log(`${socket.id} is now in room ${roomInfo.roomId}`)

      room = roomInfo;
      error = '';
    });

    // On user left
    socket.on('user-left', (userId: string) => {
      console.log(`User left: ${userId}`);

      const newRoomConnectedUsers = room.usersConnected.filter((user) => user.userId !== userId);

      room = {
        ...room,
        usersConnected: newRoomConnectedUsers,
        totalUsers: newRoomConnectedUsers.length,
      }

      if (usersDonePinging > 0) {
        usersDonePinging--;
      }
    });

    // On room not found
    socket.on('room-not-found', () => {
      console.log('Room not found');
      error = 'Room not found. Please check the ID and try again.';
    });

    // Initiate ping start
    socket.on('ping-started', () => {
      usersDonePinging = 0;
      bestPingMessage = '';

      pingServers();
    });

    // On ping updated
    socket.on('ping-updated', (userId: string) => {
      console.log(`User ${userId} has finished pinging`);
      usersDonePinging++;

      if (usersDonePinging == room.totalUsers) {
        pinging = false;
      }
    });

    // On best ping
    socket.on('best-ping', (bestAveragePings: AveragePing[]) => {
      bestAveragePings.sort((a, b) => a.averagePing - b.averagePing);

      logs = bestAveragePings;

      const bestPing = bestAveragePings[0];

      bestPingMessage = `The best server is ${bestPing.serverName} with an average ping of ${bestPing.averagePing}ms`;
    });
  });

  onDestroy(() => {
    socket.off('connect');
    socket.off('room-created');
    socket.off('user-joined');
    socket.off('user-left');
    socket.off('room-not-found');
    socket.off('ping-started');
    socket.off('ping-updated');
    socket.off('best-ping');
  });

  function sendPingInformation(pingInformation: PingServerResponse[]) {
    socket.emit('update-ping', room.roomId, socket.id);
    socket.emit('ping', pingInformation);
  }

  async function clientNotifyPing() {
    pinging = true;
    usersDonePinging = 0;
    bestPingMessage = '';

    console.log("Notify all connected clients to ping...");
    socket.emit('notify-ping', room.roomId);

    return;
  }

  async function pingServers() {
    logs = [];
    error = '';

    const pingPromises = Object.entries(serverLocations).map(
      async ([serverName, serverLocation]): Promise<PingServerResponse> => {
        const serverInfo = await pingServer(serverName, serverLocation);
        return {
          serverName: serverInfo.serverName,
          serverLocation: serverInfo.serverLocation,
          responseTime: serverInfo.responseTime,
        };
      }
    );

    try {
      const pingInformation: PingServerResponse[] = await Promise.all(pingPromises);
      logs = pingInformation.map((pingInfo) => ({
        serverName: pingInfo.serverName,
        averagePing: pingInfo.responseTime,
      }));

      sendPingInformation(pingInformation);
    } catch (pingError) {
      console.log(error);
      error = 'Error pinging one of the servers. Please try again.';

      pinging = false;
      usersDonePinging = 0;
    }
  }

  function getBestPing() {
    console.log("Getting best ping...")
    socket.emit('get-best-ping');
  }
</script>

<svelte:head>
  <title>Ping - Link to the closest server</title>
  <meta property="og:title" content="Ping - Link to the closest server">
  {#if $page.params.roomId}
    <meta property="og:description" content="Your friend has invited you to find the closest server to everyone in the lobby" />
  {:else}
    <meta property="og:description" content="Create a room and share the link to find the closest server to you and all your friends!" />
  {/if}
  <meta property="og:image" content={`${$page.url.href}assets/ping.png`}>
  <meta property="og:image:width" content="250">
  <meta property="og:image:height" content="250">
  <meta property="og:image:type" content="image/png">
  <meta property="og:url" content={`${$page.url.href}`}>
  <meta property="og:type" content="website">
</svelte:head>

{#if room.roomId}
<div class="font-bakbak-one text-lg flex flex-col items-center w-full gap-y-2 py-10 px-4 md:px-0">
  <div class="flex flex-col gap-y-5 w-full md:w-2/4">
    <div class="flex flex-col">
      <p class="main-dark-blue">Room ID</p>
      <span class="room-info">{room.roomId}</span>
    </div>
    <div class="flex justify-between">
      <p class="main-dark-blue">Connected users</p>
      <span class="connected-users-indicator">1</span>
    </div>
    <div class="flex gap-x-4">
      {#each room.usersConnected as user}
        <img src={`https://flagcdn.com/32x24/${user.countryCode}.png`} alt="Country code" />
      {/each}
    </div>
    <div class="flex flex-col">
      <p class="main-dark-blue">Owner ID</p>
      <span class="room-info">{room.roomOwnerId}</span>
    </div>
    <div class="flex justify-between">
      <p class="main-dark-blue">Users done pinging</p>
      <span class="users-pinging-indicator">{usersDonePinging} / {room.totalUsers}</span>
    </div>
    {#if room.roomOwnerId == userId}
      <div class="container flex gap-x-2">
        <button class="btn btn-blue" disabled={pinging} on:click={clientNotifyPing}>Ping</button>
        <button class="btn btn-blue" disabled={usersDonePinging != room.totalUsers || bestPingMessage !== ''} on:click={getBestPing}>Get best ping</button>
      </div>
    {/if}
    <PingList {logs} {bestPingMessage} {error} />
  </div>
</div>

{:else}
  <CreateRoom {error} />
{/if}

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }

  .main-dark-blue {
    color: #24375B;
  }

  .room-info {
    color: #B1C6F1;
    padding: 1rem 1.5rem;
    border-radius: 5px;
    background-color: #24375B;
  }

  .connected-users-indicator {
    color: #B1C6F1;
    background-color: #24375B;
    text-align: center;
    height: 30px;
    width: 30px;
    line-height: 30px;
    border-radius: 50%;
  }

  .users-pinging-indicator {
    color: #B1C6F1;
    background-color: #24375B;
    text-align: center;
    padding: 0 10px;
    border-radius: 5px;
  }
</style>

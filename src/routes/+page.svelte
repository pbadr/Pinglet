<script lang="ts">
  import socket from '$lib/socket/socket-handler';

  import { onMount, onDestroy } from 'svelte';

  import serverLocations from '$lib/location-server';
  import { pingServer } from '$lib/ping-server';

  import type { PingServerResponse, RoomInfo, averagePing } from '$lib/types';

  $: userId = '';
  $: inputRoomId = '';
  $: room = {} as RoomInfo;
  $: logs = [] as string[];
  $: usersDonePinging = 0;
  $: pinging = false;
  $: bestPingMessage = '';
  $: error = '';

  onMount(() => {
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

      room = {
        ...room,
        totalUsers: room.totalUsers - 1
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
    socket.on('best-ping', (bestAveragePings: averagePing[]) => {
      bestAveragePings.sort((a, b) => a.averagePing - b.averagePing);

      logs = [];
      bestAveragePings.forEach((bestAveragePing) => {
        logs.push(`${bestAveragePing.serverName} - ${bestAveragePing.averagePing}ms`);
      });

      const bestServer = logs[0].split(' - ')[0];
      const bestAveragePing = logs[0].split(' - ')[1];

      bestPingMessage = `The best ping for everyone is ${bestServer} with an average of ${bestAveragePing}ms`;
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
      logs = pingInformation.map((pingInfo) => `${pingInfo.serverName} - ${pingInfo.responseTime}ms`);

      sendPingInformation(pingInformation);
    } catch (pingError) {
      console.log(error);
      error = 'Error pinging one of the servers. Please try again.';
    }
  }

  function joinRoom() {
    if (inputRoomId === '')
      return;
    
    console.log("Joining room...");
    socket.emit('join-room', inputRoomId);
  }

  function createRoom() {
    console.log("Creating room...")
    socket.emit('create-room');
  }

  function getBestPing() {
    console.log("Getting best ping...")
    socket.emit('get-best-ping');
  }
</script>

{#if room.roomId}
<div class="flex flex-col mx-auto gap-y-4 pt-6 px-6">
  <div class="flex gap-1 font-medium text-black">
    <p class="text-md">Room ID <span class="info">{room.roomId}</span></p>
    <button type="button" on:click={() => navigator.clipboard.writeText(room.roomId)} aria-label="Copy room ID to clipboard">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
      </svg>
    </button>
  </div>
  <p class="text-md">Connected users <span class="info ">{room.totalUsers}</span></p>
  <p class="text-md">Owner ID <span class="info">{room.roomOwnerId}</span></p>
  <p class="text-md">Users done pinging <span class="info">{usersDonePinging}/{room.totalUsers}</span></p>
  {#if room.roomOwnerId == userId}
    <div class="container flex gap-x-2">
      <button class="btn btn-blue" disabled={pinging} on:click={clientNotifyPing}>Ping</button>
      <button class="btn btn-blue" disabled={usersDonePinging != room.totalUsers} on:click={getBestPing}>Get best ping</button>
    </div>
  {/if}
  {#if bestPingMessage !== ''}
    <p class="w-max font-bold text-green-900 bg-green-300 p-2 rounded-md">The best ping for everyone is {logs[0]}</p>
  {/if}
  {#each logs as log}
  <p class="w-max font-medium text-white bg-slate-700 p-2 rounded-md">{log}</p>
  {/each}
  {#if error}
    <p>{error}</p>
  {/if}
</div>
{:else}
<div class="flex flex-col mx-auto gap-y-4 pt-6 px-6">
  <div class="container">
    <form>
      <label class="text-label" for="server-id">Room ID</label>
      <input class="text-input" bind:value={inputRoomId} type="text" id="server-id" name="server-id" autocomplete="off" />

      <button class="btn btn-blue" on:click|preventDefault={joinRoom} type="submit">Join</button>
      {#if error}
        <p>{error}</p>
      {/if}
    </form>
  </div>
  <div class="container">
    <form>
      <label class="text-label" for="create-room">Create room</label>
      <button class="btn btn-blue" name="create-room" on:click|preventDefault={createRoom} type="submit">Create</button>
    </form>
  </div>
</div>
{/if}

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }
</style>

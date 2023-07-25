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
    });

    // On room not found
    socket.on('room-not-found', () => {
      console.log('Room not found');
      error = 'Room not found. Please check the ID and try again.';
    });

    // On best ping
    socket.on('best-ping', (bestAveragePings: averagePing[]) => {
      bestAveragePings.sort((a, b) => a.averagePing - b.averagePing);

      logs = [];
      bestAveragePings.forEach((bestAveragePing) => {
        logs.push(`${bestAveragePing.serverName} - ${bestAveragePing.averagePing}ms`);
      });
    });
  });

  onDestroy(() => {
    socket.off('connect');
    socket.off('room-created');
    socket.off('user-joined');
    socket.off('user-left');
    socket.off('room-not-found');
    socket.off('best-ping');
  });

  function sendPingInformation(pingInformation: PingServerResponse[]) {
    socket.emit('ping', pingInformation);
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
  <p>Room ID: {room.roomId}</p> 
  <button on:click={() => navigator.clipboard.writeText(room.roomId)}>Copy ID</button>
  <p>Connected users: {room.totalUsers}</p>
  <p>Owner id: {room.roomOwnerId}</p>
  {#if room.roomOwnerId == userId}
    <button on:click={pingServers}>Ping all servers</button>
    <button on:click={getBestPing}>Get best ping</button>
  {/if}
  {#each logs as log}
  <p>{log}</p>
  {/each}
  {#if error}
    <p>{error}</p>
  {/if}
{:else}
  <form>
    <label for="server-id">Room ID</label>
    <input bind:value={inputRoomId} type="text" id="server-id" name="server-id" />

    <button on:click|preventDefault={joinRoom} type="submit">Join</button>
    {#if error}
      <p>{error}</p>
    {/if}
  </form>

  <form>
    <label for="create-room">Create room</label>
    <button name="create-room" on:click|preventDefault={createRoom} type="submit">Create</button>
  </form>
{/if}

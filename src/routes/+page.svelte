<script lang="ts">
  import socket from '$lib/socket/socket-handler';

  import { onMount, onDestroy } from 'svelte';

  import serverLocations from '$lib/location-server';
  import { pingServer } from '$lib/ping-server';

  import type { PingServerResponse, RoomInfo } from '$lib/types';

  $: roomId = '';
  $: roomJoined = false;
  $: connectedUsers = 0;
  $: logs = [] as string[];
  $: error = '';

  onMount(() => {
    // On connect
    socket.on('connect', () => {
      console.log('Connected from client');
    });

    // On room created
    socket.on('room-created', (joinedRoomId: string) => {
      console.log(`Room created: ${joinedRoomId}`);
      console.log(`${socket.id} is now in room ${joinedRoomId}`)

      roomId = joinedRoomId;
      roomJoined = true;
      connectedUsers = 1;

      error = '';
    });

    // On user joined
    socket.on('user-joined', (roomInfo: RoomInfo) => {
      console.log(`User joined: ${roomInfo.roomId}`);
      console.log(`${socket.id} is now in room ${roomInfo.roomId}`)

      roomId = roomInfo.roomId;
      roomJoined = true;
      connectedUsers = roomInfo.usersConnected;

      error = '';
    });

    // On user left
    socket.on('user-left', (userId: string) => {
      console.log(`User left: ${userId}`);

      connectedUsers--;
    });

    // On room not found
    socket.on('room-not-found', () => {
      console.log('Room not found');
      error = 'Room not found. Please check the ID and try again.';
    });

    // On best ping
    socket.on('best-ping', (bestServerInfo) => {
      console.log(bestServerInfo);
    })
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
    if (roomId === '')
      return;
    
    console.log("Joining room...");
    socket.emit('join-room', roomId);
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

{#if roomJoined}
  <p>Room ID: {roomId}</p> 
  <button on:click={() => navigator.clipboard.writeText(roomId)}>Copy ID</button>
  <p>Connected users: {connectedUsers}</p>
  <button on:click={pingServers}>Ping all servers</button>
  <button on:click={getBestPing}>Get best ping for all clients</button>
  {#each logs as log}
  <p>{log}</p>
  {/each}
  {#if error}
    <p>{error}</p>
  {/if}
{:else}
  <form>
    <label for="server-id">Room ID</label>
    <input bind:value={roomId} type="text" id="server-id" name="server-id" />

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

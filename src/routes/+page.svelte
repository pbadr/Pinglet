<script lang="ts">
  import socket from '$lib/socket/socket-handler';

  import { onMount, onDestroy } from 'svelte';

  import serverLocations from '$lib/location-server';
  import { pingServer } from '$lib/ping-server';

  import type { RoomInfo } from '$lib/types';

  $: roomId = '';
  $: roomJoined = false;
  $: connectedUsers = 0;
  $: logs = [] as string[];

  onMount(() => {
    // On connect
    socket.on('connect', () => {
      console.log('Connected from client');
    });

    // On room created
    socket.on('room-created', (roomId: string) => {
      console.log(`Room created: ${roomId}`);
      console.log(`${socket.id} is now in room ${roomId}`)

      roomJoined = true;
      connectedUsers = 1;
    });

    // On user joined
    socket.on('user-joined', (roomInfo: RoomInfo) => {
      console.log(`User joined: ${roomInfo.roomId}`);
      console.log(`${socket.id} is now in room ${roomInfo.roomId}`)

      connectedUsers = roomInfo.usersConnected;
      roomJoined = true;
    });

    // On user left
    socket.on('user-left', (userId: string) => {
      console.log(`User left: ${userId}`);

      connectedUsers--;
    });
  });

  onDestroy(() => {
    socket.off('connect');
    socket.off('room-created');
  });

  function sendPingInformation(logs: string[]) {
    socket.emit('ping', logs);
  }

  async function pingServers() {
    logs = [];
    const pingPromises = Object.entries(serverLocations).map(
      async ([serverName, serverLocation]) => {
        const serverInfo = await pingServer(serverName, serverLocation);
        return `${serverInfo.serverName} - ${serverInfo.responseTime}ms`;
      }
    );

    logs = await Promise.all(pingPromises);
    sendPingInformation(logs);
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
</script>

{#if roomJoined}
  <p>Connected users: {connectedUsers}</p>
  <button on:click={pingServers}>Ping all servers</button>
  {#each logs as log}
  <p>{log}</p>
  {/each}
{:else}
  <form>
    <label for="server-id">Room ID</label>
    <input bind:value={roomId} type="text" id="server-id" name="server-id" />

    <button on:click|preventDefault={joinRoom} type="submit">Join</button>
  </form>

  <form>
    <label for="create-room">Create room</label>
    <button name="create-room" on:click|preventDefault={createRoom} type="submit">Create</button>
  </form>
{/if}

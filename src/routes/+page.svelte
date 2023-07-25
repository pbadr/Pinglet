<script lang="ts">
  import socket from '$lib/socket/socket-handler';

  import { onMount } from 'svelte';

  import serverLocations from '$lib/location-server';
  import { pingServer } from '$lib/ping-server';

  onMount(() => {
    socket.on('connect', () => {
      console.log('Connected from client');
    });
  });

  function sendMessage() {
    socket.emit('message', 'Hello from client');
  }

  function pingServers() {
    Object.entries(serverLocations)
    .forEach(([serverName, serverLocation]) => {
      pingServer(serverName, serverLocation);
    });
  }
</script>

<h1>Send a message to client</h1>
<button on:click={sendMessage}>Send</button>
<button on:click={pingServers}>Ping all servers</button>

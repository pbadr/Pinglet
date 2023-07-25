<script lang="ts">
  import socket from '$lib/socket/socket-handler';

  import { onMount } from 'svelte';

  import serverLocations from '$lib/location-server';
  import { pingServer } from '$lib/ping-server';

  $: logs = [] as string[];

  onMount(() => {
    socket.on('connect', () => {
      console.log('Connected from client');
    });
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
</script>

<button on:click={pingServers}>Ping all servers</button>
{#each logs as log}
  <p>{log}</p>
{/each}

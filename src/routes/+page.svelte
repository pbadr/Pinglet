<script lang="ts">
  import socket from '$lib/socket/socket-handler';

  import { onMount } from 'svelte';

  onMount(() => {
    socket.on('connect', () => {
      console.log('Connected from client');
    });
  });

  function sendMessage() {
    socket.emit('message', 'Hello from client');
  }
</script>

<h1>Send a message to client</h1>
<button on:click={sendMessage}>Send</button>

<script lang="ts">
  import socket from '$lib/socket/socket-handler';

  $: inputRoomId = '';

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
</script>

<div class="flex flex-col mx-auto gap-y-4 pt-6 px-6">
  <div class="container">
    <form>
      <label class="text-label" for="server-id">Room ID</label>
      <input class="text-input" bind:value={inputRoomId} type="text" id="server-id" name="server-id" autocomplete="off" />

      <button class="btn btn-blue" on:click|preventDefault={joinRoom} type="submit">Join</button>
    </form>
  </div>
  <div class="container">
    <form>
      <label class="text-label" for="create-room">Create room</label>
      <button class="btn btn-blue" name="create-room" on:click|preventDefault={createRoom} type="submit">Create</button>
    </form>
  </div>
</div>
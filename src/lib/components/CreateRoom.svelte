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

<div class="flex flex-col justify-center items-center h-screen w-full gap-y-2 px-4 md:px-0">
  <div class="flex flex-col gap-y-2 w-full md:w-2/4">
    <div class="flex flex-col gap-y-2">
      <input class="text-input" bind:value={inputRoomId} type="text" id="server-id" name="server-id" autocomplete="off" placeholder="Room ID"/>
      <button class="btn btn-blue" on:click|preventDefault={joinRoom} type="submit">Join</button>
    </div>
    <div>
      <button class="w-full btn btn-blue" name="create-room" on:click|preventDefault={createRoom} type="submit">Create Room</button>
    </div>
  </div>
</div>
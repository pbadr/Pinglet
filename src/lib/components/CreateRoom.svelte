<script lang="ts">
  import socket from '$lib/socket/socket-handler';

  $: inputRoomId = '';
  
  export let error: string;

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

  function pasteRoomId() {
    navigator.clipboard.readText().then((text) => {
      inputRoomId = text;
    });
  }

  function handleJoinRoomKeyDown(event: KeyboardEvent) {
    if (event.key === 'v' && event.ctrlKey) {
      pasteRoomId();
    }
  }
</script>

<div class="flex flex-col justify-center items-center h-screen w-full gap-y-2 px-4 md:px-0">
  <div class="flex flex-col gap-y-2 w-full md:w-2/4">
    {#if error}
      <p class="font-bold bg-red-300 text-red-700 border border-red-700 py-2 px-4 rounded-md">{error}</p>
    {/if}
    <div class="flex flex-col gap-y-2">
      <div class="room-id-container">
        <span class="room-id-copy font-bakbak-one cursor-pointer" role="button" tabindex="0" on:click={pasteRoomId} on:keydown|preventDefault={handleJoinRoomKeyDown}>Ctrl + V</span>
        <input class="w-full text-input" bind:value={inputRoomId} type="text" id="server-id" name="server-id" autocomplete="off" placeholder="Room ID"/>
      </div>
      <button class="btn btn-blue" on:click|preventDefault={joinRoom} type="submit">Join</button>
    </div>
    <div>
      <button class="w-full btn btn-blue" name="create-room" on:click|preventDefault={createRoom} type="submit">Create Room</button>
    </div>
  </div>
</div>

<style>
  .room-id-container {
    position: relative;
  }

  .room-id-copy {
    z-index: 1;
    position: absolute;
    top: 0.8rem;
    right: 10px;
    padding: 0 10px;
    color: #B1C6F1;
    border-radius: 5px;
    background-color: #24375B;
    transition: background-color 0.2s ease;
  }

  .room-id-copy:hover {
    background-color: #1D2E4A;
  }
</style>
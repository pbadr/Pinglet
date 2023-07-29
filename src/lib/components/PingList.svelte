<script lang="ts">
  import type { AveragePing } from "$lib/types";

  export let bestPingMessage: string;
  export let logs: AveragePing[];

  export let error: string;
</script>

<div class="flex flex-col gap-y-3">
  {#if logs.length > 0}
    <p class="message">For everyone connected in this room...</p>
  {/if}

  {#if bestPingMessage !== ''}
    <p class="best">{bestPingMessage}</p>
  {/if}

  {#each logs as pingLog}
    <p>{pingLog.serverName} had an average ping of {pingLog.averagePing}ms</p>
  {/each}
  {#if error}
    <p>{error}</p>
  {/if}
</div>

<style>
  p {
    @apply w-full px-4 py-2 rounded-md;
    color: #B1C6F1;
    background-color: #24375B;
    animation: appear 200ms ease-in;
  }

  @keyframes appear {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  p.message {
    padding-left: 0;
    color: #24375B;
    background-color: unset;
  }

  p.best {
    color: #D5B1F1;
    background-color: #36245B;
  }
</style>
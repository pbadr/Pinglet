<script lang="ts">
  export let bestPingMessage: string;
  export let logs: string[];

  export let error: string;
</script>

<div class="flex flex-col gap-y-3">
  {#if bestPingMessage !== ''}
    <p class="best">The best ping for everyone is {logs[0]}</p>
  {/if}
  {#each logs as log}
    <p>{log}</p>
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

  p.best {
    color: #D5B1F1;
    background-color: #36245B;
  }
</style>
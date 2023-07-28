<script lang="ts">
  export let bestPingMessage: string;
  export let logs: string[];

  export let error: string;
</script>

{#if bestPingMessage !== ''}
  <p class="w-max font-bold text-green-900 bg-green-300 border border-green-900 px-4 py-2 rounded-md">The best ping for everyone is {logs[0]}</p>
{/if}
{#each logs as log}
  <p class="w-max font-medium text-white bg-slate-700 border border-slate-900 p-2 rounded-md">{log}</p>
{/each}
{#if error}
  <p>{error}</p>
{/if}

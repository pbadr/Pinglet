<script>
  import "../../app.css";
</script>


<a href="https://github.com/pbadr/ping" target="_blank" ><img src="assets/github.svg" alt="GitHub logo" /></a>
<slot />

<style lang="postcss">
  img {
    @apply w-8 ml-4 mt-4;
    position: absolute;
    top: 0;
    left: 0;
    transition: opacity 200ms ease-in, transform 100ms ease-in;
  }

  img:hover {
    @apply opacity-90 scale-110;
  }

  @media (max-width: 768px) {
    img {
      @apply ml-0 mr-4;
      left: unset;
      right: 0;
    }
  }
</style>
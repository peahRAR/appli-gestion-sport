<template>
  <footer class="fixed bottom-0 w-full bg-gray-300 opacity-50">
    <div class="container mx-auto flex justify-between text-gray-300">
        <p class="text-black text-sm">Frontend V{{ $config.public.frontVersion }}</p>
        <p class="text-black text-sm">Backend V{{ $config.public.backVersion }}</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>


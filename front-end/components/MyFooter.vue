<template>
  <footer class="fixed bottom-0 w-full py-2 bg-gray-300">
    <div class="container mx-auto flex justify-around items-center text-gray-300">
        <p class="text-black opacity-75">Frontend V{{ $config.public.frontVersion }}</p>
        <p class="text-black opacity-75">Backend V{{ $config.public.backVersion }}</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>


<template>
  <div class="fixed bottom-0 px-4 w-full  opacity-50">
    <div class="container mx-auto flex justify-between mb-2">
      <p class="text-black px-2 bg-white rounded-full inline text-sm">UI v:{{ $config.public.frontVersion }}</p>
      <p class="text-black px-2 bg-white rounded-full inline text-sm">API v:{{ $config.public.backVersion }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Footer'
}
</script>


<template>
  <div class="px-4 w-full opacity-50">
    <div class="container mx-auto flex justify-between pb-2">
      <NuxtLink
        to="/versions"
        class="text-black px-2 bg-white rounded-full inline text-sm hover:bg-gray-200 transition duration-200 dark:text-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        v{{ $config.public.frontVersion }}
      </NuxtLink>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

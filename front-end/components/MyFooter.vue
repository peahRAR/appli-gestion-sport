<template>
  <div class="px-4 w-full opacity-50">
    <div class="container mx-auto flex justify-between pb-2">
      <NuxtLink
        to="/versions"
        class="relative text-black px-2 bg-white rounded-full inline text-sm hover:bg-gray-200 transition duration-200 dark:text-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        v{{ $config.public.frontVersion }}
        <span
          v-if="hasNewVersion"
          class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 opacity-100"
          title="Nouvelle version disponible"
        ></span>
      </NuxtLink>
    </div>
  </div>
</template>

<script>
import { useChangelogVersion } from '~/composables/useChangelogVersion';

export default {
  name: 'Footer',
  setup() {
    const { hasNewVersion } = useChangelogVersion();
    return { hasNewVersion };
  },
}
</script>

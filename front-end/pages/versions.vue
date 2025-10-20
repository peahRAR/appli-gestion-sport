<template>
  <section class="container mx-auto px-4 py-10 min-h-screen">
    <h1 class="text-3xl font-semibold mb-6">Historique des versions</h1>

    <ol class="space-y-6">
      <li v-for="(r, i) in sorted" :key="r.version" class="bg-white rounded-xl p-4 shadow">
        <div class="flex items-baseline gap-3">
          <span class="text-lg font-bold">v{{ r.version }}</span>
          <span class="text-sm text-gray-500">
            {{ formatDate(r.date) }}
          </span>
          <span v-if="i === 0" class="ml-auto text-xs px-2 py-0.5 rounded-full bg-black text-white">Dernière</span>
        </div>
        <p v-if="r.title" class="mt-1 text-gray-700">{{ r.title }}</p>
        <ul class="mt-3 list-disc pl-6 space-y-1">
          <li v-for="(c, idx) in r.changes" :key="idx">{{ c }}</li>
        </ul>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { releases } from '../data/releases'

const sorted = computed(() =>
  [...releases].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
)

const formatDate = (d: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(d))

useSeoMeta({
  title: 'Historique des versions',
  description: 'Toutes les mises à jour, avec leur contenu et la date de sortie.',
})
</script>

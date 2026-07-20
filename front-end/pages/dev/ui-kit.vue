<template>
  <div class="min-h-screen bg-bg text-text px-4 py-8">
    <div class="container mx-auto max-w-5xl">
      <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 class="text-3xl font-bold">UI Kit</h1>
          <p class="text-text-muted text-sm mt-1">
            Page interne (non indexée, non liée dans la nav) pour repérer visuellement les anomalies de thème.
          </p>
        </div>
        <div class="flex gap-2">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            type="button"
            @click="setMode(option.value)"
            :class="[
              'py-2 px-4 rounded-sm font-semibold border transition focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
              mode === option.value
                ? 'bg-accent border-accent text-accent-fg'
                : 'bg-surface-2 border-border text-text hover:bg-bg',
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Boutons -->
      <section class="mb-10">
        <h2 class="text-xl font-bold mb-4 border-b border-border pb-2">Boutons</h2>
        <div class="flex flex-wrap gap-3 items-center">
          <button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-sm focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">
            Primaire
          </button>
          <button class="bg-surface-2 hover:bg-bg text-text font-semibold py-2 px-4 rounded-sm border border-border-strong focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">
            Secondaire
          </button>
          <button class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-sm focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">
            Destructeur
          </button>
          <button disabled class="bg-blue-500 text-white font-semibold py-2 px-4 rounded-sm opacity-50 cursor-not-allowed">
            Désactivé
          </button>
          <button class="bg-blue-500 text-white font-semibold py-2 px-4 rounded-sm opacity-80 cursor-wait inline-flex items-center gap-2">
            <Icon name="svg-spinners:180-ring" />
            Chargement…
          </button>
        </div>
      </section>

      <!-- Formulaires -->
      <section class="mb-10">
        <h2 class="text-xl font-bold mb-4 border-b border-border pb-2">Formulaires</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium text-text-muted">Champ texte</span>
            <input type="text" placeholder="Placeholder…"
              class="bg-surface text-text border border-border-strong rounded-sm px-3 py-2 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2" />
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium text-text-muted">Champ en erreur</span>
            <input type="text" value="Valeur invalide"
              class="bg-surface text-text border-2 border-error rounded-sm px-3 py-2 focus-visible:outline-2 focus-visible:outline-error focus-visible:outline-offset-2" />
            <span class="text-xs text-error">Ce champ est requis.</span>
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium text-text-muted">Champ désactivé</span>
            <input type="text" value="Non modifiable" disabled
              class="bg-surface-2 text-text-muted border border-border rounded-sm px-3 py-2 cursor-not-allowed" />
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium text-text-muted">Select</span>
            <select class="bg-surface text-text border border-border-strong rounded-sm px-3 py-2 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </label>

          <label class="flex flex-col gap-1 md:col-span-2">
            <span class="text-sm font-medium text-text-muted">Textarea</span>
            <textarea rows="3" placeholder="Message…"
              class="bg-surface text-text border border-border-strong rounded-sm px-3 py-2 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"></textarea>
          </label>

          <label class="flex items-center gap-2">
            <input type="checkbox" checked class="accent-blue-500" />
            <span>Case à cocher</span>
          </label>

          <label class="flex items-center gap-2">
            <input type="radio" name="uikit-radio" checked class="accent-blue-500" />
            <span>Bouton radio</span>
          </label>
        </div>
      </section>

      <!-- Badges / tags -->
      <section class="mb-10">
        <h2 class="text-xl font-bold mb-4 border-b border-border pb-2">Badges &amp; tags</h2>
        <div class="flex flex-wrap gap-2">
          <span class="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success font-semibold">Actif</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning font-semibold">En attente</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-error/20 text-error font-semibold">Expiré</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-text-muted font-semibold">Neutre</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-fg font-semibold">Accent</span>
        </div>
      </section>

      <!-- Tableau (zebra / hover / sélection) -->
      <section class="mb-10">
        <h2 class="text-xl font-bold mb-4 border-b border-border pb-2">Tableau</h2>
        <div class="bg-surface rounded-sm overflow-x-auto">
          <table class="min-w-full divide-y divide-border">
            <thead class="bg-surface-2">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Nom</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Statut</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr class="hover:bg-surface-2 transition">
                <td class="px-3 py-2 text-text">Ligne normale</td>
                <td class="px-3 py-2"><span class="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">OK</span></td>
                <td class="px-3 py-2 text-text-muted">Survolez-moi</td>
              </tr>
              <tr class="bg-warning/20 hover:brightness-95 transition">
                <td class="px-3 py-2 text-text">Ligne avertissement</td>
                <td class="px-3 py-2"><span class="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning">Attention</span></td>
                <td class="px-3 py-2 text-text-muted">—</td>
              </tr>
              <tr class="bg-error/20 hover:brightness-95 transition">
                <td class="px-3 py-2 text-text">Ligne erreur</td>
                <td class="px-3 py-2"><span class="text-xs px-2 py-0.5 rounded-full bg-error/20 text-error">Critique</span></td>
                <td class="px-3 py-2 text-text-muted">—</td>
              </tr>
              <tr class="bg-accent/10">
                <td class="px-3 py-2 text-text">Ligne sélectionnée</td>
                <td class="px-3 py-2 text-text-muted">—</td>
                <td class="px-3 py-2 text-text-muted">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Modale -->
      <section class="mb-10">
        <h2 class="text-xl font-bold mb-4 border-b border-border pb-2">Modale</h2>
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-sm"
          @click="showModal = true"
        >
          Ouvrir une modale
        </button>
        <TheModal :isOpen="showModal" title="Exemple de modale" @close="showModal = false">
          <p class="text-text">Contenu de la modale, avec du texte normal et un lien.</p>
        </TheModal>
      </section>

      <!-- Toast / alerte -->
      <section class="mb-10">
        <h2 class="text-xl font-bold mb-4 border-b border-border pb-2">Alertes / toasts</h2>
        <div class="space-y-2 max-w-xl">
          <div class="bg-success/20 text-success border border-success/30 rounded-sm px-4 py-3 text-sm">
            Opération réussie.
          </div>
          <div class="bg-warning/20 text-warning border border-warning/30 rounded-sm px-4 py-3 text-sm">
            Attention, vérifiez cette information.
          </div>
          <div class="bg-error/20 text-error border border-error/30 rounded-sm px-4 py-3 text-sm">
            Une erreur est survenue.
          </div>
        </div>
      </section>

      <!-- Skeleton / chargement -->
      <section class="mb-10">
        <h2 class="text-xl font-bold mb-4 border-b border-border pb-2">États de chargement</h2>
        <div class="flex items-center gap-6">
          <TheSkeleton />
          <div class="flex-1 max-w-sm space-y-2">
            <div class="h-4 bg-surface-2 rounded-sm animate-pulse w-3/4"></div>
            <div class="h-4 bg-surface-2 rounded-sm animate-pulse w-1/2"></div>
            <div class="h-4 bg-surface-2 rounded-sm animate-pulse w-5/6"></div>
          </div>
        </div>
      </section>

      <!-- État vide -->
      <section class="mb-10">
        <h2 class="text-xl font-bold mb-4 border-b border-border pb-2">État vide</h2>
        <div class="bg-surface rounded-sm p-8 text-center">
          <p class="text-text font-semibold">Aucun résultat</p>
          <p class="text-text-muted text-sm mt-1">Aucun élément ne correspond à votre recherche.</p>
        </div>
      </section>

      <!-- Surfaces / élévation -->
      <section class="mb-10">
        <h2 class="text-xl font-bold mb-4 border-b border-border pb-2">Surfaces &amp; élévation</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-bg border border-border rounded-sm p-4">
            <p class="text-xs text-text-muted uppercase tracking-wide mb-1">bg-bg</p>
            <p class="text-text">Fond de page</p>
          </div>
          <div class="bg-surface border border-border rounded-sm p-4">
            <p class="text-xs text-text-muted uppercase tracking-wide mb-1">bg-surface</p>
            <p class="text-text">Carte / conteneur</p>
          </div>
          <div class="bg-surface-2 border border-border rounded-sm p-4">
            <p class="text-xs text-text-muted uppercase tracking-wide mb-1">bg-surface-2</p>
            <p class="text-text">Élément secondaire / survol</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from "~/composables/useTheme";

const { mode, setMode } = useTheme();

const themeOptions = [
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
  { value: "system", label: "Système" },
];

const showModal = ref(false);

useSeoMeta({
  title: "UI Kit (dev)",
  robots: "noindex, nofollow",
});
</script>

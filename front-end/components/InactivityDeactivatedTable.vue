<template>
  <div class="mb-8 bg-surface rounded-sm" style="overflow-x: auto">
    <h2 class="text-xl font-semibold mb-2">Comptes désactivés pour inactivité</h2>
    <p v-if="users.length === 0" class="text-sm text-text-muted px-2 pb-4">
      Aucun compte désactivé pour inactivité.
    </p>
    <table v-else class="mx-auto w-full min-w-full divide-y divide-border">
      <thead class="bg-surface-2">
        <tr>
          <th class="px-3 py-1 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Nom</th>
          <th class="px-3 py-1 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Prénom</th>
          <th class="px-3 py-1 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Email</th>
          <th class="px-3 py-1 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Dernière connexion</th>
          <th class="px-3 py-1 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Dernière inscription</th>
          <th class="px-3 py-1 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Désactivé le</th>
          <th class="px-3 py-1 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-surface divide-y divide-border">
        <tr v-for="user in users" :key="user.id">
          <td class="px-3 py-2 whitespace-nowrap text-center text-sm text-text font-semibold capitalize">{{ user.name }}</td>
          <td class="px-3 py-2 whitespace-nowrap text-center text-sm text-text font-semibold capitalize">{{ user.firstname }}</td>
          <td class="px-3 py-2 whitespace-nowrap text-center text-sm text-text">{{ user.email }}</td>
          <td class="px-3 py-2 whitespace-nowrap text-center text-sm text-text">
            {{ user.last_login_at ? formatDate(user.last_login_at) : "Jamais" }}
          </td>
          <td class="px-3 py-2 whitespace-nowrap text-center text-sm text-text">
            {{ user.last_course_registration_at ? formatDate(user.last_course_registration_at) : "Jamais" }}
          </td>
          <td class="px-3 py-2 whitespace-nowrap text-center text-sm text-text">
            {{ user.deactivated_at ? formatDate(user.deactivated_at) : "—" }}
          </td>
          <td class="px-3 py-2 whitespace-nowrap text-center text-sm">
            <button
              @click="$emit('reactivate', user)"
              class="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-xs"
            >
              Réactiver
            </button>
            <button
              @click="confirmAndDelete(user)"
              class="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-xs ml-2"
            >
              Supprimer définitivement
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { formatDate } from "~/composables/useDateFormat";

export default {
  name: "InactivityDeactivatedTable",
  props: {
    users: { type: Array, required: true },
  },
  emits: ["reactivate", "delete"],
  methods: {
    formatDate(value) {
      return formatDate(value, "—");
    },
    confirmAndDelete(user) {
      const label = [user.firstname, user.name].filter(Boolean).join(" ") || user.email;
      if (window.confirm(`Supprimer définitivement le compte de ${label} ? Cette action est irréversible.`)) {
        this.$emit("delete", user);
      }
    },
  },
};
</script>

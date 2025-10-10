<template>
    <div class="overflow-hidden rounded-2xl bg-gradient-to-r
from-blue-700
via-purple-700
to-indigo-500 shadow-sm ring-1 ring-slate-200">
        <div class="grid grid-cols-1 md:grid-cols-3">
            <!-- Col gauche: Avatar + nom -->
            <div class="relative  p-6 md:p-8 flex flex-col items-center justify-center">
                <Avatar :src="user.avatar" :gender="user.gender" />

                <h2 class="mt-4 text-xl font-semibold text-white text-center">
                    {{ user.firstname }} {{ user.name }}
                </h2>

                <p class="mt-1 text-sm text-white text-center">
                    {{ user.email || 'Non Renseigné' }}
                </p>
            </div>

            <!-- Col droite: détails -->
            <div class="md:col-span-2 p-6 md:p-8">
                <!-- Détails principaux -->
                <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">

                    <div>
                        <dt class="text-xs font-semibold tracking-wide text-white">Poids</dt>
                        <dd class="mt-1 text-sm text-white">
                            {{ user.weight ? (user.weight + ' Kg') : 'Non Renseigné' }}
                        </dd>
                    </div>

                    <div>
                        <dt class="text-xs font-semibold tracking-wide text-white">Téléphone</dt>
                        <dd class="mt-1 text-sm text-white">
                            {{ user.tel_num || 'Non Renseigné' }}
                        </dd>
                    </div>

                    <div>
                        <dt class="text-xs font-semibold tracking-wide text-white">Téléphone médical</dt>
                        <dd class="mt-1 text-sm text-white">
                            {{ user.tel_medic || 'Non Renseigné' }}
                        </dd>
                    </div>

                    <div>
                        <dt class="text-xs font-semibold tracking-wide text-white">Téléphone d'urgence</dt>
                        <dd class="mt-1 text-sm text-white">
                            {{ user.tel_emergency || 'Non Renseigné' }}
                        </dd>
                    </div>

                    <div>
                        <dt class="text-xs font-semibold tracking-wide text-white">Fin de paiement</dt>
                        <dd class="mt-1 text-sm text-white">
                            {{ user.date_end_pay || 'Non Renseigné' }}
                        </dd>
                    </div>
                </dl>

                <!-- Séparateur -->
                <div class="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                <!-- Licences -->
                <div>
                    <h3 class="text-sm font-semibold text-white">Licence</h3>

                    <!-- loading -->
                    <p v-if="licensesLoading" class="mt-2 text-sm text-white">
                        Chargement…
                    </p>

                    <!-- vide -->
                    <p v-else-if="licensesForDisplay.length === 0" class="mt-2 text-sm text-white">
                        Non Renseigné
                    </p>

                    <!-- liste -->
                    <ul v-else class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <li v-for="lic in licensesForDisplay" :key="lic.id">
                            <div
                                class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <span class="text-xs font-semibold text-slate-600">{{ lic.federation.code }}</span>
                                <span class="text-sm font-semibold text-slate-900">{{ lic.number_plain }}</span>
                            </div>
                        </li>
                    </ul>

                    <!-- erreur licences -->
                    <p v-if="licensesError" class="mt-2 text-sm text-red-600">
                        {{ licensesError }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UserInfo',
    props: {
        user: { type: Object, required: true },
        baseUrl: { type: String, required: true }, // ex: getUrl()
    },
    data() {
        return {
            licensesLoading: false,
            licenses: [],       // [{ id, federation:{code,name}, number_plain, ... }]
            licensesError: null,
        }
    },
    computed: {
        // Affiche seulement les licences non-legacy ET avec un numéro en clair dispo
        licensesForDisplay() {
            return this.licenses.filter(
                (l) => l?.federation?.code !== 'LEGACY' && !!l.number_plain
            )
        },
    },
    methods: {
        token() {
            return localStorage.getItem('accessToken')
        },
        async loadLicenses() {
            if (!this.user?.id) return
            this.licensesLoading = true
            this.licensesError = null
            try {
                const res = await fetch(`${this.baseUrl.replace(/\/+$/, '')}/users/${this.user.id}/licenses`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.token()}`
                    }
                })
                if (!res.ok) throw new Error('Erreur lors du chargement des licences')
                this.licenses = await res.json()  // ← doit contenir number_plain
            } catch (e) {
                this.licensesError = e?.message || 'Erreur licences'
                this.licenses = []
            } finally {
                this.licensesLoading = false
            }
        },
    },
    watch: {
        'user.id': { immediate: true, handler() { this.loadLicenses() } }
    }
}
</script>

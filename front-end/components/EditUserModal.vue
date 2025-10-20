<template>
    <TheModal :isOpen="isOpen" :title="null" :showClose="true" @close="close">
        <div
            class="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-500 shadow-sm ring-1 ring-slate-200">
            <div class="grid grid-cols-1 md:grid-cols-3">
                <!-- Col gauche: Avatar + nom -->
                <div class="relative p-6 md:p-8 flex flex-col items-center justify-center">
                    <Avatar :src="user?.avatar" :gender="user?.gender" />
                    <h2 class="mt-4 text-xl font-semibold text-white text-center">
                        <template v-if="isAdmin">
                            {{ (localUser.firstname || user?.firstname) || "Prénom" }}
                            {{ (localUser.name || user?.name) || "Nom" }}
                        </template>
                        <template v-else>
                            {{ user?.firstname }} {{ user?.name }}
                        </template>
                    </h2>
                    <p class="mt-1 text-sm text-white text-center">
                        {{ user?.email || "Non Renseigné" }}
                    </p>
                </div>

                <!-- Col droite: détails -->
                <div class="md:col-span-2 p-6 md:p-8">
                    <!-- Détails principaux -->
                    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <!-- Prénom -->
                        <div>
                            <dt class="text-xs font-semibold tracking-wide text-white">Prénom</dt>
                            <dd class="mt-1 text-sm text-white">
                                <template v-if="isAdmin">
                                    <input type="text" v-model.trim="localUser.firstname" placeholder="Non Renseigné"
                                        class="w-full rounded-md border border-white/40 bg-white/10 px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60" />
                                </template>
                                <template v-else>
                                    {{ user?.firstname || "Non Renseigné" }}
                                </template>
                            </dd>
                        </div>

                        <!-- Nom -->
                        <div>
                            <dt class="text-xs font-semibold tracking-wide text-white">Nom</dt>
                            <dd class="mt-1 text-sm text-white">
                                <template v-if="isAdmin">
                                    <input type="text" v-model.trim="localUser.name" placeholder="Non Renseigné"
                                        class="w-full rounded-md border border-white/40 bg-white/10 px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60" />
                                </template>
                                <template v-else>
                                    {{ user?.name || "Non Renseigné" }}
                                </template>
                            </dd>
                        </div>

                        <!-- Date de naissance -->
                        <div>
                            <dt class="text-xs font-semibold tracking-wide text-white">
                                Date de naissance
                            </dt>
                            <dd class="mt-1 text-sm text-white">
                                <template v-if="isAdmin">
                                    <input id="birthday" type="date" :max="todayISO" v-model="localUser.birthday"
                                        class="w-full rounded-md border border-white/40 bg-white/10 px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60" />
                                    <p v-if="localUser.birthday" class="mt-1 text-xs text-white/80">
                                        {{ formatBirthday(localUser.birthday) }}
                                    </p>
                                    <p v-else class="mt-1 text-xs text-white/80">Non Renseigné</p>
                                </template>
                                <template v-else>
                                    {{ formatBirthday(user?.birthday) }}
                                </template>
                            </dd>
                        </div>

                        <!-- Poids -->
                        <div>
                            <dt class="text-xs font-semibold tracking-wide text-white">Poids</dt>
                            <dd class="mt-1 text-sm text-white">
                                {{ user?.weight ? (user.weight + ' Kg') : "Non Renseigné" }}
                            </dd>
                        </div>

                        <!-- Téléphone -->
                        <div>
                            <dt class="text-xs font-semibold tracking-wide text-white">Téléphone</dt>
                            <dd class="mt-1 text-sm text-white">
                                {{ user?.tel_num || "Non Renseigné" }}
                            </dd>
                        </div>

                        <!-- Téléphone médical -->
                        <div>
                            <dt class="text-xs font-semibold tracking-wide text-white">
                                Téléphone médical
                            </dt>
                            <dd class="mt-1 text-sm text-white">
                                {{ user?.tel_medic || "Non Renseigné" }}
                            </dd>
                        </div>

                        <!-- Téléphone d'urgence -->
                        <div>
                            <dt class="text-xs font-semibold tracking-wide text-white">
                                Téléphone d'urgence
                            </dt>
                            <dd class="mt-1 text-sm text-white">
                                {{ user?.tel_emergency || "Non Renseigné" }}
                            </dd>
                        </div>

                        <!-- Fin de paiement (affichage) -->
                        <div>
                            <dt class="text-xs font-semibold tracking-wide text-white">
                                Fin de paiement
                            </dt>
                            <dd class="mt-1 text-sm text-white">
                                {{ user?.date_end_pay ? formatDate(user.date_end_pay) : "Non Renseigné" }}
                            </dd>
                        </div>
                    </dl>

                    <!-- Séparateur -->
                    <div class="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                    <!-- Licences -->
                    <div>
                        <h3 class="text-sm font-semibold text-white">Licence</h3>

                        <p v-if="licensesLoading" class="mt-2 text-sm text-white">Chargement…</p>
                        <p v-else-if="licensesForDisplay.length === 0" class="mt-2 text-sm text-white">
                            Non Renseigné
                        </p>

                        <ul v-else class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <li v-for="lic in licensesForDisplay" :key="lic.id">
                                <div
                                    class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                    <span class="text-xs font-semibold text-slate-600">
                                        {{ lic.federation?.code }}
                                    </span>
                                    <span class="text-sm font-semibold text-slate-900">
                                        {{ lic.number_plain }}
                                    </span>
                                </div>
                            </li>
                        </ul>

                        <p v-if="licensesError" class="mt-2 text-sm text-red-300">
                            {{ licensesError }}
                        </p>
                    </div>

                    <!-- Séparateur -->
                    <div class="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                    <!-- Actions + champs éditables (paiement) -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="datePayment" class="block text-xs font-semibold tracking-wide text-white">Date
                                de
                                paiement</label>
                            <input id="datePayment" type="date" v-model="localUser.date_payment"
                                class="mt-1 w-full rounded-md border border-white/40 bg-white/10 px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60" />
                            <span v-if="!localUser.date_payment" class="text-xs text-white/80">
                                Aucun paiement en cours
                            </span>
                        </div>

                        <div>
                            <label for="dateEndPay" class="block text-xs font-semibold tracking-wide text-white">Date de
                                fin de
                                paiement</label>
                            <input id="dateEndPay" type="date" v-model="localUser.date_end_pay"
                                class="mt-1 w-full rounded-md border border-white/40 bg-white/10 px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60" />
                            <span v-if="!localUser.date_end_pay" class="text-xs text-white/80">
                                Aucun paiement en cours
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Boutons d'action -->
        <div class="mt-6 flex flex-wrap gap-3 justify-center">
            <button @click="emitUpdate" class="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white">
                Enregistrer
            </button>

            <button v-if="user?.role != 2" @click="$emit('delete-user', user)"
                class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white">
                Supprimer Utilisateur
            </button>

            <button v-if="getUserRole() === 2 && user?.role != 2" @click="toggleUserRole(user.id)" :class="user?.role === 0
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-yellow-500 hover:bg-yellow-600'
                " class="px-4 py-2 rounded-lg text-white">
                {{ user?.role === 0 ? "Passer Admin" : "Révoquer les droits Admin" }}
            </button>
        </div>
    </TheModal>
</template>


<script>
import TheModal from "@/components/TheModal.vue";

export default {
    name: "EditUserModal",
    components: {
        TheModal,
        Avatar: {
            name: "Avatar",
            props: { src: String, gender: Boolean },
            template: `
      <div class="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/60">
        <img v-if="src" :src="src" alt="Avatar" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full bg-white/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" class="text-white/90">
            <path fill="currentColor" d="M11.5 14c4.14 0 7.5 1.57 7.5 3.5V20H4v-2.5c0-1.93 3.36-3.5 7.5-3.5M11.5 5A3.5 3.5 0 0 1 15 8.5A3.5 3.5 0 0 1 11.5 12A3.5 3.5 0 0 1 8 8.5A3.5 3.5 0 0 1 11.5 5"/>
          </svg>
        </div>
        <span
          class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
          :class="gender ? 'bg-blue-300' : 'bg-pink-300'">
          <svg v-if="gender" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="18" height="18"><path fill="currentColor" d="M228 36h-40a12 12 0 0 0 0 24h11l-22.1 22.11A68 68 0 1 0 164 92.67L186.73 70H196v12a12 12 0 0 0 24 0V40a12 12 0 0 0-12-12m-92 140a44 44 0 1 1 44-44a44.05 44.05 0 0 1-44 44"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="18" height="18"><path fill="currentColor" d="M237.46 74.51a12 12 0 1 0-19.92 13.32a56 56 0 1 1-23.6-22.66a12 12 0 1 0 11-21.48A80 80 0 1 0 196 187.59V208h20a12 12 0 0 0 0-24h-8v-4.41a79.56 79.56 0 0 0 29.46-105.08"/></svg>
        </span>
      </div>`,
        },
    },
    props: {
        isOpen: { type: Boolean, required: true },
        user: { type: Object, default: () => ({}) },
        // Fournis-les depuis le parent si tu veux afficher les licences
        licenses: { type: Array, default: () => [] },
        licensesLoading: { type: Boolean, default: false },
        licensesError: { type: String, default: "" },
    },
    emits: ["close", "update-user", "delete-user", "change-role"],
    data() {
        return {
            // on édite des champs sans muter directement la prop user
            localUser: {
                firstname: this.user?.firstname || "",
                name: this.user?.name || "",
                birthday: this.toInputDate(this.user?.birthday) || "",
                date_payment: this.toInputDate(this.user?.date_payment) || "",
                date_end_pay: this.toInputDate(this.user?.date_end_pay) || "",
            },
        };
    },
    watch: {
        // si l’utilisateur change, on resynchronise le formulaire
        user: {
            deep: true,
            immediate: true,
            handler(u) {
                this.localUser = {
                    firstname: u?.firstname || "",
                    name: u?.name || "",
                    birthday: this.toInputDate(u?.birthday) || "",
                    date_payment: this.toInputDate(u?.date_payment) || "",
                    date_end_pay: this.toInputDate(u?.date_end_pay) || "",
                };
            },
        },
    },
    computed: {
        isAdmin() {
            return true;
        },
        licensesForDisplay() {
            // attends un tableau d’objets { id, number_plain, federation: { code } }
            return Array.isArray(this.licenses) ? this.licenses : [];
        },
    },
    methods: {
        toInputDate(value) {
            if (!value) return "";
            const d = new Date(value);
            if (isNaN(d)) return "";
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
        },
        close() {
            this.$emit("close");
        },
        emitUpdate() {
            this.$emit("update-user", {
                firstname: this.localUser.firstname || null,
                name: this.localUser.name || null,
                birthday: this.localUser.birthday || null,
                date_payment: this.localUser.date_payment || null,
                date_end_pay: this.localUser.date_end_pay || null,
            });
        },
        getUserRole() {
            const token = localStorage.getItem("accessToken");
            if (!token) return null;
            const parts = token.split(".");
            if (parts.length !== 3) return null;
            try {
                return JSON.parse(atob(parts[1])).role;
            } catch {
                return null;
            }
        },
        toggleUserRole(userId) {
            const newRole = this.user?.role === 0 ? 1 : 0;
            this.$emit("change-role", userId, newRole);
        },
        // JJ/MM/AAAA (N ans)
        formatBirthday(birthday) {
            if (!birthday) return "Non Renseigné";
            const d = new Date(birthday);
            if (isNaN(d)) return "Non Renseigné";
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            return `${dd}/${mm}/${yyyy} (${this.age(d)} ans)`;
        },
        formatDate(dateStr) {
            const d = new Date(dateStr);
            if (isNaN(d)) return "—";
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        },
        age(birthDate) {
            const today = new Date();
            let a = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) a--;
            return a;
        },
    },
};
</script>

<style lang="css" scoped>
input[type="date"]::-webkit-calendar-picker-indicator {
    filter: brightness(0) invert(1);
}
</style>

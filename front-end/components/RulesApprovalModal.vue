<template>
    <TheModal :showClose="false" :isOpen="isOpen" title="Règlement intérieur" @close="onAttemptClose">
        <div class="space-y-4">
            <!-- Contenu (scrollable) -->
            <div class="border rounded-md p-4 max-h-64 overflow-y-auto">
                <template v-if="loading">
                    <p class="text-sm text-slate-500">Chargement du règlement…</p>
                </template>
                <template v-else-if="error">
                    <p class="text-sm text-red-600">{{ error }}</p>
                </template>
                <template v-else>
                    <h3 class="text-base font-semibold">{{ rules.title }}</h3>
                    <p class="text-sm text-slate-700 mt-1">{{ rules.intro }}</p>

                    <div class="mt-3 space-y-3">
                        <div v-for="(section, si) in rules.sections" :key="si">
                            <h3 class="font-semibold mb-1">{{ section.title }}</h3>
                            <p class="text-sm  whitespace-pre-line">{{ section.content }}</p>
                        </div>
                    </div>

                    <p class="text-xs text-slate-500 mt-3">{{ rules.footer }}</p>
                </template>
            </div>

            <!-- Formulaire avec validation HTML (checkbox required) -->
            <form @submit.prevent="submit" class="space-y-3">
                <label class="flex items-start gap-2">
                    <input v-model="checked" type="checkbox" required class="mt-1" />
                    <span class="text-sm text-slate-800">
                        J’ai lu et j’approuve le règlement.
                    </span>
                </label>

                <div class="flex items-center justify-center gap-3">
                    <span v-if="saveError" class="text-sm text-red-600">{{ saveError }}</span>
                    <button type="submit"
                        class="bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-2 rounded disabled:opacity-50"
                        :disabled="saving">
                        {{ saving ? "Enregistrement…" : "J'approuve" }}
                    </button>
                </div>
            </form>
        </div>
    </TheModal>
</template>

<script>
export default {
    name: "RulesApprovalModal",
    props: {
        isOpen: { type: Boolean, required: true },
        baseUrl: { type: String, required: true },
        userId: { type: String, required: true },
    },
    emits: ["approved", "blocked-close"],
    data() {
        return {
            rules: { title: "", intro: "", sections: [], footer: "" },
            loading: true,
            error: null,
            checked: false,
            saving: false,
            saveError: null,
        };
    },
    watch: {
        isOpen: {
            immediate: true,
            async handler(v) {
                if (v) await this.loadRules();
                else {
                    // reset quand on ferme
                    this.checked = false;
                    this.saveError = null;
                }
            },
        },
    },
    methods: {
        token() {
            return localStorage.getItem("accessToken");
        },
        async loadRules() {
            this.loading = true;
            this.error = null;
            try {
                // construit une URL ABSOLUE vers l’origine front
                const rulesUrl = new URL("/json/rules.json", window.location.origin).toString();
                const res = await fetch(rulesUrl, { cache: "no-store" });
                if (!res.ok)
                    throw new Error(`Impossible de charger le règlement (${res.status})`);
                this.rules = await res.json();
            } catch (e) {
                this.error = e?.message || "Erreur lors du chargement du règlement.";
            } finally {
                this.loading = false;
            }
        },
        onAttemptClose() {
            // Empêche la fermeture tant que pas approuvé
            if (!this.checked) {
                this.$emit("blocked-close");
                return;
            }
            // si nécessaire, on peut autoriser une fermeture si déjà approuvé (mais ici on force via submit)
        },
        async submit() {
            if (!this.checked) return; // HTML required couvre déjà ça
            try {
                this.saving = true;
                this.saveError = null;

                const res = await fetch(
                    `${this.baseUrl.replace(/\/+$/, "")}/users/${this.userId}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${this.token()}`,
                        },
                        body: JSON.stringify({ approove_rules: true }),
                    }
                );

                if (!res.ok) {
                    const msg = await res.text();
                    throw new Error(msg || "Impossible d’enregistrer votre approbation.");
                }

                // Succès → informer le parent
                this.$emit("approved");
            } catch (e) {
                this.saveError = e?.message || "Erreur lors de l’approbation.";
            } finally {
                this.saving = false;
            }
        },
    },
};
</script>

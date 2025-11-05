<template>
    <div class="p-4">
        <div class="flex flex-col items-center rounded py-8 px-4 bg-gray-50 min-h-screen">
            <!-- Note délai -->
            <p class="mb-6 text-center p-3 text-white font-semibold rounded bg-red-600">
                Déclare l’accident le plus vite possible, idéalement dans les 24 h suivant l’incident.
            </p>

            <!-- Choix fédération -->
            <div class="w-full max-w-2xl mb-8">
                <label for="fed" class="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionne ta fédération
                </label>
                <select id="fed" v-model="selectedCode"
                    class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option disabled value="">Choisir...</option>
                    <option v-for="fed in federations" :key="fed.code" :value="fed.code">
                        {{ fed.name }}
                    </option>
                </select>
                <p v-if="current?.hint" class="text-xs text-gray-500 mt-2">
                    {{ current.hint }}
                </p>
            </div>

            <!-- Étapes -->
            <div class="flex flex-col items-center w-full">
                <div class="text-lg text-gray-800 font-semibold mb-4 uppercase underline">Étapes</div>

                <!-- Étape 1 -->
                <div class="flex flex-col items-center w-full">
                    <div
                        class="flex items-center justify-center w-24 h-24 rounded-full bg-gray-300 text-gray-800 text-3xl font-bold">
                        1
                    </div>
                    <p class="mt-4 text-center text-gray-700 px-4 md:px-16">
                        Déclare l’accident via le canal de ta fédération.
                    </p>

                    <!-- CTA par fédération -->
                    <div class="mt-4">
                        <!-- FSGT -->
                        <template v-if="current?.code === 'FSGT'">
                            <a :href="current.url" target="_blank" rel="noopener"
                                class="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                Ouvrir le portail FSGT
                            </a>
                        </template>

                        <!-- FMMAF -->
                        <template v-else-if="current?.code === 'FMMAF'">
                            <div class="flex flex-col items-center">
                                <a :href="current.url" target="_blank" rel="noopener"
                                    class="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    Consulter les consignes FMMAF
                                </a>
                                <p class="text-sm text-gray-600 mt-3 max-w-xl text-center">
                                    La FMMAF se déclare par e-mail, rassemble les justificatifs indiqués sur la page,
                                    puis envoie le tout selon leurs consignes.
                                </p>
                            </div>
                        </template>

                        <!-- FFLDA -->
                        <template v-else-if="current?.code === 'FFLDA'">
                            <a :href="current.url" target="_blank" rel="noopener"
                                class="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                Ouvrir le formulaire FFLDA
                            </a>
                        </template>

                        <!-- Placeholder si rien sélectionné -->
                        <template v-else>
                            <span class="text-gray-500 text-sm">
                                Choisis une fédération pour afficher le lien de déclaration.
                            </span>
                        </template>
                    </div>

                    <div class="w-4/5 border-t-4 border-gray-300 my-8"></div>
                </div>

                <!-- Étape 2 -->
                <div class="flex flex-col items-center w-full">
                    <div
                        class="flex items-center justify-center w-24 h-24 rounded-full bg-gray-300 text-gray-800 text-3xl font-bold">
                        2
                    </div>
                    <p class="mt-4 text-center text-gray-700 px-4 md:px-16">
                        Prépare les pièces demandées, certificat médical, compte-rendu, facture, photos si pertinent,
                        puis joins-les à
                        ta déclaration.
                    </p>
                    <div class="w-4/5 border-t-4 border-gray-300 my-8"></div>
                </div>

                <!-- Étape 3 -->
                <div class="flex flex-col items-center w-full">
                    <div
                        class="flex items-center justify-center w-24 h-24 rounded-full bg-gray-300 text-gray-800 text-3xl font-bold">
                        3
                    </div>
                    <p class="mt-4 text-center text-gray-700 px-4 md:px-16">
                        Une fois la déclaration effectuée, envoie un e-mail à
                        <a href="mailto:mmabaisieux@gmail.com"
                            class="text-blue-600 underline">mmabaisieux@gmail.com</a>,
                        précise que tu as fait les démarches, indique la fédération concernée, joins la référence ou
                        l’accusé de
                        réception si tu l’as.
                    </p>

                    <button @click="openMailClient"
                        class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Pré-remplir l’e-mail
                    </button>

                    <div class="w-4/5 border-t-4 border-gray-300 my-8"></div>
                </div>

                <!-- Rappel -->
                <div class="max-w-3xl text-sm text-gray-600 text-center">
                    Astuce, prends des photos des documents si besoin, garde une copie de tout ce que tu envoies.
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from "vue";

const federations = [
    {
        code: "FSGT",
        name: "FSGT",
        url: "https://connexion.marsh.com/client/declarationfsgt",
        hint: "Déclaration via le portail en ligne.",
    },
    {
        code: "FMMAF",
        name: "FMMAF",
        url: "https://www.fmmaf.fr/assurance-declaration-daccident/",
        hint: "Déclaration par e-mail, suis les consignes sur la page.",
    },
    {
        code: "FFLDA",
        name: "FFLDA",
        url: "https://form.typeform.com/to/dRzY9y8o",
        hint: "Déclaration via le formulaire en ligne.",
    },
];

const selectedCode = ref("");

const current = computed(() =>
    federations.find((f) => f.code === selectedCode.value)
);

function openMailClient() {
    const subject = encodeURIComponent("Déclaration d’accident effectuée");
    const body = encodeURIComponent(
        [
            "Bonjour,",
            "",
            "Je confirme avoir déclaré un accident.",
            `Fédération : ${current.value?.name ?? "[à préciser]"}`,
            "Date de l’accident : [jj/mm/aaaa]",
            "Nom, prénom : [tes infos]",
            "Référence de dossier, accusé de réception : [si disponible]",
            "",
            "Cordialement,",
            "[ton nom]",
        ].join("\n")
    );
    window.location.href = `mailto:mmabaisieux@gmail.com?subject=${subject}&body=${body}`;
}
</script>

<template>
    <div class="p-4">
        <div class="flex flex-col items-center rounded py-8 px-4 bg-gray-50 min-h-screen">
            <!-- Note générale -->
            <p class="mb-6 text-center p-2 text-white font-semibold rounded bg-red-600">
                Afin que votre dossier soit traité en temps et en heure, merci de renvoyer tous les documents sous 48h après
                l'incident.
            </p>
    
            <!-- Étape 1 -->
            <div class="flex flex-col items-center w-full">
                <div class="text-lg text-gray-800 font-semibold mb-4 uppercase underline">Étapes :</div>
                <div
                    class="flex items-center justify-center w-24 h-24 rounded-full bg-gray-300 text-gray-800 text-3xl font-bold">
                    1
                </div>
                <p class="mt-4 text-center text-gray-700 px-4 md:px-16">
                    Téléchargez le document de déclaration d'accident et remplissez-le.
                </p>
                <button class="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    <a href="files/Declaration-de-sinistre-IA-FSGT-2024-2025.pdf" download="declaration-accident.pdf"
                        class="block text-white">
                        Télécharger
                    </a>
                </button>
                <div class="w-4/5 border-t-4 border-gray-300 my-8"></div>
            </div>
    
            <!-- Étape 2 -->
            <div class="flex flex-col items-center w-full">
                <div
                    class="flex items-center justify-center w-24 h-24 rounded-full bg-gray-300 text-gray-800 text-3xl font-bold">
                    2
                </div>
                <p class="mt-4 text-center text-gray-700 px-4 md:px-16">
                    Envoyez le formulaire rempli à notre gestionnaire à l'adresse suivante : <br />
                    <a href="mailto:anso59390@gmail.com" class="text-blue-500 underline">anso59390@gmail.com</a>.
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
                    Toutes les pièces à caractère médical doivent être transmises dans une enveloppe cachetée portant la
                    mention « pli confidentiel »,
                    adressée à l'attention du médecin conseil de l'assureur :
                </p>
                <p class="mt-6 text-center text-gray-700 px-4 md:px-16">
                    <strong>Médecin Conseil</strong><br />
                    WTW DGPL Dommages<br />
                    2 Rue de Gourville - 45911 Orléans Cedex 9 – France<br />
                    <a href="mailto:fr.fsgt@wtwco.com" class="text-blue-500 underline">fr.fsgt@wtwco.com</a>
                </p>
                <div class="w-4/5 border-t-4 border-gray-300 my-8"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Assurance",
};
</script>

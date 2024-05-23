<template>
  <div>
    <TheSkeleton v-if="loading" />
    <div class=" min-h-screen"v-else>
      <TheAlert class="mx-2 rounded mb-4" :alerts="alerts" />
      <div class="no-events min-h-screen m-auto w-full h-full text-center flex align-middle" v-if="events.length < 1">
        <p  class="inline m-auto p-4 bg-white border rounded-full">Aucun cours prévu</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(event, index) in events" :key="event.id"
          class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mx-2">
          <div class="p-2">
            <div class="flex felx-rox justify-between mb-4 border-b border-gray-300 pb-2">
              <div>
                <p class="text-gray-800 text-xl font-bold capitalize">
                  {{ formatDate(event.date_event) }}
                </p>
              </div>
              <div @click="openModal(event)" class="flex flex-row justify-between items-center rounded px-1" :class="{
                  'bg-transparent': event.places === 0, // gris transparent quand il reste 0 place
                  'bg-orange-500':
                    event.places > 0 && event.places <= event.totalPlaces * 0.2, // couleur orangée quand il reste moins de 20% des places
                  'bg-green-600': event.places > event.totalPlaces * 0.2, // couleur verte par défaut
                }">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 48 48">
                  <g fill="currentColor">
                    <path
                      d="M18 16.5a4.5 4.5 0 0 1-4.5 4.5A4.499 4.499 0 0 1 9 16.5c0-2.486 2.014-4.5 4.5-4.5s4.5 2.014 4.5 4.5M4 28.333C4 24.787 10.33 23 13.5 23s9.5 1.787 9.5 5.333V36H4zM39 16.5a4.5 4.5 0 0 1-4.5 4.5a4.499 4.499 0 0 1-4.5-4.5c0-2.486 2.014-4.5 4.5-4.5s4.5 2.014 4.5 4.5M27 15a3 3 0 1 1-6 0a3 3 0 1 1 6 0m-2 13.333C25 24.787 31.33 23 34.5 23s9.5 1.787 9.5 5.333V36H25z" />
                    <path fill-rule="evenodd"
                      d="M28.75 22.185c-.266.098-.53.202-.788.313c-1.17.5-2.353 1.176-3.272 2.08c-.246.243-.48.508-.69.797a6.48 6.48 0 0 0-.69-.797c-.919-.904-2.101-1.58-3.273-2.08a16.46 16.46 0 0 0-.788-.313C20.772 21.396 22.73 21 24 21c1.27 0 3.228.396 4.75 1.185"
                      clip-rule="evenodd" />
                  </g>
                </svg>
                <p class="text-gray-800 font-semibold text-xs">
                  {{ event.places }}
                </p>
              </div>
            </div>
            <div class="flex flex-row justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-800 mb-2 uppercase">
                {{ event.name_event }}
              </h2>
              <div class="flex flex-row justify-between">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 512 512">
                  <circle cx="256" cy="56" r="56" fill="text-gray-500" />
                  <path fill="text-gray-500"
                    d="M437 128H75a27 27 0 0 0 0 54h101.88c6.91 0 15 3.09 19.58 15c5.35 13.83 2.73 40.54-.57 61.23l-4.32 24.45a.42.42 0 0 1-.12.35l-34.6 196.81A27.43 27.43 0 0 0 179 511.58a27.06 27.06 0 0 0 31.42-22.29l23.91-136.8S242 320 256 320c14.23 0 21.74 32.49 21.74 32.49l23.91 136.92a27.24 27.24 0 1 0 53.62-9.6L320.66 283a.45.45 0 0 0-.11-.35l-4.33-24.45c-3.3-20.69-5.92-47.4-.57-61.23c4.56-11.88 12.91-15 19.28-15H437a27 27 0 0 0 0-54Z" />
                </svg>
                <p class="text-gray-500">{{ event.coach }}</p>
              </div>
            </div>
            <div class="flex row mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
                <path fill="currentColor"
                  d="m12.5 12.387l2.788 2.788q.14.136.14.339t-.14.35q-.146.165-.356.155q-.21-.01-.357-.156l-2.833-2.832q-.13-.131-.186-.275q-.056-.143-.056-.296V8.423q0-.212.144-.356T12 7.923t.356.144q.143.144.143.356zM12 6q-.213 0-.357-.144q-.143-.143-.143-.356V4h1v1.5q0 .213-.144.356Q12.212 6 12 6m6 6q0-.213.144-.357q.144-.143.356-.143H20v1h-1.5q-.213 0-.356-.144Q18 12.212 18 12m-6 6q.213 0 .357.144q.143.144.143.356V20h-1v-1.5q0-.213.144-.356Q11.788 18 12 18m-6-6q0 .213-.144.357q-.143.143-.356.143H4v-1h1.5q.213 0 .356.144Q6 11.788 6 12m6.003 9q-1.866 0-3.51-.708q-1.643-.709-2.859-1.924q-1.216-1.214-1.925-2.856Q3 13.87 3 12.003q0-1.866.708-3.51q.709-1.643 1.924-2.859q1.214-1.216 2.856-1.925Q10.13 3 11.997 3q1.866 0 3.51.708q1.643.709 2.859 1.924q1.216 1.214 1.925 2.856Q21 10.13 21 11.997q0 1.866-.708 3.51q-.709 1.643-1.924 2.859q-1.214 1.216-2.856 1.925Q13.87 21 12.003 21M20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20q3.35 0 5.675-2.325T20 12m-8 0" />
              </svg>
              <p class="text-gray-800 font-semibold">De:</p>
              <p class="text-gray-800 font-semibold ml-1">
                {{ formatTime(event.date_event) }}
              </p>
              <p class="text-gray-800 font-semibold ml-1">à</p>
              <p class="text-gray-800 font-semibold ml-1">
                {{ calculateEndTime(event.date_event, event.duration) }}
              </p>

              <p class="text-gray-500 ml-1">
                ({{ formatDuration(event.duration) }})
              </p>
            </div>
            <div v-if="event.overview" class="flex flex-col">
              <p class="text-gray-500 mb-4 p-1 text-left" :class="{ 'line-clamp-3': !event.showOverflow }">
                {{ formatOverview(event.overview) }}
              </p>
              <button @click="toggleOverflow(event)"
                class="text-gray-800 font-semibold text-sm focus:outline-none text-center"
                v-if="event.overview.length > 150 || showOverflow">
                Afficher
                {{ event.showOverflow ? "moins &#x25B2;" : "plus &#x25BC;" }}
              </button>
            </div>
            <div class="flex flex-col justify-between mt-4">
              <button @click="participate(event, true)" :disabled="event.isParticipating || event.places <= 0"
                class="bg-green-600 text-white font-bold py-2 px-4 mb-2 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 ease-in-out active:bg-gray-500"
                :class="{
                  'opacity-50 cursor-not-allowed':
                    event.isParticipating || event.places <= 0,
                }">
                Je participe
              </button>

              <button @click="participate(event, false)" :disabled="!event.isParticipating"
                class="bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                :class="{
                  'opacity-50 cursor-not-allowed': !event.isParticipating,
                }">
                Je ne participe pas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TheModal :isOpen="showModal" title="Liste des participants" @close="closeModal">
      <div>
        <ul>
          <li v-for="participant in eventParticipants" :key="participant.id" class="flex flex-row items-center p-1"
            :class="userBgColor(participant)">
            <NuxtImg v-if="participant.avatar" :src="participant.avatar" alt="Avatar"
              class="w-10 h-10 rounded-full mr-2" />
            <!-- If Avatar === null -->
            <div v-else class="w-10 h-10 mr-2 rounded-full bg-gray-300 flex items-center justify-center">
              <span class="text-gray-600 text-4xl"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                  viewBox="0 0 24 24">
                  <path fill="currentColor" d="M11.5 14c4.14 0 7.5 1.57 7.5 3.5V20H4v-2.5c0-1.93 3.36-3.5 7.5-3.5m6.5 
    3.5c0-1.38-2.91-2.5-6.5-2.5S5 16.12 5 17.5V19h13zM11.5 5A3.5 3.5 0 0 1 15 
    8.5a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8 8.5A3.5 3.5 0 0 1 11.5 5m0 1A2.5 
    2.5 0 0 0 9 8.5a2.5 2.5 0 0 0 2.5 2.5A2.5 2.5 0 0 0 14 8.5A2.5 2.5 0 0 0 11.5 6" />
                </svg>
              </span>
            </div>

            <div class="ml-4">
              <span v-if="userRole === 1 || userRole === 2" @click="openDetailsModal(participant)"
                class="cursor-pointer font-bold capitalize">{{ participant.name }}</span>
              <span v-else class="font-bold capitalize">{{
                participant.name
                }}</span>
            </div>
          </li>
        </ul>
      </div>
    </TheModal>

    <TheModal :isOpen="showDetailsModal" title="Détails de l'utilisateur" @close="closeDetailsModal">
      <ul>
        <li>
          <NuxtImg v-if="userDetails.avatar" :src="userDetails.avatar" alt="Avatar"
            class="w-28 h-28 rounded-full mx-auto mb-4" />
          <!-- If Avatar === null -->
          <div v-else class="w-28 h-28 mb-4 rounded-full bg-gray-300 mx-auto flex items-center justify-center">
            <span class="text-gray-600 text-4xl"><svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"
                viewBox="0 0 24 24">
                <path fill="currentColor" d="M11.5 14c4.14 0 7.5 1.57 7.5 3.5V20H4v-2.5c0-1.93 3.36-3.5 7.5-3.5m6.5 
    3.5c0-1.38-2.91-2.5-6.5-2.5S5 16.12 5 17.5V19h13zM11.5 5A3.5 3.5 0 0 1 15 
    8.5a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8 8.5A3.5 3.5 0 0 1 11.5 5m0 1A2.5 
    2.5 0 0 0 9 8.5a2.5 2.5 0 0 0 2.5 2.5A2.5 2.5 0 0 0 14 8.5A2.5 2.5 0 0 0 11.5 6" />
              </svg>
            </span>
          </div>
        </li>
        <li class="capitalize"><strong>Nom:</strong> {{ userDetails.name }}</li>
        <li class="capitalize">
          <strong>Prénom:</strong> {{ userDetails.firstname }}
        </li>

        <li><strong>E-mail:</strong> {{ userDetails.email }}</li>
        <li>
          <strong>Numéro de téléphone:</strong>
          {{ (userDetails.tel_num && userDetails.tel_num) || "Non renseigné" }}
        </li>
        <li>
          <strong>Numéro médical:</strong>
          {{
          (userDetails.tel_medic && userDetails.tel_medic) || "Non renseigné"
          }}
        </li>
        <li>
          <strong>Numéro d'urgence:</strong>
          {{
          (userDetails.tel_emergency && userDetails.tel_emergency) ||
          "Non renseigné"
          }}
        </li>
        <li>
          <strong>Poids:</strong>
          {{ (userDetails.weight && userDetails.weight) || "Non renseigné" }}
        </li>
        <li>
          <strong>Genre:</strong> {{ userDetails.gender ? "Homme" : "Femme" }}
        </li>
        <li>
          <strong>license:</strong>
          {{ (userDetails.license && userDetails.license) || "Non renseigné" }}
        </li>
        <li>
          <strong>Date de fin de paiement:</strong>
          {{
          (userDetails.date_end_pay && userDetails.date_end_pay) ||
          "Non renseigné"
          }}
        </li>
      </ul>
    </TheModal>
    <TheModal :isOpen="showErrorModal" title="Message" @close="closeErrorModal">{{ this.errorMessage }}</TheModal>
    <!-- Bulle d'alerte -->
    <div class="alert-bubble mb-8" v-if="showAlertBubble" @click="openAlertModal">
      <span class="exclamation-mark">!</span>
    </div>

    <!-- Modale d'alerte -->
    <TheModal :isOpen="showAlertModal" title="Avertissement" @close="closeAlertModal">
      <!-- Contenu de la modale -->
      <p>{{ alertMessage }}</p>
    </TheModal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      events: [],
      showOverflow: false,
      showModal: false,
      showDetailsModal: false,
      eventParticipants: [],
      userDetails: {},
      userRole: 0,
      isParticipe: false,
      loading: true,
      showErrorModal: false,
      showAlertModal: false,
      errorMessage: null,
      showAlertBubble: false,
      alerts: [],
      nolicense: null,
      paymentExpired: null,
    };
  },
  async mounted() {
    this.checkUserRole();
    this.initialization();
    this.checkUserAlert();
    this.fetchAlerts();
  },

  methods: {
    userBgColor(participant) {
      if (participant) {
        if (
          !participant.license &&
          (!participant.date_end_pay ||
            new Date(participant.date_end_pay) < new Date())
        ) {
          return "bg-red-500 bg-opacity-75";
        }
        if (
          !participant.license ||
          !participant.date_end_pay ||
          new Date(participant.date_end_pay) < new Date()
        ) {
          return "bg-orange-500 bg-opacity-75";
        }
        if (
          participant.license &&
          participant.date_end_pay &&
          new Date(participant.date_end_pay) >= new Date()
        ) {
          return "bg-white";
        }
      }
      // Si user n'est pas défini, retournez une classe par défaut
      return "bg-gray-300"; // Ou toute autre classe par défaut que vous souhaitez utiliser
    },
    async fetchAlerts() {
      try {
        const token = localStorage.getItem("accessToken");
        const url = this.getUrl();

        const response = await fetch(`${url}/alerts`, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch alerts");
        }
        const data = await response.json();
        this.alerts = data;
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    },
    getUrl() {
      const config = useRuntimeConfig();
      const url = config.public.siteUrl;
      return url;
    },
    async initialization() {
      // Charger les événements depuis votre API lors du montage du composant
      const userId = await this.getUserIdFromToken();

      // Charger les événements
      const eventsData = await this.loadEvents();
      // Vérifier si eventsData est un objet avec la propriété _rawValue qui est un tableau
      if (eventsData && Array.isArray(eventsData._rawValue)) {
        // Récupérer le tableau d'événements depuis la propriété _rawValue
        const eventsArray = eventsData._rawValue;

        // Vérifier la participation pour chaque événement
        const eventsWithParticipation = await Promise.all(
          eventsArray.map(async (event) => {
            if (event && event.id) {
              const isParticipating = await this.checkParticipation(
                event.id,
                userId
              );

              return { ...event, isParticipating };
            } else {
              console.error(
                "L'objet event ne contient pas de propriété id :",
                event
              );
              return null; // ou un autre traitement approprié
            }
          })
        );

        // Mettre à jour les événements avec les informations de participation
        this.events = eventsWithParticipation.filter((event) => event !== null);
        this.loading = false;
      } else {
        console.error(
          "eventsData n'est pas un objet avec la propriété _rawValue qui est un tableau :",
          eventsData
        );
      }
    },
    async loadEvents() {
      try {
        const token = localStorage.getItem("accessToken");
        const url = this.getUrl();
        // Faire une requête GET à votre API pour récupérer les événements
        const response = await useFetch(`${url}/events`, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Stocker les événements dans la variable events
        return response.data;
      } catch (error) {
        console.error("Erreur lors du chargement des événements", error);
      }
    },
    async getUserIdFromToken() {
      const token = localStorage.getItem("accessToken");
      if (token) {
        // Analysez le token JWT pour obtenir les informations de l'utilisateur
        const payload = token.split(".")[1];
        const decodedPayload = atob(payload);
        const parsedPayload = JSON.parse(decodedPayload);
        return parsedPayload.sub; // Retourne la promesse de l'ID de l'utilisateur
      } else {
        // Gérer le cas où aucun token n'est disponible
        console.error("Aucun token JWT trouvé dans le localStorage");
        return null;
      }
    },
    formatDate(dateString) {
      // Convertir la chaîne de caractères de la date en objet Date
      const date = new Date(dateString);

      // Formater la date au format "jour semaine, jour mois année"
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      let formattedDate = date.toLocaleDateString("fr-FR", options);

      // Extraire les deux derniers chiffres de l'année
      const lastTwoDigitsOfYear = formattedDate.slice(-2);

      // Retirer l'année complète et ajouter les deux derniers chiffres
      formattedDate = formattedDate.replace(
        date.getFullYear(),
        lastTwoDigitsOfYear
      );

      return formattedDate;
    },
    formatTime(timeString) {
      // Créer un nouvel objet Date à partir de la chaîne de caractères de l'heure de début
      const startTime = new Date(timeString);

      // Extraire l'heure et les minutes de l'objet Date
      const hours = startTime.getHours();
      const minutes = startTime.getMinutes();

      // Formater l'heure au format HH:MM
      const formattedTime = `${hours.toString().padStart(2, "0")}h${minutes
        .toString()
        .padStart(2, "0")}`;

      return formattedTime;
    },
    nbPlaces(places) {
      console.log(places);
    },
    formatDuration(duration) {
      // Formater la durée en chaîne de caractères
      let hours = duration.hours;
      let minutes = duration.minutes;
      // Vérifier si aucune valeur n'est retournée pour les heures
      if (!hours && hours !== 0) {
        // Si aucune valeur n'est retournée, définir les heures par défaut à '00'
        hours = "00";
      } else if (hours < 10) {
        // Si les heures sont inférieures à 10, ajouter un zéro devant pour le formatage
        hours = `0${hours}`;
      }
      // Vérifier si aucune valeur n'est retournée pour les minutes
      if (!minutes && minutes !== 0) {
        // Si aucune valeur n'est retournée, définir les minutes par défaut à '00'
        minutes = "00";
      } else if (minutes < 10) {
        // Si les minutes sont inférieures à 10, ajouter un zéro devant pour le formatage
        minutes = `0${minutes}`;
      }
      return `${hours}h ${minutes}`;
    },
    toggleOverflow(event) {
      event.showOverflow = !event.showOverflow;
    },
    formatOverview(overview) {
      // Formater le texte en divisant en lignes de 50 caractères et passer automatiquement à la ligne suivante
      let formattedOverview = "";
      for (let i = 0; i < overview.length; i += 20) {
        formattedOverview += overview.substring(i, i + 20) + "\n"; // Ajouter un saut de ligne après chaque ligne de 50 caractères
      }
      return formattedOverview;
    },
    async openModal(event) {
      const token = localStorage.getItem("accessToken");
      const url = this.getUrl();
      try {
        const response = await fetch(
          `${url}/lists-members/by-event/${event.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch event participants");
        }
        const data = await response.json();

        // Filtrer les participants ayant isParticipant = true
        const participants = data.filter(
          (participant) => participant.isParticipant === true
        );

        // Récupérer les utilisateurs correspondant aux IDs des participants
        const usersPromises = participants.map(async (participant) => {
          const userResponse = await fetch(
            `${url}/users/${participant.userId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!userResponse.ok) {
            throw new Error("Failed to fetch user");
          }
          const userData = await userResponse.json();
          return userData;
        });

        // Attendre la résolution de toutes les promesses pour obtenir les utilisateurs
        const users = await Promise.all(usersPromises);

        // Mettez à jour la liste des participants avec les données récupérées des utilisateurs
        this.eventParticipants = users.map((user) => ({
          id: user.id,
          async openModal(event) {
            const token = localStorage.getItem("accessToken");
            const url = this.getUrl();
            try {
              const response = await fetch(
                `${url}/lists-members/by-event/${event.id}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              if (!response.ok) {
                throw new Error("Failed to fetch event participants");
              }
              const data = await response.json();

              // Filtrer les participants ayant isParticipant = true
              const participants = data.filter(
                (participant) => participant.isParticipant === true
              );

              // Récupérer les utilisateurs correspondant aux IDs des participants
              const usersPromises = participants.map(async (participant) => {
                const userResponse = await fetch(
                  `${url}/users/${participant.userId}`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                if (!userResponse.ok) {
                  throw new Error("Failed to fetch user");
                }
                const userData = await userResponse.json();
                return userData;
              });

              // Attendre la résolution de toutes les promesses pour obtenir les utilisateurs
              const users = await Promise.all(usersPromises);

              // Mettez à jour la liste des participants avec les données récupérées des utilisateurs
              this.eventParticipants = users.map((user) => ({
                id: user.id,
                license: user.license ? `${user.license}` : null,
                date_end_pay: user.date_end_pay ? `${user.date_end_pay}` : null,
                avatar: user.avatar ? `${user.avatar}` : null,
                name: `${user.firstname} ${user.name}`, // Ajouter le nom et le prénom de l'utilisateur
              }));
              this.showModal = true; // Afficher la modale une fois les données récupérées
            } catch (error) {
              console.error("Error fetching event participants:", error);
              // Gérer les erreurs d'une manière appropriée, par exemple, afficher un message à l'utilisateur
            }
          },
          license: user.license ? `${user.license}` : "",
          date_end_pay: user.date_end_pay ? `${user.date_end_pay}` : "",
          avatar: user.avatar ? `${user.avatar}` : null,
          name: `${user.firstname} ${user.name}`, // Ajouter le nom et le prénom de l'utilisateur
        }));
        this.showModal = true; // Afficher la modale une fois les données récupérées
      } catch (error) {
        console.error("Error fetching event participants:", error);
        // Gérer les erreurs d'une manière appropriée, par exemple, afficher un message à l'utilisateur
      }
    },

    async openDetailsModal(participant) {
      const token = localStorage.getItem("accessToken");
      const url = this.getUrl();
      try {
        const response = await fetch(`${url}/users/${participant.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        const userDetails = await response.json();
        this.userDetails = userDetails;

        this.showDetailsModal = true;
      } catch (error) {
        console.error("Error fetching user details:", error);
        // Gérer les erreurs d'une manière appropriée, par exemple, afficher un message à l'utilisateur
      }
    },
    // Méthode pour fermer la modale
    closeModal() {
      this.showModal = false;
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
    },
    async participate(event, value) {
      try {
        const token = localStorage.getItem("accessToken");
        const userId = await this.getUserIdFromToken();
        const url = this.getUrl();
        // Vérifie si l'utilisateur est déjà inscrit à l'événement
        if (
          !this.eventParticipants.some(
            (participant) => participant.id === userId
          )
        ) {
          // Si l'utilisateur n'est pas inscrit, ajoutez son ID à la liste des participants
          const response = await fetch(
            `${url}/lists-members/${event.id}/${userId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                eventId: event.id, // Utilisation de l'ID de l'événement spécifique
                userId: userId,
                isParticipant: value,
              }),
            }
          );

          if (!response.ok) {
            this.openErrorModal();
            this.errorMessage = "Désolé, il n'y a plus de place pour ce cours";
          }

          this.initialization();
        }
      } catch (error) {
        console.error("Error participating in the event:", error);
        // Gérer les erreurs d'une manière appropriée, par exemple, afficher un message à l'utilisateur
      }
    },

    calculateEndTime(startTime, duration) {
      // Créer un nouvel objet Date à partir de la chaîne de caractères de l'heure de début
      const startDate = new Date(startTime);

      // Convertir la durée en minutes totales
      const totalMinutes = (duration.hours || 0) * 60 + (duration.minutes || 0);

      // Ajouter les minutes totales à l'heure de début de l'événement
      const endTime = new Date(startDate.getTime() + totalMinutes * 60000);

      // Formater l'heure de fin pour l'affichage
      const formattedEndTime = this.formatTime(endTime);

      return formattedEndTime;
    },
    checkUserRole() {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
        this.userRole = decodedToken.role;
      } else {
        this.userRole = 0;
      }
    },
    async checkParticipation(eventId, userId) {
      const token = localStorage.getItem("accessToken");
      const url = this.getUrl();
      try {
        const response = await fetch(
          `${url}/lists-members/${eventId}/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch participation data");
        }

        // Vérifier si la réponse contient des données JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          // Lire le corps de la réponse et parser les données JSON
          const data = await response.json();

          // Vérifiez si l'utilisateur participe à l'événement
          const isParticipating = data.isParticipant;

          return isParticipating;
        } else {
          throw new Error("Response does not contain valid JSON data");
        }
      } catch (error) {
        console.error("Error checking participation:", error);
        return false; // Par défaut, l'utilisateur ne participe pas
      }
    },
    openErrorModal() {
      this.showErrorModal = true;
    },
    //  Close Modal Password change
    closeErrorModal() {
      this.showErrorModal = false;

      this.errorMessage = "";
    },
    async checkUserAlert() {
      try {
        const token = localStorage.getItem("accessToken");
        const userId = await this.getUserIdFromToken();
        const url = this.getUrl();

        // Faire une requête pour récupérer les informations de l'utilisateur
        const response = await fetch(`${url}/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();

        // Vérifier les conditions nécessaires pour afficher l'alerte
        this.nolicense = !userData.license;
        this.paymentExpired = new Date(userData.date_end_pay) < new Date();

        // Afficher la bulle d'alerte si nécessaire
        this.showAlertBubble = this.noLicense || this.paymentExpired;
      } catch (error) {
        console.error("Error checking user alert:", error);
      }
    },

    openAlertModal() {
      this.showAlertModal = true;

      // Définir le message d'alerte en fonction des conditions
      if (this.noLicense && this.paymentExpired) {
        this.alertMessage =
          "Votre Paiment a expiré et votre license est manquante. Veuillez les mettre à jour.";
      } else if (this.noLicence) {
        this.alertMessage =
          "Votre license est manquante. Veuillez la mettre à jour.";
      } else if (this.paymentExpired) {
        this.alertMessage =
          "Votre paiment a expiré. Veuillez le mettre à jour.";
      }
    },

    closeAlertModal() {
      this.showAlertModal = false;
    },
  },
};
</script>

<style>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
  /* Nombre maximum de lignes à afficher */
}

.alert-bubble {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #ff6347;
  /* Couleur rouge */
  color: #fff;
  /* Texte en blanc */
  border-radius: 50%;
  /* Pour donner une forme de cercle */
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  /* Ombre légère */
}

.alert-bubble:hover {
  transform: scale(1.1);
  /* Effet de zoom au survol */
}

.exclamation-mark {
  font-size: 24px;
}

.alert-text {
  font-size: 12px;
  margin-left: 5px;
}
</style>

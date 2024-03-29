<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div
      v-for="(event, index) in events"
      :key="event.id"
      class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mx-2"
    >
      <div class="p-2">
        <div
          class="flex felx-rox justify-between mb-4 border-b border-gray-300 pb-2"
        >
          <div>
            <p class="text-gray-800 text-xl font-bold capitalize">
              {{ formatDate(event.date_event) }}
            </p>
          </div>
          <div
            @click="openModal(event)"
            class="flex flex-row justify-between items-center rounded px-1"
            :class="{
              'bg-transparent': event.places === 0, // gris transparent quand il reste 0 place
              'bg-orange-500':
                event.places > 0 && event.places <= event.totalPlaces * 0.2, // couleur orangée quand il reste moins de 20% des places
              'bg-green-600': event.places > event.totalPlaces * 0.2, // couleur verte par défaut
            }"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 48 48"
            >
              <g fill="currentColor">
                <path
                  d="M18 16.5a4.5 4.5 0 0 1-4.5 4.5A4.499 4.499 0 0 1 9 16.5c0-2.486 2.014-4.5 4.5-4.5s4.5 2.014 4.5 4.5M4 28.333C4 24.787 10.33 23 13.5 23s9.5 1.787 9.5 5.333V36H4zM39 16.5a4.5 4.5 0 0 1-4.5 4.5a4.499 4.499 0 0 1-4.5-4.5c0-2.486 2.014-4.5 4.5-4.5s4.5 2.014 4.5 4.5M27 15a3 3 0 1 1-6 0a3 3 0 1 1 6 0m-2 13.333C25 24.787 31.33 23 34.5 23s9.5 1.787 9.5 5.333V36H25z"
                />
                <path
                  fill-rule="evenodd"
                  d="M28.75 22.185c-.266.098-.53.202-.788.313c-1.17.5-2.353 1.176-3.272 2.08c-.246.243-.48.508-.69.797a6.48 6.48 0 0 0-.69-.797c-.919-.904-2.101-1.58-3.273-2.08a16.46 16.46 0 0 0-.788-.313C20.772 21.396 22.73 21 24 21c1.27 0 3.228.396 4.75 1.185"
                  clip-rule="evenodd"
                />
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 512 512"
            >
              <circle cx="256" cy="56" r="56" fill="text-gray-500" />
              <path
                fill="text-gray-500"
                d="M437 128H75a27 27 0 0 0 0 54h101.88c6.91 0 15 3.09 19.58 15c5.35 13.83 2.73 40.54-.57 61.23l-4.32 24.45a.42.42 0 0 1-.12.35l-34.6 196.81A27.43 27.43 0 0 0 179 511.58a27.06 27.06 0 0 0 31.42-22.29l23.91-136.8S242 320 256 320c14.23 0 21.74 32.49 21.74 32.49l23.91 136.92a27.24 27.24 0 1 0 53.62-9.6L320.66 283a.45.45 0 0 0-.11-.35l-4.33-24.45c-3.3-20.69-5.92-47.4-.57-61.23c4.56-11.88 12.91-15 19.28-15H437a27 27 0 0 0 0-54Z"
              />
            </svg>
            <p class="text-gray-500">{{ event.coach }}</p>
          </div>
        </div>
        <div class="flex flex row mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="m12.5 12.387l2.788 2.788q.14.136.14.339t-.14.35q-.146.165-.356.155q-.21-.01-.357-.156l-2.833-2.832q-.13-.131-.186-.275q-.056-.143-.056-.296V8.423q0-.212.144-.356T12 7.923t.356.144q.143.144.143.356zM12 6q-.213 0-.357-.144q-.143-.143-.143-.356V4h1v1.5q0 .213-.144.356Q12.212 6 12 6m6 6q0-.213.144-.357q.144-.143.356-.143H20v1h-1.5q-.213 0-.356-.144Q18 12.212 18 12m-6 6q.213 0 .357.144q.143.144.143.356V20h-1v-1.5q0-.213.144-.356Q11.788 18 12 18m-6-6q0 .213-.144.357q-.143.143-.356.143H4v-1h1.5q.213 0 .356.144Q6 11.788 6 12m6.003 9q-1.866 0-3.51-.708q-1.643-.709-2.859-1.924q-1.216-1.214-1.925-2.856Q3 13.87 3 12.003q0-1.866.708-3.51q.709-1.643 1.924-2.859q1.214-1.216 2.856-1.925Q10.13 3 11.997 3q1.866 0 3.51.708q1.643.709 2.859 1.924q1.216 1.214 1.925 2.856Q21 10.13 21 11.997q0 1.866-.708 3.51q-.709 1.643-1.924 2.859q-1.214 1.216-2.856 1.925Q13.87 21 12.003 21M20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20q3.35 0 5.675-2.325T20 12m-8 0"
            />
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
        <div class="flex flex-col">
          <p
            class="text-gray-500 mb-4 p-1 text-left"
            :class="{ 'line-clamp-3': !event.showOverflow }"
          >
            {{ formatOverview(event.overview) }}
          </p>
          <button
            @click="toggleOverflow(event)"
            class="text-gray-800 font-semibold text-sm focus:outline-none text-center"
            v-if="event.overview.length > 150 || showOverflow"
          >
            Afficher
            {{ event.showOverflow ? "moins &#x25B2;" : "plus &#x25BC;" }}
          </button>
        </div>
        <div class="flex flex-col justify-between mt-4">
          <button
            @click="participate(event, true)"
            :disabled="event.isParticipating"
            class="bg-green-600 text-white font-bold py-2 px-4 mb-2 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 ease-in-out active:bg-gray-500"
            :class="{
              'opacity-50 cursor-not-allowed': event.isParticipating,
            }"
          >
            Je participe
          </button>

          <button
            @click="participate(event, false)"
            :disabled="!event.isParticipating"
            class="bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            :class="{
              'opacity-50 cursor-not-allowed': !event.isParticipating,
            }"
          >
            Je ne participe pas
          </button>
        </div>
      </div>
    </div>
  </div>
  <TheModal
    :isOpen="showModal"
    title="Liste des participants"
    @close="closeModal"
  >
    <ul>
      <li
        v-for="participant in eventParticipants"
        :key="participant.id"
        :class="{
          'bg-orange-600':
            (!participant.licence ||
              !participant.date_end_pay ||
              new Date(participant.date_end_pay.data) < new Date()) &&
            (userRole === 1 || userRole === 2),
          'bg-red-600':
            !participant.licence &&
            (!participant.date_end_pay ||
              new Date(participant.date_end_pay.data) < new Date()) &&
            (userRole === 1 || userRole === 2),
          'bg-white':
            participant.licence &&
            (participant.date_end_pay ||
              new Date(participant.date_end_pay.data) >= new Date()) &&
            (userRole === 1 || userRole === 2),
        }"
      >
        <div>
          <span
            v-if="userRole === 1 || userRole === 2"
            @click="openDetailsModal(participant)"
            class="cursor-pointer capitalize"
            >{{ participant.name }}</span
          >
          <span v-else class="capitalize">{{ participant.name }}</span>
        </div>
      </li>
    </ul>
  </TheModal>

  <TheModal
    :isOpen="showDetailsModal"
    title="Détails de l'utilisateur"
    @close="closeDetailsModal"
  >
    <ul>
      <li class="capitalize">
        <strong>Nom:</strong> {{ userDetails.name.data }}
      </li>
      <li class="capitalize">
        <strong>Prénom:</strong> {{ userDetails.firstname.data }}
      </li>

      <li><strong>E-mail:</strong> {{ userDetails.email.data }}</li>
      <li>
        <strong>Poids:</strong>
        {{ (userDetails.weight && userDetails.weight.data) || "Non renseigné" }}
      </li>
      <li>
        <strong>Genre:</strong> {{ userDetails.gender ? "Homme" : "Femme" }}
      </li>
      <li>
        <strong>Licence:</strong>
        {{
          (userDetails.licence && userDetails.licence.data) || "Non renseigné"
        }}
      </li>
      <li>
        <strong>Date de fin de paiement:</strong>
        {{
          (userDetails.date_end_pay && userDetails.date_end_pay.data) ||
          "Non renseigné"
        }}
      </li>
    </ul>
  </TheModal>
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
    };
  },
  async mounted() {
    this.initialization();
  },

  methods: {
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
              console.log("event : " + event.id);
              console.log("user : " + userId);
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
        // Faire une requête GET à votre API pour récupérer les événements
        const response = await useFetch("http://localhost:8080/events", {
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
      console.log(event);
      try {
        const response = await fetch(
          `http://localhost:8080/lists-members/by-event/${event.id}`,
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
        console.log(data);

        // Filtrer les participants ayant isParticipant = true
        const participants = data.filter(
          (participant) => participant.isParticipant === true
        );

        // Récupérer les utilisateurs correspondant aux IDs des participants
        const usersPromises = participants.map(async (participant) => {
          const userResponse = await fetch(
            `http://localhost:8080/users/${participant.userId}`,
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
          name: `${user.firstname.data} ${user.name.data}`, // Ajouter le nom et le prénom de l'utilisateur
        }));
        this.showModal = true; // Afficher la modale une fois les données récupérées
      } catch (error) {
        console.error("Error fetching event participants:", error);
        // Gérer les erreurs d'une manière appropriée, par exemple, afficher un message à l'utilisateur
      }
    },

    async openDetailsModal(participant) {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await fetch(
          `http://localhost:8080/users/${participant.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
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

        // Vérifie si l'utilisateur est déjà inscrit à l'événement
        if (
          !this.eventParticipants.some(
            (participant) => participant.id === userId
          )
        ) {
          // Si l'utilisateur n'est pas inscrit, ajoutez son ID à la liste des participants
          const response = await fetch(
            `http://localhost:8080/lists-members/${event.id}/${userId}`,
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
            alert("Désolé, il n'y a plus de place pour ce cours");
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
      console.log("event : " + eventId);
      console.log("user : " + userId);
      console.log(eventId);

      const response = await fetch(
        `http://localhost:8080/lists-members/${eventId}/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Vérifiez si l'utilisateur participe à l'événement
        const isParticipe = data.isParticipant;

        return isParticipe;
      } else {
        console.error(
          "Erreur lors de la récupération des données:",
          response.statusText
        );
        return false; // Par défaut, l'utilisateur ne participe pas
      }
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
</style>

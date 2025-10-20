<template>
  <div>
    <TheSkeleton v-if="loading" />
    <div class="min-h-screen" v-else>
      <TheAlert class="mx-2 rounded mb-4" :alerts="alerts" />
      <NoEvents v-if="events.length < 1" />
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EventCard v-for="(event, index) in formattedEvents" :key="event.id" :event="event" @open-modal="openModal"
          @participate="participate" @toggle-overflow="toggleOverflow" />
      </div>
    </div>
    <!--MODAL LISTE DES PARTICIPANTS-->
    <ParticipantsListModal v-if="showModal" :isOpen="showModal" @close="closeModal"
      :eventParticipants="eventParticipants" :userRole="userRole" @open-details-modal="openDetailsModal" />

    <!--MODAL DETAILS PARTICIPANTS-->
    <ParticipantDetailsModal v-if="showDetailsModal" :isOpen="showDetailsModal" @close="closeDetailsModal"
      :userDetails="userDetails" />

    <!--MODAL MESSAGE D'ERREUR-->
    <TheModal v-if="showErrorModal" @close="closeErrorModal" title="Erreur">
      <p>{{ errorMessage }}</p>
    </TheModal>

    <!--ALERT INFO  MODAL-->
    <AlertBubble :backgroundColor="alertColor" v-if="showAlertBubble" @click="openAlertModal" />
    <TheModal :isOpen="showAlertModal" v-if="showAlertModal" @close="closeAlertModal" title="Alerte">
      <p v-html="alertMessage"></p>
    </TheModal>
  </div>
</template>

<script>
import NoEvents from './NoEvents.vue';
import EventCard from './EventCard.vue';
import ParticipantsListModal from './ParticipantsListModal.vue';
import ParticipantDetailsModal from './ParticipantDetailsModal.vue';
import AlertBubble from './AlertBubble.vue';

export default {
  data() {
    return {
      events: [],
      showModal: false,
      showDetailsModal: false,
      eventParticipants: [],
      userDetails: {},
      userRole: 0,
      loading: true,
      showErrorModal: false,
      showAlertModal: false,
      errorMessage: null,
      showAlertBubble: false,
      alerts: [],
      noLicense: null,
      paymentExpired: null,
      alertMessage: "", // Ajout d'un message d'alerte par défaut
      paramAlertColor1: true,
      paramAlertColor2: true
    };
  },
  async mounted() {
    this.checkUserRole();
    await this.initialization();
    this.checkUserAlert();
    this.fetchAlerts();
  },
  computed: {
    formattedEvents() {
      return this.events
        .filter((ev) => (typeof ev?.is_visible === 'boolean' ? ev.is_visible : (ev?.isVisible ?? true)) === true)
        .map(event => ({
          ...event,
          formattedDate: this.formatDate(event.date_event),
          formattedTime: this.formatTime(event.date_event),
          formattedEndTime: this.calculateEndTime(event.date_event, event.duration),
          formattedOverview: this.formatOverview(event.overview),
          formattedDuration: this.formatDuration(event.duration),
        }));
    },
    alertColor() {
      const incorrectParams = [this.paramAlertColor1, this.paramAlertColor2].filter(param => !param).length;
      if (incorrectParams === 1) {
        return 'orange';
      } else if (incorrectParams > 1) {
        return 'red';
      } else {
        return 'green'; // vous pouvez ajouter une couleur par défaut
      }
    }
  },
  methods: {
    async fetchAlerts() {
      try {
        const token = this.getToken();
        const url = this.getUrl();
        const data = await this.apiFetch(`${url}/alerts`, token);
        this.alerts = data;
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    },
    getToken() {
      return localStorage.getItem("accessToken");
    },
    getUrl() {
      const config = useRuntimeConfig();
      return config.public.siteUrl;
    },
    async apiFetch(endpoint, token) {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      return response.json();
    },
    async initialization() {
      const userId = await this.getUserIdFromToken();
      const eventsData = await this.loadEvents();

      if (eventsData && Array.isArray(eventsData._rawValue)) {
        // ✅ Ceinture et bretelles : on garde uniquement les visibles
        const visibleOnly = eventsData._rawValue.filter(ev => (ev?.is_visible ?? true) === true);

        const eventsWithParticipation = await Promise.all(
          visibleOnly.map(async (event) => {
            if (event && event.id) {
              const isParticipating = await this.checkParticipation(event.id, userId);
              return { ...event, isParticipating };
            } else {
              console.error("L'objet event ne contient pas de propriété id :", event);
              return null;
            }
          })
        );

        this.events = eventsWithParticipation.filter(event => event !== null);
        this.loading = false;
      } else {
        console.error("eventsData n'est pas un objet avec la propriété _rawValue qui est un tableau :", eventsData);
      }
    },

    async loadEvents() {
      try {
        const token = this.getToken();
        const url = this.getUrl();
        const response = await useFetch(`${url}/events`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data;
      } catch (error) {
        console.error("Erreur lors du chargement des événements", error);
      }
    },
    async getUserIdFromToken() {
      const token = this.getToken();
      if (token) {
        const payload = token.split(".")[1];
        const decodedPayload = atob(payload);
        const parsedPayload = JSON.parse(decodedPayload);
        return parsedPayload.sub;
      } else {
        console.error("Aucun token JWT trouvé dans le localStorage");
        return null;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      let formattedDate = date.toLocaleDateString("fr-FR", options);
      const lastTwoDigitsOfYear = formattedDate.slice(-2);
      formattedDate = formattedDate.replace(date.getFullYear(), lastTwoDigitsOfYear);
      return formattedDate;
    },
    formatTime(timeString) {
      const startTime = new Date(timeString);
      const hours = startTime.getHours();
      const minutes = startTime.getMinutes();
      return `${hours.toString().padStart(2, "0")}h${minutes.toString().padStart(2, "0")}`;
    },
    formatDuration(duration) {
      let hours = duration.hours !== undefined ? duration.hours : 0;
      let minutes = duration.minutes !== undefined ? duration.minutes : 0;
      hours = hours < 10 ? `0${hours}` : hours;
      minutes = minutes < 10 ? `0${minutes}` : minutes;
      return `${hours}h${minutes}`;
    },
    toggleOverflow(eventId) {
      const event = this.events.find(e => e.id === eventId);
      if (event) {
        event.showOverflow = !event.showOverflow;
      }
    },
    formatOverview(overview) {
      let formattedOverview = "";
      for (let i = 0; i < overview.length; i += 20) {
        formattedOverview += overview.substring(i, i + 20) + "\n";
      }
      return formattedOverview;
    },
    async openModal(event) {
      try {
        const token = this.getToken();
        const url = this.getUrl();

        // Fetch participants for the given event
        const response = await fetch(`${url}/lists-members/participants/${event.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch event participants");
        }

        // Directly assign the response data to eventParticipants
        this.eventParticipants = await response.json();

        this.showModal = true;
      } catch (error) {
        console.error("Error fetching event participants:", error);
      }
    },
    async openDetailsModal(participant) {
      try {
        const token = this.getToken();
        const url = this.getUrl();
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
        this.userDetails = await response.json();
        this.showDetailsModal = true;
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    },
    closeModal() {
      this.showModal = false;
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
    },

    //Gestion de participation a un event
    async participate(event, value) {
      try {
        const token = this.getToken();
        const url = this.getUrl();
        const userId = await this.getUserIdFromToken();

        // Vérification de l'état de participation précédent
        const previousParticipation = await this.checkParticipation(event.id, userId);

        const requestBody = {
          eventId: event.id,
          userId: userId,
          isParticipant: value,
        };
        const response = await fetch(`${url}/lists-members/${event.id}/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
          throw new Error("Failed to update participation status");
        }

        const index = this.events.findIndex(e => e.id === event.id);
        if (index !== -1) {
          this.events[index].isParticipating = value;
        }

        // Mise à jour de l'état de participation localement
        const eventIndex = this.events.findIndex(e => e.id === event.id);
        if (eventIndex !== -1) {
          const currentParticipation = this.events[eventIndex].isParticipating;

          // Comparer l'état actuel avec l'état précédent
          if (previousParticipation !== undefined) {
            if (currentParticipation) {
              this.events[eventIndex].places -= 1;
            } else {
              this.events[eventIndex].places += 1;
            }
          }
        }

      } catch (error) {
        console.error("Error updating participation status:", error);
      }
    },

    async checkParticipation(eventId, userId) {
      const token = this.getToken();
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

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          const isParticipating = data.isParticipant;
          return isParticipating;
        } else {
          throw new Error("Response does not contain valid JSON data");
        }
      } catch (error) {
        console.error("Error checking participation:", error);
        return false;
      }
    },
    calculateEndTime(startTime, duration) {
      const startDate = new Date(startTime);
      const totalMinutes = (duration.hours || 0) * 60 + (duration.minutes || 0);
      const endTime = new Date(startDate.getTime() + totalMinutes * 60000);
      return this.formatTime(endTime);
    },
    checkUserRole() {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const payload = token.split(".")[1];
        const decodedPayload = atob(payload);
        const parsedPayload = JSON.parse(decodedPayload);
        this.userRole = parsedPayload.role;
      }
    },

    async fetchUserLicenses(userId) {
      const token = this.getToken();
      const url = this.getUrl();
      const res = await fetch(`${url}/users/${userId}/licenses`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch user licenses');
      return res.json();
    },

    async checkUserAlert() {
      try {
        const token = localStorage.getItem("accessToken");
        const userId = await this.getUserIdFromToken();
        const url = this.getUrl();

        // reset du message à chaque appel
        this.alertMessage = "";
        this.paramAlertColor1 = true;
        this.paramAlertColor2 = true;

        // 1) Récup user (pour la date de paiement)
        const response = await fetch(`${url}/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch user data");
        const userData = await response.json();

        // 2) Récup licences (nouveau système)
        const licenses = await this.fetchUserLicenses(userId);

        // On considère “licence présente” si au moins UNE licence non-LEGACY existe
        // et qu’on a un numéro (number_plain si dispo, sinon fallback sur number_encrypted.data)
        const hasModernLicense = Array.isArray(licenses) && licenses.some(l =>
          l?.federation?.code !== 'LEGACY' && (!!l?.number_plain || !!l?.number_encrypted?.data)
        );

        this.noLicense = !hasModernLicense;

        // Payment expiré (on ne force pas si la date est absente/invalid)
        let paymentExpired = false;
        if (userData?.date_end_pay) {
          const end = new Date(userData.date_end_pay);
          if (!isNaN(end)) paymentExpired = end < new Date();
        }
        this.paymentExpired = paymentExpired;

        // Messages + couleurs
        if (this.noLicense) {
          this.alertMessage += "• Aucun numéro de licence renseigné. <br>";
          this.paramAlertColor1 = false;
        }
        if (this.paymentExpired) {
          this.alertMessage += "• Votre paiement a expiré, merci de prendre contact avec la trésorerie. <br>";
          this.paramAlertColor2 = false;
        }

        // Affichage bulle si au moins une alerte
        this.showAlertBubble = this.noLicense || this.paymentExpired;
      } catch (error) {
        console.error("Error checking user alert:", error);
        // En cas d'erreur, on n’affiche pas d’alerte “fausse”
        this.showAlertBubble = false;
      }
    },

    async fetchUserDetails(userId) {
      const token = this.getToken();
      const url = this.getUrl();
      const response = await fetch(`${url}/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      return response.json();
    },
    triggerErrorModal(error) {
      this.errorMessage = error.message;
      this.showErrorModal = true;
    },
    closeErrorModal() {
      this.showErrorModal = false;
    },
    openAlertModal() {
      this.showAlertModal = true;
    },
    closeAlertModal() {
      this.showAlertModal = false;
    },
  },
};
</script>
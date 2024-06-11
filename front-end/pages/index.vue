<template>
  <div>
    <CardsList v-if="isAuthenticated" />
    <TheAuth v-else />
  </div>
</template>

<script>
export default {
  data() {
    return {
      isAuthenticated: null,
    };
  },
  created() {
    // Call the method who verify if the user is connected
    this.checkAuthentication();
  },
  methods: {
    // Check if the user is authentified
    checkAuthentication() {
      // Keep the token from the local storage
      const accessToken = localStorage.getItem("accessToken");
      // Check if the token is Valid
      if (accessToken) {
        // Décodez le token pour obtenir la date d'expiration
        const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
        const expirationDate = new Date(decodedToken.exp * 1000);
        if (expirationDate < new Date()) {
          localStorage.removeItem("accessToken");
          document.location.href = "/";
        }
        // update
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
      }
    },
  },
};
</script>

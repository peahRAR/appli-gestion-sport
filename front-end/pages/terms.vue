<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-6">{{ title }}</h1>
    <div v-for="(section, index) in sections" :key="index" class="mb-8">
      <h2 class="text-xl font-semibold mb-4">{{ section.title }}</h2>
      <p class="text-gray-700">{{ section.content }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: "Conditions d'Utilisation de L'Application MMA Baisieux",
      sections: [
        {
          title: "Introduction",
          content: "Bienvenue sur L'Application MMA Baisieux, une plateforme réservée aux membres du club MMA Baisieux. Cette application est conçue pour vous permettre de suivre et gérer votre présence aux cours de manière efficace. En accédant à notre application et en l'utilisant, vous acceptez d'être lié par les présentes conditions d'utilisation. Veuillez les lire attentivement."
        },
        {
          title: "Modifications des Conditions",
          content: "Nous nous réservons le droit de modifier ou de remplacer ces conditions à tout moment. Vous serez informé de toute modification significative. Votre utilisation continue de l'application après de telles modifications constitue votre acceptation des nouvelles conditions."
        },
        {
          title: "Collecte et Utilisation des Données Personnelles",
          content: "Nous collectons des données personnelles telles que votre nom, prénom, genre, âge, et poids. Ces informations sont essentielles pour la gestion d'événements et l'organisation de combats, permettant aux coachs de faire des appariements judicieux. Nous utilisons également des cookies pour améliorer votre expérience, notamment pour la gestion des sessions et l'affichage des avatars.\n\nToutes vos données sont cryptées et stockées avec la plus grande sécurité dans notre base de données. Nous nous engageons à ne pas vendre, louer, ou partager vos informations avec des tiers sans votre consentement, sauf si requis par la loi."
        },
        {
          title: "Politique de Confidentialité",
          content: "Nous accordons une grande importance à la confidentialité de vos données personnelles. Voici comment nous collectons, utilisons et protégeons vos informations :\n\nCollecte d'Informations : Nous collectons des informations nécessaires au fonctionnement de l'application, telles que votre identité et des données physiques (nom, prénom, genre, âge, poids), ainsi que des informations techniques à travers l'utilisation de cookies.\nUtilisation des Informations : Vos données sont utilisées exclusivement pour la gestion d'événements au sein du club, l'organisation des combats, et l'amélioration de votre expérience utilisateur.\nPartage des Informations : Nous ne partageons pas et ne revendons pas vos données à des tiers.\nSécurité des Données : Vos données sont cryptées et protégées contre l'accès non autorisé. Nous appliquons des mesures de sécurité strictes pour assurer leur confidentialité.\nVos Droits : Vous avez le droit de consulter, modifier ou supprimer vos données personnelles à tout moment. Certaines informations peuvent être modifiées directement depuis votre espace personnel. Pour toute autre demande, veuillez contacter notre support à contact@astrocom.fr."
        },
        {
          title: "Utilisation des Cookies",
          content: "Nous utilisons des cookies pour faciliter votre connexion et personnaliser votre expérience utilisateur. Vous avez la possibilité de refuser l'utilisation des cookies, sachant que cela peut limiter certaines fonctionnalités de l'application."
        },
        {
          title: "Restrictions d'Utilisation",
          content: "Il est interdit d'utiliser L'Application MMA Baisieux pour toute activité illégale, frauduleuse, ou abusive. Tout comportement nuisant à l'expérience utilisateur ou à l'intégrité de l'application entraînera des sanctions, y compris la suspension de l'accès."
        },
        {
          title: "Limitation de Responsabilité",
          content: "L'Application MMA Baisieux ne peut être tenu responsable des dommages résultant de l'utilisation ou de l'impossibilité d'utiliser l'application, dans la limite permise par la loi. Nous nous efforçons d'assurer la disponibilité et la sécurité de l'application, sans pouvoir garantir une absence totale d'interruption ou de faille de sécurité."
        },
        {
          title: "Droits des Utilisateurs",
          content: "Vous avez le droit d'accéder, de rectifier, et de supprimer vos données personnelles. Pour toute demande ou question relative à vos données, veuillez contacter notre support à contact@astrocom.fr."
        },
        {
          title: "Contact et Support",
          content: "Pour toute question ou demande de support, veuillez nous contacter à contact@astrocom.fr."
        },
        {
          title: "Acceptation des Conditions",
          content: "En utilisant L'Application MMA Baisieux, vous reconnaissez avoir lu et compris ces conditions d'utilisation et acceptez d'être lié par elles."
        }
      ]
    };
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>

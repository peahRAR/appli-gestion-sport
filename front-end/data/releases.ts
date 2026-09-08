// /data/releases.ts
export type Release = {
  version: string;      // ex: "1.4.2"
  date: string;         // ISO: "2025-10-20"
  title?: string;       // court sous-titre
  changes: string[];    // puces
};

export const releases: Release[] = [
  {
    version: "1.8",
    date: "2026-09-08",
    title: "Grade FMMAF, calendrier mensuel, notifications push et sécurité du mot de passe",
    changes: [
      "Nouveautés — Grade et formation FMMAF : une barre de couleur (grade) et un badge (formation, ex. « BF2 », « Arbitre ») apparaissent désormais devant le nom de chaque licencié FMMAF, partout dans l'application",
      "Nouveautés — Calendrier : nouvelle vue mensuelle (façon Calendrier Apple), avec bascule Liste / Calendrier mémorisée",
      "Nouveautés — Notifications push : activables depuis Mon Profil pour être alerté dès qu'un nouveau cours est ajouté (nécessite d'avoir ajouté l'application à l'écran d'accueil sur iPhone)",
      "Nouveautés — Admin : nouvelle section « Comptes désactivés pour inactivité », avec réactivation ou suppression définitive ; les comptes inactifs depuis plus de 3 mois sont désormais désactivés automatiquement (jamais les comptes administrateurs)",
      "Améliorations — Mot de passe : la liste des caractères spéciaux acceptés est nettement élargie (dont le point et le tiret), et la règle est désormais strictement identique partout dans l'application",
      "Améliorations — Réinitialisation du mot de passe : message clair et lien direct vers « Mot de passe oublié » quand un lien a expiré, a déjà été utilisé, ou est invalide",
      "Améliorations — En mode « ajouté à l'écran d'accueil », l'application se remet correctement à jour après avoir été mise en arrière-plan, et propose un bouton d'actualisation ainsi qu'un bandeau discret pour recharger une nouvelle version",
      "Corrections — Un mot de passe contenant uniquement un point ou un tiret comme caractère spécial n'est plus rejeté à tort",
      "Corrections — Le changement de mot de passe depuis Mon Profil, qui ne fonctionnait pas réellement, est corrigé",
      "Corrections — Une licence renseignée sur une seule fédération n'affiche plus à tort un compte comme « sans aucune licence » dans l'administration",
      "Corrections — La photo et les licences de Mon Profil se mettent à jour immédiatement après modification, sans recharger la page",
      "Notes pour les administrateurs — La photo de profil et le numéro de licence ne sont plus modifiables par les membres eux-mêmes ; un administrateur peut désormais les gérer depuis la fiche de n'importe quel utilisateur",
      "Notes pour les administrateurs — Le grade et la formation FMMAF se renseignent depuis la fiche utilisateur (visibles uniquement pour les licenciés FMMAF)",
      "Notes pour les administrateurs — La désactivation automatique des comptes inactifs tourne chaque nuit ; la durée (3 mois par défaut) et les clés des notifications push se configurent côté serveur",
    ],
  },
  {
    version: "1.7.1",
    date: "2026-07-21",
    title: "Nouvelle rubrique Tutoriel",
    changes: [
      "Ajout d'une rubrique « Tutoriel » (grades MMA), grâce au travail de Mikolaï, accessible depuis le menu à tous les utilisateurs connectés",
    ],
  },
  {
    version: "1.7",
    date: "2026-07-20",
    title: "Thème sombre, mises à jour majeures et nouveautés admin",
    changes: [
      "Ajout d'un thème clair/sombre, avec suivi automatique du réglage de l'appareil et bascule manuelle dans les réglages",
      "Mise à jour majeure de l'application (Nuxt 4, Tailwind 4, NestJS 11)",
      "Admin : ajout de la gestion des badges, sur le même principe que les clés",
      "Admin : purge de fin de saison des licences et des paiements (Super Admin uniquement)",
      "Sécurité : correction d'une faille — les comptes admin classiques ont perdu le droit de supprimer le compte d'un autre membre ; seuls le titulaire d'un compte et le Super Admin peuvent désormais le faire",
      "Sécurité : chiffrement des données automatisé et correction d'une faille sur la gestion des clés",
      "Performance : temps de chargement de l'administration nettement amélioré",
      "Corrections diverses d'affichage (dates, logos, contrastes en thème sombre)",
    ],
  },
  {
    version: "1.6",
    date: "2026-02-19",
    title: "Améliorations administration et calendrier",
    changes: [
      "Ajout du calendrier (Beta)",
      "Informations : liens désormais cliquables",
      "Admin : ajout d’un système de recherche des utilisateurs (nom / prénom)",
      "Admin : correction du bug d’affichage après modification d’un utilisateur",
    ],
  },
  {
    version: "1.5",
    date: "2025-10-21",
    title: "Ajout de features",
    changes: [
      "Users : refonte du design de l’espace « Profil »",
      "Users : gestion de multi-licences et multi-fédérations",
      "Users : ajout du règlement intérieur intégré dans l’app",
      "Admin : possibilité de préparer des cours à l’avance et de les rendre non visibles",
      "Admin : possibilité de créer des fédérations",
      "Admin : correction des erreurs de saisie (nom, prénom, date de naissance) pour chaque utilisateur"
    ],
  }
];

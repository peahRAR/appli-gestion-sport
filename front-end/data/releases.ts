// /data/releases.ts
export type Release = {
  version: string;      // ex: "1.4.2"
  date: string;         // ISO: "2025-10-20"
  title?: string;       // court sous-titre
  changes: string[];    // puces
};

export const releases: Release[] = [
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

// /data/releases.ts
export type Release = {
  version: string;      // ex: "1.4.2"
  date: string;         // ISO: "2025-10-20"
  title?: string;       // court sous-titre
  changes: string[];    // puces
};

export const releases: Release[] = [
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

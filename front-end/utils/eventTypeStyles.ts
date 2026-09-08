// Source unique du code couleur par type d'événement du calendrier club
// (ClubCalendarEvent.type — libellés FR exacts, cf. AdminCalendar.vue
// TYPE_OPTIONS). Utilisé par CardCalendar.vue (vue liste) et MonthCalendar.vue
// (vue mois) — ne pas redéfinir cette palette ailleurs.

export type EventTypeStyle = {
  border: string;
  badge: string;
  bg: string;
  // Couleur pleine utilisée pour les pastilles compactes de la vue mois
  // (les classes border-l-*/bg-* ci-dessus ne suffisent pas à elles seules
  // pour une petite pastille pleine).
  dot: string;
};

export const DEFAULT_EVENT_TYPE_STYLE: EventTypeStyle = {
  border: 'border-l-8 border-l-black',
  badge: 'bg-black text-white',
  bg: 'bg-surface',
  dot: 'bg-black',
};

export const EVENT_TYPE_STYLES: Record<string, EventTypeStyle> = {
  'Réunion': {
    border: 'border-l-8 border-l-green-600',
    badge: 'bg-black text-white',
    bg: 'bg-surface',
    dot: 'bg-green-600',
  },
  'Compétition': {
    border: 'border-l-8 border-l-red-600',
    badge: 'bg-black text-white',
    bg: 'bg-surface',
    dot: 'bg-red-600',
  },
  'Invitation club externe': {
    border: 'border-l-8 border-l-cyan-600',
    badge: 'bg-black text-white',
    bg: 'bg-surface',
    dot: 'bg-cyan-600',
  },
  'Vie associatif': {
    border: 'border-l-8 border-l-black',
    badge: 'bg-black text-white',
    bg: 'bg-surface',
    dot: 'bg-black',
  },
};

export function eventTypeStyle(type: string | null | undefined): EventTypeStyle {
  return (type && EVENT_TYPE_STYLES[type]) || DEFAULT_EVENT_TYPE_STYLE;
}

// Grade et formation FMMAF — miroir de back-end/src/users/constants/fmmaf.ts
// (labels + couleurs). N'ont de sens que pour un licencié FMMAF.

export const GRADE_VALUES = [
  'blanc',
  'jaune',
  'orange',
  'vert',
  'bleu',
  'violet',
  'marron',
  'noir',
] as const;
export type Grade = (typeof GRADE_VALUES)[number];

export const FORMATION_VALUES = [
  'aucune',
  'BF1',
  'BF2',
  'BF3',
  'commissaire',
  'juge',
  'arbitre',
] as const;
export type Formation = (typeof FORMATION_VALUES)[number];

export const GRADE_LABELS: Record<Grade, string> = {
  blanc: 'Blanc',
  jaune: 'Jaune',
  orange: 'Orange',
  vert: 'Vert',
  bleu: 'Bleu',
  violet: 'Violet',
  marron: 'Marron',
  noir: 'Noir',
};

export const FORMATION_LABELS: Record<Formation, string> = {
  aucune: 'Aucune',
  BF1: 'BF1',
  BF2: 'BF2',
  BF3: 'BF3',
  commissaire: 'Commissaire',
  juge: 'Juge',
  arbitre: 'Arbitre',
};

// Couleur de fond de la barre de grade. Le blanc reçoit en plus un contour
// (voir UserNameWithGrade.vue) pour rester visible sur fond clair.
export const GRADE_COLORS: Record<Grade, string> = {
  blanc: '#ffffff',
  jaune: '#f4d03f',
  orange: '#e8871e',
  vert: '#2ecc71',
  bleu: '#2e86de',
  violet: '#8e44ad',
  marron: '#7b4b2a',
  noir: '#111111',
};

export function gradeLabel(grade: string | null | undefined): string {
  return GRADE_LABELS[grade as Grade] || GRADE_LABELS.blanc;
}

export function formationLabel(formation: string | null | undefined): string {
  return FORMATION_LABELS[formation as Formation] || FORMATION_LABELS.aucune;
}

export function gradeColor(grade: string | null | undefined): string {
  return GRADE_COLORS[grade as Grade] || GRADE_COLORS.blanc;
}

// Grade et formation FMMAF — n'ont de sens que pour un utilisateur ayant une
// licence affiliée à la fédération FMMAF (voir hasFmmafLicense côté service).
// Mirroré à l'identique dans front-end/utils/fmmaf.ts (labels + couleurs).

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
export const DEFAULT_GRADE: Grade = 'blanc';

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
export const DEFAULT_FORMATION: Formation = 'aucune';

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

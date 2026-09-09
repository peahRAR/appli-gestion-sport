<template>
  <span class="inline-flex items-center gap-1.5 min-w-0 max-w-full">
    <span
      v-if="user?.hasFmmafLicense"
      class="inline-block w-1.5 h-4 rounded-sm shrink-0"
      :class="{ 'ring-1 ring-border-strong': isWhiteGrade }"
      :style="{ backgroundColor: barColor }"
      :title="`Grade : ${gradeLabelText}`"
    ></span>
    <span
      v-if="user?.hasFmmafLicense && user?.formation && user.formation !== 'aucune'"
      class="inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-semibold bg-surface-2 text-text border border-border shrink-0"
    >
      {{ formationLabelText }}
    </span>
    <span class="truncate">{{ displayName }}</span>
  </span>
</template>

<script>
import { gradeColor, gradeLabel, formationLabel } from '~/utils/fmmaf';

export default {
  name: 'UserNameWithGrade',
  props: {
    user: { type: Object, default: () => ({}) },
    // Espaces resserrés (listes mobiles) : nom de famille réduit à l'initiale
    // au lieu du nom complet, pour éviter de pousser la ligne hors écran.
    compact: { type: Boolean, default: false },
  },
  computed: {
    displayName() {
      const first = this.user?.firstname;
      const last = this.user?.name;
      if (this.compact && last) {
        return [first, `${last.charAt(0)}.`].filter(Boolean).join(' ');
      }
      return [first, last].filter(Boolean).join(' ');
    },
    isWhiteGrade() {
      return (this.user?.grade || 'blanc') === 'blanc';
    },
    barColor() {
      return gradeColor(this.user?.grade);
    },
    gradeLabelText() {
      return gradeLabel(this.user?.grade);
    },
    formationLabelText() {
      return formationLabel(this.user?.formation);
    },
  },
};
</script>

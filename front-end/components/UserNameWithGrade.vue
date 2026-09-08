<template>
  <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
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
    <span>{{ displayName }}</span>
  </span>
</template>

<script>
import { gradeColor, gradeLabel, formationLabel } from '~/utils/fmmaf';

export default {
  name: 'UserNameWithGrade',
  props: {
    user: { type: Object, default: () => ({}) },
  },
  computed: {
    displayName() {
      return [this.user?.firstname, this.user?.name].filter(Boolean).join(' ');
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

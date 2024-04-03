<template>
  <div>
    <ul class="mt-4">
      <li class="flex items-center">
        <Icon
          class="mr-2"
          :name="isLength ? 'openmoji:check-mark' : 'openmoji:cross-mark'"
        ></Icon>
        <p>Au moins 8 caractères.</p>
      </li>
      <li class="flex items-center">
        <Icon
          class="mr-2"
          :name="isMaj ? 'openmoji:check-mark' : 'openmoji:cross-mark'"
        ></Icon>
        <p>Au moins une majuscule.</p>
      </li>
      <li class="flex items-center">
        <Icon
          class="mr-2"
          :name="isMin ? 'openmoji:check-mark' : 'openmoji:cross-mark'"
        ></Icon>
        <p>Au moins une minuscule.</p>
      </li>
      <li class="flex items-center">
        <Icon
          class="mr-2"
          :name="isNumber ? 'openmoji:check-mark' : 'openmoji:cross-mark'"
        ></Icon>
        <p>Au moins un chiffre</p>
      </li>
      <li class="flex items-center">
        <Icon
          class="mr-2"
          :name="isSpecial ? 'openmoji:check-mark' : 'openmoji:cross-mark'"
        ></Icon>
        <p>Au moins un caractére spéciale (@$!%*?&)</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    isMaj: Boolean,
    isMin: Boolean,
    isNumber: Boolean,
    isSpecial: Boolean,
    isLength: Boolean,
  },
};
</script>

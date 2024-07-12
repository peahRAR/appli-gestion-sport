<template>
    <p class="text-gray-600 mb-2">
        <strong>{{ label }} :</strong>
        {{ displayValue }}
    </p>
</template>

<script>
export default {
    name: 'UserDetail',
    props: {
        label: String,
        value: [String, Number],
        default: {
            type: String,
            default: ''
        }
    },
    computed: {
        displayValue() {
            return this.value || this.default;
        }
    }
}
</script>


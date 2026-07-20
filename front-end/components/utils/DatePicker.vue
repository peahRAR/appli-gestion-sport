<template>
    <div class="datepicker-wrapper w-full relative" ref="datepickerWrapper">
        <input type="text" :value="displayDate" @focus="openCalendar" readonly
            class="datepicker-input w-full px-4 py-2 border rounded-lg outline-hidden cursor-pointer bg-surface text-text border-border"
            :placeholder="placeholder" :required="required" />
        <Icon class="datepicker-icon" @click="toggleCalendar" name="material-symbols:calendar-month" />
        <div v-if="isOpen" class="datepicker-popover" @mousedown.stop>
            <VCalendarDatePicker v-model="date" v-bind="{ ...attrs, ...$attrs }" @update:model-value="updateDate" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
import type { PropType } from 'vue'
import 'v-calendar/dist/style.css'
import { defineProps, defineEmits } from 'vue'
import { formatDate } from '~/composables/useDateFormat'

const props = defineProps({
    modelValue: {
        type: Date as PropType<Date | null>,
        default: null
    },
    required: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: 'jj/mm/aaaa'
    }
})

const emit = defineEmits(['update:model-value', 'close'])

const date = computed({
    get: () => props.modelValue,
    set: (value) => {
        emit('update:model-value', value)
    }
})

const isOpen = ref(false)
const datepickerWrapper = ref<HTMLElement | null>(null)

const formattedDate = (dateObj: Date) => formatDate(dateObj)

const displayDate = ref('')

const attrs = {
    transparent: true,
    borderless: true,
    color: 'primary',
    'is-dark': { selector: 'html', darkClass: 'dark' },
    'first-day-of-week': 2,
}

const toggleCalendar = () => {
    isOpen.value = !isOpen.value
}

const openCalendar = () => {
    isOpen.value = true
}

const closeCalendar = () => {
    isOpen.value = false
}

const updateDate = (newDate: Date) => {
    date.value = newDate
    displayDate.value = formattedDate(newDate)
    isOpen.value = false // close calendar after selecting a date
}

const handleClickOutside = (event: MouseEvent) => {
    if (datepickerWrapper.value && !datepickerWrapper.value.contains(event.target as Node)) {
        closeCalendar()
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style>

.datepicker-icon {
    position: absolute;
    top: 50%;
    right: 0.75rem;
    transform: translateY(-50%);
    cursor: pointer;
}

.datepicker-popover {
    position: absolute;
    z-index: 10;
    background: var(--color-surface);
    border: 1px solid var(--color-border-strong);
    border-radius: 4px;
    margin-top: 0.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Custom styles to ensure the selected month text remains readable in both themes */
.vc-nav-item.is-active {
    --vc-nav-item-active-color: var(--color-text);
}
</style>

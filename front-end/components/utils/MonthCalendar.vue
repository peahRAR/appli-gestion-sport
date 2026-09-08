<script setup>
import { ref, computed } from "vue"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday as dfIsToday,
  format,
} from "date-fns"
import { fr } from "date-fns/locale"
import { eventTypeStyle } from "~/utils/eventTypeStyles"

const props = defineProps({
  events: { type: Array, required: true },
  canManage: { type: Boolean, default: false },
})
const emit = defineEmits(["delete"])

const MAX_PILLS_PER_DAY = 3
const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

const currentMonth = ref(startOfMonth(new Date()))
const selectedDayKey = ref(null) // "yyyy-MM-dd" | null — overflow popover
const selectedEvent = ref(null) // event object | null — detail modal

function goToPreviousMonth() {
  currentMonth.value = startOfMonth(subMonths(currentMonth.value, 1))
}
function goToNextMonth() {
  currentMonth.value = startOfMonth(addMonths(currentMonth.value, 1))
}
function goToToday() {
  currentMonth.value = startOfMonth(new Date())
}

const gridDays = computed(() => {
  const start = startOfWeek(startOfMonth(currentMonth.value), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(currentMonth.value), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
})

// Regroupe les événements par jour de début (yyyy-MM-dd). Un événement
// multi-jours n'apparaît que le jour de son début, pour rester simple.
const eventsByDay = computed(() => {
  const map = new Map()
  for (const event of props.events) {
    if (!event?.startDate) continue
    const key = event.startDate.slice(0, 10)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(event)
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
  }
  return map
})

function eventsForDay(day) {
  return eventsByDay.value.get(format(day, "yyyy-MM-dd")) || []
}
function visiblePills(day) {
  return eventsForDay(day).slice(0, MAX_PILLS_PER_DAY)
}
function overflowCount(day) {
  return Math.max(0, eventsForDay(day).length - MAX_PILLS_PER_DAY)
}
function dayKey(day) {
  return format(day, "yyyy-MM-dd")
}

const selectedDayEvents = computed(() => {
  if (!selectedDayKey.value) return []
  return eventsByDay.value.get(selectedDayKey.value) || []
})

function openDayOverflow(day) {
  selectedDayKey.value = dayKey(day)
}
function closeDayOverflow() {
  selectedDayKey.value = null
}
function openEventDetail(event) {
  selectedEvent.value = event
}
function closeEventDetail() {
  selectedEvent.value = null
}
function onDeleteEvent(id) {
  emit("delete", id)
  selectedEvent.value = null
  closeDayOverflow()
}
</script>

<template>
  <div class="space-y-4">
    <!-- Navigation -->
    <div class="flex items-center justify-between gap-3">
      <button type="button" class="border rounded-sm px-3 py-2" @click="goToPreviousMonth" aria-label="Mois précédent">
        ‹
      </button>
      <div class="flex items-center gap-3">
        <div class="text-lg font-bold capitalize">
          {{ format(currentMonth, "MMMM yyyy", { locale: fr }) }}
        </div>
        <button type="button" class="border rounded-full px-3 py-1 text-sm" @click="goToToday">
          Aujourd'hui
        </button>
      </div>
      <button type="button" class="border rounded-sm px-3 py-2" @click="goToNextMonth" aria-label="Mois suivant">
        ›
      </button>
    </div>

    <!-- Grille -->
    <div class="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border border-border">
      <div
        v-for="label in WEEKDAY_LABELS"
        :key="label"
        class="bg-surface-2 text-center text-xs font-semibold uppercase tracking-wide py-2 text-text-muted"
      >
        {{ label }}
      </div>

      <div
        v-for="day in gridDays"
        :key="dayKey(day)"
        class="bg-surface min-h-[5.5rem] sm:min-h-[7rem] p-1 flex flex-col gap-1"
        :class="!isSameMonth(day, currentMonth) ? 'opacity-40' : ''"
      >
        <div
          class="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full shrink-0"
          :class="dfIsToday(day) ? 'bg-accent text-accent-fg' : 'text-text-muted'"
        >
          {{ format(day, "d") }}
        </div>

        <!-- Pastilles compactes (desktop) -->
        <div class="hidden sm:flex flex-col gap-1">
          <button
            v-for="event in visiblePills(day)"
            :key="event.id"
            type="button"
            class="text-left text-[11px] leading-tight rounded-sm px-1.5 py-0.5 truncate text-white"
            :class="eventTypeStyle(event.type).dot"
            :title="event.title"
            @click="openEventDetail(event)"
          >
            <span v-if="event.startTime" class="font-semibold">{{ event.startTime }}</span>
            {{ event.title }}
          </button>
          <button
            v-if="overflowCount(day) > 0"
            type="button"
            class="text-left text-[11px] text-text-muted hover:text-text px-1.5"
            @click="openDayOverflow(day)"
          >
            +{{ overflowCount(day) }}
          </button>
        </div>

        <!-- Points compacts (mobile) -->
        <div class="flex sm:hidden flex-wrap gap-1 px-0.5">
          <button
            v-for="event in eventsForDay(day)"
            :key="event.id"
            type="button"
            class="w-2 h-2 rounded-full shrink-0"
            :class="eventTypeStyle(event.type).dot"
            :aria-label="event.title"
            @click="openEventDetail(event)"
          ></button>
        </div>
      </div>
    </div>

    <!-- Popover jour (overflow "+N") -->
    <TheModal :isOpen="!!selectedDayKey" title="Événements du jour" @close="closeDayOverflow">
      <div class="space-y-2 min-w-[16rem]">
        <button
          v-for="event in selectedDayEvents"
          :key="event.id"
          type="button"
          class="w-full text-left border rounded-lg px-3 py-2 hover:bg-surface-2"
          @click="openEventDetail(event)"
        >
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full shrink-0" :class="eventTypeStyle(event.type).dot"></span>
            <span v-if="event.startTime" class="text-xs font-semibold">{{ event.startTime }}</span>
            <span class="truncate">{{ event.title }}</span>
          </div>
        </button>
      </div>
    </TheModal>

    <!-- Détail d'un événement (réutilise CardCalendar, même flux que la vue liste) -->
    <TheModal :isOpen="!!selectedEvent" title="Détail de l'événement" @close="closeEventDetail">
      <div class="min-w-[18rem] max-w-md">
        <CardCalendar v-if="selectedEvent" :event="selectedEvent" :can-manage="canManage" @delete="onDeleteEvent" />
      </div>
    </TheModal>
  </div>
</template>

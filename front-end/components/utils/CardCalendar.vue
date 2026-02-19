<script setup>
import { computed } from "vue"

const props = defineProps({
  event: { type: Object, required: true },
  canManage: { type: Boolean, default: false },
})

const emit = defineEmits(["delete", "edit"])

function onDelete() {
  emit("delete", props.event?.id)
}
function onEdit() {
  emit("edit", props.event)
}

// Styles par type
const TYPE_STYLES = {
  "Réunion": {
    border: "border-l-8 border-l-green-600",
    badge: "bg-black text-white",
    bg: "bg-gray-100",
  },
  "Compétition": {
    border: "border-l-8 border-l-red-600",
    badge: "bg-black text-white",
    bg: "bg-zinc-50",
  },
  "Invitation club externe": {
    border: "border-l-8 border-l-cyan-600",
    badge: "bg-black text-white",
    bg: "bg-zinc-50",
  },
  "Vie associatif": {
    border: "border-l-8 border-l-black",
    badge: "bg-black text-white",
    bg: "bg-zinc-50",
  },
}

const styleForType = computed(() => {
  return (
    TYPE_STYLES[props.event?.type] || {
      border: "border-l-8 border-l-black",
      badge: "bg-black text-white",
      bg: "bg-zinc-50",
    }
  )
})

// Date bloc (jour / mon yy)
const dateParts = computed(() => {
  const d = props.event?.startDate ? new Date(props.event.startDate) : null
  if (!d || Number.isNaN(d.getTime())) return { day: "--", monyy: "--- --" }

  const day = String(d.getDate()).padStart(2, "0")
  const mon = d.toLocaleString("fr-FR", { month: "short" }).replace(".", "")
  const yy = String(d.getFullYear()).slice(-2)

  return { day, monyy: `${mon.toUpperCase()} ${yy}` }
})

// Format end: "jj mon yy hh:mm"
const endLabel = computed(() => {
  if (!props.event?.endDate) return ""
  const d = new Date(props.event.endDate)
  if (Number.isNaN(d.getTime())) return ""

  const day = String(d.getDate()).padStart(2, "0")
  const mon = d.toLocaleString("fr-FR", { month: "short" }).replace(".", "")
  const yy = String(d.getFullYear()).slice(-2)
  const t = props.event.endTime ? String(props.event.endTime) : ""
  return `${day} ${mon} ${yy}${t ? " " + t : ""}`
})

// Itinéraire Google Maps
const directionsHref = computed(() => {
  const loc = (props.event?.location || "").trim()
  if (!loc) return ""
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc)}`
})

// ---------- Add to calendar (Google + Apple ICS) ----------
function pad2(n) {
  return String(n).padStart(2, "0")
}
function ymdToCompact(dateStr) {
  // "YYYY-MM-DD" -> "YYYYMMDD"
  if (!dateStr) return ""
  return dateStr.replaceAll("-", "")
}
function toUtcCompact(dt) {
  // Date -> "YYYYMMDDTHHMMSSZ"
  const y = dt.getUTCFullYear()
  const m = pad2(dt.getUTCMonth() + 1)
  const d = pad2(dt.getUTCDate())
  const hh = pad2(dt.getUTCHours())
  const mm = pad2(dt.getUTCMinutes())
  const ss = pad2(dt.getUTCSeconds())
  return `${y}${m}${d}T${hh}${mm}${ss}Z`
}
function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const da = pad2(d.getDate())
  return `${y}-${m}-${da}`
}

const isAllDay = computed(() => !props.event?.startTime) // si pas d'heure, on considère "journée"
const titleText = computed(() => (props.event?.title || "Événement").trim())
const descriptionText = computed(() => (props.event?.description || "").trim())
const locationText = computed(() => (props.event?.location || "").trim())

// Pour éviter les cas où endDate est présent sans endTime, etc.
const startDateStr = computed(() => props.event?.startDate || "")
const endDateStr = computed(() => props.event?.endDate || "")

const startLocalDateTime = computed(() => {
  if (!startDateStr.value) return null
  if (isAllDay.value) return null
  const t = (props.event?.startTime || "00:00").slice(0, 5)
  // Interprété en heure locale (navigateur). Pour Paris, admin = Paris → OK.
  return new Date(`${startDateStr.value}T${t}:00`)
})

const endLocalDateTime = computed(() => {
  if (!startDateStr.value || isAllDay.value) return null

  // Si pas de fin => par défaut +1h
  const hasEndDate = !!endDateStr.value
  const endDate = hasEndDate ? endDateStr.value : startDateStr.value
  const t = (props.event?.endTime || "").slice(0, 5)

  if (!t) {
    const s = startLocalDateTime.value
    if (!s) return null
    return new Date(s.getTime() + 60 * 60 * 1000)
  }

  return new Date(`${endDate}T${t}:00`)
})

const googleCalendarHref = computed(() => {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE"
  const text = encodeURIComponent(titleText.value)
  const details = encodeURIComponent(descriptionText.value)
  const location = encodeURIComponent(locationText.value)

  if (!startDateStr.value) return ""

  // All-day => dates=YYYYMMDD/YYYYMMDD (fin exclusive)
  if (isAllDay.value) {
    const start = ymdToCompact(startDateStr.value)
    const endExclusive = ymdToCompact(endDateStr.value || addDays(startDateStr.value, 1))
    // Si endDate fourni, on le rend exclusif (+1 jour) pour l’ICS/Google all-day
    const endFinal = endDateStr.value ? ymdToCompact(addDays(endDateStr.value, 1)) : endExclusive
    return `${base}&text=${text}&details=${details}&location=${location}&dates=${start}/${endFinal}`
  }

  const s = startLocalDateTime.value
  const e = endLocalDateTime.value
  if (!s || !e) return ""

  const dates = `${toUtcCompact(s)}/${toUtcCompact(e)}`
  // ctz aide Google à afficher correctement
  return `${base}&text=${text}&details=${details}&location=${location}&ctz=Europe/Paris&dates=${encodeURIComponent(
    dates
  )}`
})

function icsEscape(s) {
  return String(s || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;")
}

function buildIcs() {
  const uid = `${props.event?.id || crypto?.randomUUID?.() || Date.now()}@mma-app`
  const dtstamp = toUtcCompact(new Date())

  const summary = icsEscape(titleText.value)
  const desc = icsEscape(descriptionText.value)
  const loc = icsEscape(locationText.value)

  if (!startDateStr.value) return ""

  // All-day
  if (isAllDay.value) {
    const dtstart = ymdToCompact(startDateStr.value)
    const endForAllDay = endDateStr.value ? addDays(endDateStr.value, 1) : addDays(startDateStr.value, 1)
    const dtend = ymdToCompact(endForAllDay)

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MMA App//Club Calendar//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `SUMMARY:${summary}`,
      desc ? `DESCRIPTION:${desc}` : "",
      loc ? `LOCATION:${loc}` : "",
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n")
  }

  // Timed
  const s = startLocalDateTime.value
  const e = endLocalDateTime.value
  if (!s || !e) return ""

  // Ici on met UTC (Z) : compatible Apple/Google
  const dtstart = toUtcCompact(s)
  const dtend = toUtcCompact(e)

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MMA App//Club Calendar//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${summary}`,
    desc ? `DESCRIPTION:${desc}` : "",
    loc ? `LOCATION:${loc}` : "",
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n")
}

function downloadIcs() {
  const ics = buildIcs()
  if (!ics) return

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const fileBase = (titleText.value || "event")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40)

  const a = document.createElement("a")
  a.href = url
  a.download = `${fileBase || "event"}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="relative border rounded-2xl p-4 overflow-hidden flex flex-col gap-3" :class="[styleForType.border, styleForType.bg]">
    <!-- actions (top-right) -->
    <div v-if="canManage" class="absolute -top-[-0.25rem] right-3 flex gap-2">
      <!--
      <button
        class="border bg-white rounded-full px-3 py-2 shadow-sm hover:bg-green-50 transition"
        type="button"
        @click="onEdit"
        aria-label="Modifier"
        title="Modifier"
      >
        ✎
      </button>
      -->

      <button
        class="border bg-white rounded-full px-3 py-2 shadow-sm hover:bg-red-50 transition"
        type="button"
        @click="onDelete"
        aria-label="Supprimer"
        title="Supprimer"
      >
        ✕
      </button>
    </div>

    <!-- header -->
    <div class="space-y-2 min-w-0">
      <div class="text-lg font-bold leading-tight">
        {{ event.title }}
      </div>

      <div class="flex items-center justify-between gap-3">
        <span class="text-xs px-2 py-1 rounded-full shrink-0" :class="styleForType.badge">
          {{ event.type }}
        </span>

        <span class="text-xs opacity-80 flex items-center gap-1 min-w-0">
          <span aria-hidden="true">👤</span>
          <span class="truncate">{{ event.forWho }}</span>
        </span>
      </div>
    </div>

    <!-- centre : descriptif -->
    <div class="flex-1 flex items-center">
      <div v-if="event.description" class="text-sm opacity-80 leading-relaxed line-clamp-4">
        {{ event.description }}
      </div>
      <div v-else class="text-sm opacity-50">—</div>
    </div>

    <!-- footer -->
    <div class="flex items-end justify-between gap-3">
      <!-- date bloc bottom-left -->
      <div class="leading-none">
        <div class="text-5xl font-extrabold tracking-tight">
          {{ dateParts.day }}
        </div>

        <div class="mt-1 w-[4.5rem]">
          <div class="text-sm font-semibold uppercase tracking-wide leading-none">
            {{ dateParts.monyy }}
          </div>
        </div>
      </div>

      <!-- bas droite : adresse + horaires + actions -->
      <div class="text-right min-w-0 max-w-[65%]">
        <div class="text-xs opacity-90 break-words line-clamp-2">
          📍 {{ event.location }}
        </div>

        <div class="mt-2 flex items-center justify-between gap-2 flex-wrap">
          <div class="text-xs opacity-70">
            <span v-if="event.startTime" class="font-semibold">{{ event.startTime }}</span>
            <span v-if="endLabel" class="opacity-70">
              <span v-if="event.startTime"> → </span>
              <span v-else>→ </span>
              {{ endLabel }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <a
              v-if="directionsHref"
              class="border bg-white rounded-full px-3 py-2 text-xs shadow-sm hover:bg-black/5 transition shrink-0"
              :href="directionsHref"
              target="_blank"
              rel="noopener noreferrer"
              title="Ouvrir l’itinéraire"
            >
              Itinéraire
            </a>

            <!-- Ajouter au calendrier -->
            <a
              v-if="googleCalendarHref"
              class="border bg-white rounded-full px-3 py-2 text-xs shadow-sm hover:bg-black/5 transition shrink-0"
              :href="googleCalendarHref"
              target="_blank"
              rel="noopener noreferrer"
              title="Ajouter à Google Calendar"
            >
              Google
            </a>

            <button
              class="border bg-white rounded-full px-3 py-2 text-xs shadow-sm hover:bg-black/5 transition shrink-0"
              type="button"
              @click="downloadIcs"
              title="Télécharger .ics (Apple Calendar, etc.)"
            >
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

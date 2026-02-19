<script setup>
import { ref, computed, onMounted, watch } from "vue"

const config = useRuntimeConfig()
const API_URL = config.public.siteUrl

const token = ref("")
const events = ref([])
const loading = ref(false)
const errorMsg = ref("")

const TYPE_OPTIONS = ["Réunion", "Compétition", "Invitation club externe", "Vie associatif"]
const FOR_WHO_OPTIONS = ["Tout le monde", "Cadres et Bureau", "Adultes", "Ados"]

const DESCRIPTION_MAX = 85

const form = ref({
    title: "",
    type: TYPE_OPTIONS[0],
    forWho: FOR_WHO_OPTIONS[0],
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    description: "",
})

const descriptionCount = computed(() => (form.value.description || "").length)

// -----------------------------
// Filtres (type + pour qui)
// -----------------------------
const filters = ref({
    types: [...TYPE_OPTIONS],     // par défaut: tout affiché
    forWho: [...FOR_WHO_OPTIONS], // par défaut: tout affiché
})

function toggleFilter(kind, value) {
    const arr = filters.value[kind]
    const i = arr.indexOf(value)
    if (i >= 0) arr.splice(i, 1)
    else arr.push(value)
}

function resetFilters() {
    filters.value.types = [...TYPE_OPTIONS]
    filters.value.forWho = [...FOR_WHO_OPTIONS]
}

const safeEvents = computed(() => {
    if (!Array.isArray(events.value)) return []
    return events.value.filter((e) => e && typeof e === "object" && (e.title || e.startDate))
})

const filteredEvents = computed(() => {
    const list = safeEvents.value

    // si l’utilisateur décoche tout, on affiche rien (comportement attendu)
    const typeSet = new Set(filters.value.types)
    const whoSet = new Set(filters.value.forWho)

    return list.filter((e) => {
        const okType = !e.type || typeSet.has(e.type)
        const okWho = !e.forWho || whoSet.has(e.forWho)
        return okType && okWho
    })
})

// --- JWT decode (UI only) ---
function base64UrlDecode(str) {
    const pad = "=".repeat((4 - (str.length % 4)) % 4)
    const b64 = (str + pad).replace(/-/g, "+").replace(/_/g, "/")
    try {
        return decodeURIComponent(
            atob(b64)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
        )
    } catch {
        return null
    }
}
function getJwtPayload(jwt) {
    if (!jwt || typeof jwt !== "string") return null
    const parts = jwt.split(".")
    if (parts.length !== 3) return null
    const decoded = base64UrlDecode(parts[1])
    if (!decoded) return null
    try {
        return JSON.parse(decoded)
    } catch {
        return null
    }
}

const jwtPayload = computed(() => getJwtPayload(token.value))
const userRole = computed(() => jwtPayload.value?.role)
const canManage = computed(() => userRole.value === 1 || userRole.value === 2)

// -----------------------------
// Photon autocomplete (front only)
// -----------------------------
const PHOTON_ENDPOINT = "https://photon.komoot.io/api/"
const locationQuery = ref("")
const locationSuggestions = ref([])
const locationOpen = ref(false)
const locationLoading = ref(false)
const locationError = ref("")
const activeIndex = ref(-1)
let debounceTimer = null
let abortCtrl = null
let suppressWatchOnce = false

function normalizePhotonFeature(f) {
    const p = f?.properties || {}
    const parts = [
        p.name,
        p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street,
        p.postcode,
        p.city || p.town || p.village,
        p.state,
        p.country,
    ].filter(Boolean)

    const label = parts.join(", ")
    const coords = Array.isArray(f?.geometry?.coordinates) ? f.geometry.coordinates : null
    const lon = coords?.[0]
    const lat = coords?.[1]
    return { label, lat, lon, raw: f }
}

async function photonSearch(q) {
    if (!q || q.trim().length < 3) {
        locationSuggestions.value = []
        locationOpen.value = false
        locationError.value = ""
        activeIndex.value = -1
        return
    }

    if (debounceTimer) clearTimeout(debounceTimer)

    debounceTimer = setTimeout(async () => {
        if (abortCtrl) abortCtrl.abort()
        abortCtrl = new AbortController()

        locationLoading.value = true
        locationError.value = ""

        try {
            const url = new URL(PHOTON_ENDPOINT)
            url.searchParams.set("q", q.trim())
            url.searchParams.set("limit", "6")
            url.searchParams.set("lang", "fr")

            const res = await fetch(url.toString(), { signal: abortCtrl.signal })
            if (!res.ok) {
                locationSuggestions.value = []
                locationOpen.value = false
                locationError.value = `Erreur autocomplete: ${res.status}`
                return
            }

            const data = await res.json().catch(() => null)
            const feats = Array.isArray(data?.features) ? data.features : []
            const mapped = feats.map(normalizePhotonFeature).filter((x) => x.label)

            locationSuggestions.value = mapped
            locationOpen.value = mapped.length > 0
            activeIndex.value = mapped.length ? 0 : -1
        } catch (e) {
            if (e?.name === "AbortError") return
            locationSuggestions.value = []
            locationOpen.value = false
            locationError.value = "Erreur autocomplete"
        } finally {
            locationLoading.value = false
        }
    }, 350)
}

function selectLocation(s) {
    suppressWatchOnce = true
    locationQuery.value = s.label
    form.value.location = s.label
    locationOpen.value = false
    locationSuggestions.value = []
    activeIndex.value = -1
}

function onLocationFocus() {
    if (locationSuggestions.value.length) locationOpen.value = true
}
function onLocationBlur() {
    setTimeout(() => {
        locationOpen.value = false
    }, 120)
}
function onLocationKeydown(e) {
    if (!locationOpen.value && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        if (locationSuggestions.value.length) locationOpen.value = true
        return
    }
    if (!locationOpen.value) return

    if (e.key === "ArrowDown") {
        e.preventDefault()
        if (!locationSuggestions.value.length) return
        activeIndex.value = (activeIndex.value + 1) % locationSuggestions.value.length
    } else if (e.key === "ArrowUp") {
        e.preventDefault()
        if (!locationSuggestions.value.length) return
        activeIndex.value = (activeIndex.value - 1 + locationSuggestions.value.length) % locationSuggestions.value.length
    } else if (e.key === "Enter") {
        if (activeIndex.value >= 0 && locationSuggestions.value[activeIndex.value]) {
            e.preventDefault()
            selectLocation(locationSuggestions.value[activeIndex.value])
        }
    } else if (e.key === "Escape") {
        locationOpen.value = false
    }
}

watch(
    () => form.value.location,
    (v) => {
        if (locationQuery.value !== (v || "")) locationQuery.value = v || ""
    },
    { immediate: true }
)

watch(locationQuery, (q) => {
    form.value.location = q
    if (suppressWatchOnce) {
        suppressWatchOnce = false
        return
    }
    photonSearch(q)
})

// hard-limit description at 85 even if user pastes more
watch(
    () => form.value.description,
    (v) => {
        if (!v) return
        if (v.length > DESCRIPTION_MAX) form.value.description = v.slice(0, DESCRIPTION_MAX)
    }
)

// -----------------------------
// API calls
// -----------------------------
async function fetchEvents() {
    loading.value = true
    errorMsg.value = ""
    try {
        const res = await fetch(`${API_URL}/club-calendar`, {
            headers: { "Content-Type": "application/json" },
        })

        if (!res.ok) {
            errorMsg.value = `Erreur API: ${res.status}`
            events.value = []
            return
        }

        const data = await res.json().catch(() => null)
        if (!Array.isArray(data)) {
            errorMsg.value = "Réponse API inattendue"
            events.value = []
            return
        }

        events.value = data.filter((e) => e && typeof e === "object")
    } catch {
        errorMsg.value = "Erreur réseau"
        events.value = []
    } finally {
        loading.value = false
    }
}

async function createEvent() {
    const payload = {
        title: form.value.title?.trim(),
        type: form.value.type,
        forWho: form.value.forWho,
        startDate: form.value.startDate,
        startTime: form.value.startTime || undefined,
        endDate: form.value.endDate || undefined,
        endTime: form.value.endTime || undefined,
        location: form.value.location?.trim(),
        description: form.value.description?.trim() || undefined,
    }
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])

    const res = await fetch(`${API_URL}/club-calendar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        alert(JSON.stringify(data, null, 2))
        return
    }

    form.value = {
        title: "",
        type: TYPE_OPTIONS[0],
        forWho: FOR_WHO_OPTIONS[0],
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "",
        description: "",
    }

    locationQuery.value = ""
    locationSuggestions.value = []
    locationOpen.value = false
    activeIndex.value = -1
    locationError.value = ""

    await fetchEvents()
}

async function deleteEvent(id) {
    if (!id) return

    const res = await fetch(`${API_URL}/club-calendar/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token.value}` },
    })

    if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(JSON.stringify(data, null, 2))
        return
    }

    await fetchEvents()
}

onMounted(async () => {
    token.value = localStorage.getItem("accessToken") || ""
    await fetchEvents()
})
</script>

<template>
    <div class="min-h-screen p-4 md:p-6 space-y-6 overflow-x-hidden">
        <div class="flex items-end justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold">Calendrier</h2>
            </div>
        </div>

        <div v-if="errorMsg" class="border rounded p-3">
            {{ errorMsg }}
        </div>

        <!-- CREATE (admin only) -->
        <section v-if="canManage" class="border rounded-xl p-4 md:p-6 space-y-4 overflow-x-hidden">
            <h3 class="text-lg font-bold">Créer un événement</h3>

            <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-1 min-w-0">
                    <label class="text-sm opacity-70">
                        Titre <span class="text-red-500">*</span>
                    </label>
                    <input v-model="form.title" class="border rounded px-3 py-2 w-full min-w-0" />
                </div>

                <div class="space-y-1 min-w-0">
                    <label class="text-sm opacity-70">
                        Type <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.type" class="border rounded px-3 py-2 w-full min-w-0">
                        <option v-for="opt in TYPE_OPTIONS" :key="opt" :value="opt">
                            {{ opt }}
                        </option>
                    </select>
                </div>

                <div class="space-y-1 min-w-0">
                    <label class="text-sm opacity-70">
                        Pour qui <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.forWho" class="border rounded px-3 py-2 w-full min-w-0">
                        <option v-for="opt in FOR_WHO_OPTIONS" :key="opt" :value="opt">
                            {{ opt }}
                        </option>
                    </select>
                </div>

                <div class="space-y-1 relative min-w-0">
                    <label class="text-sm opacity-70">
                        Lieu <span class="text-red-500">*</span>
                    </label>

                    <input v-model="locationQuery" class="border rounded px-3 py-2 w-full min-w-0" autocomplete="off"
                        @focus="onLocationFocus" @blur="onLocationBlur" @keydown="onLocationKeydown" />

                    <div class="absolute right-3 top-[38px] text-xs opacity-60">
                        <span v-if="locationLoading">…</span>
                    </div>

                    <div v-if="locationError" class="text-xs opacity-70 mt-1">
                        {{ locationError }}
                    </div>

                    <div v-if="locationOpen && locationSuggestions.length"
                        class="absolute z-50 mt-2 w-full border rounded-lg bg-white overflow-hidden">
                        <button v-for="(s, i) in locationSuggestions" :key="s.label + i" type="button"
                            class="w-full text-left px-3 py-2 text-sm hover:bg-black/5"
                            :class="i === activeIndex ? 'bg-black/5' : ''" @mousedown.prevent="selectLocation(s)">
                            <div class="truncate">{{ s.label }}</div>
                            <div class="text-xs opacity-60" v-if="s.lat && s.lon">
                                {{ s.lat }}, {{ s.lon }}
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Début (date required, heure optionnelle) -->
                <div class="space-y-1 min-w-0">
                    <label class="text-sm opacity-70">
                        Début <span class="text-red-500">*</span>
                    </label>

                    <!-- ⚠️ md seulement, pas sm -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div class="space-y-1 min-w-0 overflow-hidden">
                            <label class="text-xs opacity-60">Date</label>
                            <input v-model="form.startDate" type="date"
                                class="border rounded px-3 py-2 w-full min-w-0 max-w-full" />
                        </div>

                        <div class="space-y-1 min-w-0">
                            <label class="text-xs opacity-60">Heure (optionnel)</label>
                            <input v-model="form.startTime" type="time"
                                class="border rounded px-3 py-2 w-full min-w-0 max-w-full" />
                        </div>
                    </div>
                </div>

                <!-- Fin (optionnelle) -->
                <div class="space-y-1 min-w-0">
                    <label class="text-sm opacity-70">Fin</label>

                    <!-- ⚠️ md seulement, pas sm -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div class="space-y-1 min-w-0">
                            <label class="text-xs opacity-60">Date (optionnel)</label>
                            <input v-model="form.endDate" type="date"
                                class="border rounded px-3 py-2 w-full min-w-0 max-w-full" />
                        </div>

                        <div class="space-y-1 min-w-0">
                            <label class="text-xs opacity-60">Heure (optionnel)</label>
                            <input v-model="form.endTime" type="time"
                                class="border rounded px-3 py-2 w-full min-w-0 max-w-full" />
                        </div>
                    </div>
                </div>

                <div class="space-y-1 md:col-span-2 min-w-0">
                    <div class="flex items-end justify-between gap-3">
                        <label class="text-sm opacity-70">Description</label>
                        <div class="text-xs opacity-60">
                            {{ descriptionCount }}/{{ DESCRIPTION_MAX }}
                        </div>
                    </div>

                    <textarea v-model="form.description"
                        class="border rounded px-3 py-2 w-full min-h-[90px] resize-none min-w-0"
                        :maxlength="DESCRIPTION_MAX" />
                </div>
            </div>

            <button @click="createEvent" class="bg-red-600 text-white px-4 py-2 rounded">
                Créer
            </button>
        </section>

        <!-- FILTERS -->
        <section class="border rounded-xl p-4 md:p-6 space-y-4">
            <div class="flex items-center justify-between gap-4">
                <h3 class="text-lg font-bold">Filtres</h3>
                <button class="border px-3 py-2 rounded" type="button" @click="resetFilters">
                    Réinitialiser
                </button>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2 min-w-0">
                    <div class="text-sm font-semibold">Type</div>
                    <div class="flex flex-wrap gap-2">
                        <button v-for="t in TYPE_OPTIONS" :key="t" type="button" @click="toggleFilter('types', t)"
                            class="border rounded-full px-3 py-2 text-sm"
                            :class="filters.types.includes(t) ? 'bg-gray-700 text-white' : 'bg-white'">
                            {{ t }}
                        </button>
                    </div>
                </div>

                <div class="space-y-2 min-w-0">
                    <div class="text-sm font-semibold">Pour qui</div>
                    <div class="flex flex-wrap gap-2">
                        <button v-for="w in FOR_WHO_OPTIONS" :key="w" type="button" @click="toggleFilter('forWho', w)"
                            class="border rounded-full px-3 py-2 text-sm"
                            :class="filters.forWho.includes(w) ? 'bg-gray-700 text-white' : 'bg-white'">
                            {{ w }}
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- LIST -->
        <section class="space-y-3">
            <div class="flex items-center justify-between gap-4">
                <h3 class="text-lg font-bold">Événements</h3>
                <div class="text-sm opacity-70">
                    {{ filteredEvents.length }} / {{ safeEvents.length }}
                </div>
            </div>

            <div v-if="loading" class="opacity-70">Chargement…</div>

            <div v-else class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                <CardCalendar v-for="event in filteredEvents" :key="event.id" :event="event" :can-manage="canManage"
                    @delete="deleteEvent" />
            </div>
        </section>
    </div>
</template>

<style scoped>
input[type="date"],
input[type="time"] {
    max-width: 100%;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    -webkit-appearance: none;
    appearance: none;
    display: block;
}
</style>

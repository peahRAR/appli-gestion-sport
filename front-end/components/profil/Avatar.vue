<template>
    <div class="avatar flex justify-center mb-2">
        <div class="relative w-20 h-20 mr-2 rounded-full">
            <NuxtImg v-if="src" :src="src" alt="Avatar" class="w-full h-full rounded-full" />
            <div v-else class="w-full h-full rounded-full bg-gray-300 flex items-center justify-center">
                <span class="text-gray-600 text-4xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="M11.5 14c4.14 0 7.5 1.57 7.5 3.5V20H4v-2.5c0-1.93 3.36-3.5 7.5-3.5m6.5 3.5c0-1.38-2.91-2.5-6.5-2.5S5 16.12 5 17.5V19h13zM11.5 5A3.5 3.5 0 0 1 15 8.5a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8 8.5A3.5 3.5 0 0 1 11.5 5m0 1A2.5 2.5 0 0 0 9 8.5a2.5 2.5 0 0 0 2.5 2.5A2.5 2.5 0 0 0 14 8.5A2.5 2.5 0 0 0 11.5 6" />
                    </svg>
                </span>
            </div>
            <Icon :name="gender ? 'ph:gender-male-bold' : 'ph:gender-female-bold'"
                :class="gender ? 'bg-blue-300' : 'bg-pink-300'"
                class="absolute bottom-0 right-0 w-6 h-6 p-1 rounded-full" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'Avatar',
    props: {
        src: String,
        gender: Boolean
    }
};
</script>
<template>
    <div @click="open" :class="backgroundColorClass"
        class="fixed bottom-8 right-4 w-16 h-16 text-white p-4 rounded-full shadow-lg cursor-pointer flex items-center justify-center">
        <p class="font-bold text-4xl">!</p>
    </div>
</template>

<script>
export default {
    props: {
        backgroundColor: {
            type: String,
            required: true
        }
    },
    computed: {
        
        backgroundColorClass() {
            return {
                'bg-red-500': this.backgroundColor === 'red',
                'bg-orange-500': this.backgroundColor === 'orange'
            }
        }
    },
    methods: {
        open() {
            this.$emit('click');
        }
    }
};
</script>

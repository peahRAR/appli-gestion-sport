<template>
    <div>
        <MyCalendar v-if="isAuthenticated" />
        <MyLogin v-else />
    </div>
</template>

<script>
export default {
    data() {
        return {
            isAuthenticated:null
            
        };
    },
   
}


</script>
<template>
    <div>
        <MyEventCards v-if="isAuthenticated" />
        <TheAuth v-else />
    </div>
</template>

<script>
export default {
    data() {
        return {
            isAuthenticated: null
        };
    },
    created() {
        // Call the method who verify if the user is connected
        this.checkAuthentication();
    },
    methods: {
        // Check if the user is authentified
        checkAuthentication() {
            // Keep the token from the local storage
            const accessToken = localStorage.getItem('accessToken');
            // Check if the token is Valid
            if (accessToken) {
                // update 
                this.isAuthenticated = true;
            } else {
                
                this.isAuthenticated = false;
            }
        },
        
    }
};


</script>
<template>
    <div class="bg-white rounded-lg shadow-md p-6 mb-2">
        <div class="grid grid-cols-2 gap-x-4 gap-y-2">
            <div class="col-span-2">
                <Avatar :src="user.avatar" :gender="user.gender" />
                <UserDetail label="Nom" :value="`${user.firstname} ${user.name}`" />
                <UserDetail label="Email" :value="user.email" default="Non Renseigné" />
                <UserDetail label="Poids" :value="`${user.weight} Kg`" default="Non Renseigné" />
                <UserDetail label="License" :value="user.license" default="Non Renseigné" />
                <UserDetail label="Numéro de téléphone" :value="user.tel_num" default="Non Renseigné" />
                <UserDetail label="Téléphone Médical" :value="user.tel_medic" default="Non Renseigné" />
                <UserDetail label="Téléphone d'urgence" :value="user.tel_emergency" default="Non Renseigné" />
                <UserDetail label="Date fin de paiment" :value="user.date_end_pay" default="Non Renseigné" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UserInfo',
    props: {
        user: Object
    }
};
</script>

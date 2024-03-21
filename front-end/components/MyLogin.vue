<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-4">Connexion</h2>
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input v-model="email" type="email" id="email" name="email" placeholder="Votre email"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400">
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Mot de passe</label>
          <input v-model="password" type="password" id="password" name="password" placeholder="Votre mot de passe"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-400">
        </div>
        <div class="flex justify-center">
          <button type="submit"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Se
            connecter</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: ''
    };
  },
  
};
</script>
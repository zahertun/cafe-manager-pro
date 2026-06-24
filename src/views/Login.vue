<template>
  <div class="min-h-screen bg-slate-900 flex justify-center items-center p-4">
    <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
      <div class="bg-coffee-700 text-white px-6 py-8 text-center">
        <i class="fa-solid fa-mug-hot text-amber-400 text-4xl mb-3"></i>
        <h1 class="text-2xl font-black tracking-wide">CaféManager Pro</h1>
        <p class="text-coffee-200 text-sm mt-1">Connexion à votre espace</p>
      </div>

      <div class="p-6">
        <div class="flex space-x-2 mb-6">
          <button @click="loginMode = 'barista'" :class="['flex-1 py-2 rounded-xl text-sm font-bold transition', loginMode === 'barista' ? 'bg-coffee-600 text-white' : 'bg-gray-100 text-gray-500']">Barista</button>
          <button @click="loginMode = 'admin'" :class="['flex-1 py-2 rounded-xl text-sm font-bold transition', loginMode === 'admin' ? 'bg-coffee-600 text-white' : 'bg-gray-100 text-gray-500']">Gérant (Admin)</button>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div v-if="loginMode === 'admin'">
            <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Email</label>
            <input v-model="email" type="email" required placeholder="admin@cafe.com" class="w-full border border-gray-300 rounded-xl p-3 text-sm font-bold focus:outline-coffee-600">
          </div>
          <div v-else>
            <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Identifiant Barista</label>
            <input v-model="username" type="text" required placeholder="Ex: sofiene_123" class="w-full border border-gray-300 rounded-xl p-3 text-sm font-bold focus:outline-coffee-600">
          </div>

          <div>
            <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Mot de passe</label>
            <input v-model="password" type="password" required placeholder="••••••••" class="w-full border border-gray-300 rounded-xl p-3 text-sm font-bold focus:outline-coffee-600">
          </div>

          <button type="submit" class="w-full bg-amber-400 hover:bg-amber-300 text-coffee-950 font-black py-3.5 rounded-xl text-sm transition shadow-md active:scale-95 mt-2">
            Se Connecter
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

const router = useRouter();
const loginMode = ref('barista');

const email = ref('');
const username = ref('');
const password = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
    isLoading.value = true;
    try {
        let authEmail = '';
        
        if (loginMode.value === 'admin') {
            authEmail = email.value;
        } else {
            // For barista, we format the username into a dummy email
            // e.g. "sofiene" -> "sofiene@barista.local"
            authEmail = username.value.toLowerCase().trim() + '@barista.local';
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: password.value,
        });

        if (error) throw error;

        // Connexion réussie
        router.push('/dashboard');
        
    } catch (err) {
        alert("Erreur de connexion : " + err.message);
    } finally {
        isLoading.value = false;
    }
};
</script>

import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');
const viewsDir = path.join(srcDir, 'views');
const routerDir = path.join(srcDir, 'router');

if (!fs.existsSync(viewsDir)) fs.mkdirSync(viewsDir, { recursive: true });
if (!fs.existsSync(routerDir)) fs.mkdirSync(routerDir, { recursive: true });

const indexHtmlPath = path.join(process.cwd(), 'index.html');
const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

// Extract template (everything inside <div id="app">)
const templateStart = indexContent.indexOf('<div id="app"');
const scriptStart = indexContent.indexOf('<script>\nconst { createApp, ref, computed } = Vue;');
const templateContent = indexContent.slice(templateStart, scriptStart).trim();

// Extract script setup body
// The script is inside createApp({ setup() { ... } }).mount('#app');
const setupStartStr = 'setup() {';
const setupStart = indexContent.indexOf(setupStartStr);
const setupEnd = indexContent.lastIndexOf('return {');

let scriptContent = '';
if (setupStart > -1 && setupEnd > -1) {
    scriptContent = indexContent.slice(setupStart + setupStartStr.length, setupEnd).trim();
}

const dashboardVue = `<template>
${templateContent}
</template>

<script setup>
import { ref, computed } from 'vue';

${scriptContent}

// Helpers
const getPaymentBadge = (method) => {
    switch(method) {
        case 'cash': return 'bg-emerald-100 text-emerald-800';
        case 'card': return 'bg-blue-100 text-blue-800';
        case 'customer_credit': return 'bg-amber-100 text-amber-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};
const getPaymentLabel = (method) => {
    switch(method) {
        case 'cash': return 'Espèces';
        case 'card': return 'Carte/QR';
        case 'customer_credit': return 'Ardoise';
        default: return method;
    }
};
</script>

<style scoped>
/* Scoped styles can go here if needed */
</style>
`;

fs.writeFileSync(path.join(viewsDir, 'Dashboard.vue'), dashboardVue);

// Create Login.vue
const loginVue = `<template>
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

const router = useRouter();
const loginMode = ref('barista');
const email = ref('');
const username = ref('');
const password = ref('');

const handleLogin = () => {
    // TODO: Implémenter Supabase Auth
    // Pour l'instant on bypass et on va direct au dashboard
    router.push('/dashboard');
};
</script>
`;
fs.writeFileSync(path.join(viewsDir, 'Login.vue'), loginVue);

// Create router/index.js
const routerJs = `import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
`;
fs.writeFileSync(path.join(routerDir, 'index.js'), routerJs);

// Overwrite App.vue
const appVue = `<template>
  <router-view></router-view>
</template>

<script setup>
</script>

<style>
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #0f172a;
    -webkit-tap-highlight-color: transparent;
}
::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}
::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}
</style>
`;
fs.writeFileSync(path.join(srcDir, 'App.vue'), appVue);

// Overwrite main.js
const mainJs = `import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
`;
fs.writeFileSync(path.join(srcDir, 'main.js'), mainJs);

// Overwrite index.html to be a standard Vite entry point
const newIndexHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>CaféManager - App Mobile Supabase Pro</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        coffee: {
                            50: '#fdf8f5',
                            100: '#fbeee6',
                            500: '#8b5a2b',
                            600: '#6f4822',
                            700: '#54361a',
                            800: '#3a2512',
                            900: '#23160a',
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-slate-900">
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>
`;
fs.writeFileSync(indexHtmlPath, newIndexHtml);

console.log("Refactoring complete!");

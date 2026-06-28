<template>
<div id="app" class="w-full sm:w-[420px] h-screen sm:h-[840px] bg-gray-50 flex flex-col shadow-2xl sm:rounded-3xl overflow-hidden relative border-4 border-slate-800">
    
    <!-- Top Header -->
    <header class="bg-coffee-700 text-white px-4 py-3 flex justify-between items-center shadow-md">
        <div class="flex items-center space-x-2">
            <i class="fa-solid fa-mug-hot text-amber-400 text-xl"></i>
            <span class="font-bold text-lg tracking-wide">{{ cafeSettings.name }}</span>
        </div>
        <div class="flex items-center space-x-2 text-xs bg-coffee-800 px-2.5 py-1 rounded-full border border-coffee-600">
            <i :class="currentUser.role === 'admin' ? 'fa-solid fa-user-shield text-amber-400' : 'fa-solid fa-user text-amber-200'"></i>
            <span class="font-semibold">{{ currentUser.name }}</span>
            <span class="text-[9px] uppercase bg-amber-400 text-coffee-900 px-1.5 py-0.2 rounded font-black">{{ currentUser.role }}</span>
            <button @click="handleLogout" class="text-red-400 ml-2 hover:scale-110 transition bg-coffee-900/50 px-2 py-1 rounded-lg flex items-center" title="Déconnexion">
                <i class="fa-solid fa-right-from-bracket mr-1"></i>
                <span class="text-[10px] font-bold">Quitter</span>
            </button>
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto pb-24">
        
        <!-- ============================================== -->
        <!-- TAB 1 : COMMANDE (POS)                        -->
        <!-- ============================================== -->
        <section v-if="activeTab === 'pos'" class="p-3">
            <!-- MODE POS CLASSIQUE -->
            <div v-if="cafeSettings.orderEntryMode === 'pos'">
                <!-- Category Selector -->
                <div class="flex space-x-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
                    <button 
                        v-for="cat in categories" :key="cat.id"
                        @click="selectedCategory = cat.id"
                        :class="['px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition shadow-sm flex items-center space-x-1.5 active:scale-95', 
                                selectedCategory === cat.id ? 'bg-coffee-600 text-white shadow-coffee-600/30' : 'bg-white text-gray-700 border border-gray-200']">
                        <i :class="cat.icon"></i>
                        <span>{{ cat.name }}</span>
                    </button>
                </div>

                <!-- Products Grid -->
                <div class="grid grid-cols-2 gap-2.5 mb-4">
                    <div 
                        v-for="prod in filteredProducts" :key="prod.id"
                        @click="addToCart(prod)"
                        class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-95 transition select-none relative overflow-hidden">
                        <div v-if="!prod.is_available" class="absolute inset-0 bg-white/85 backdrop-blur-[1px] flex items-center justify-center font-black text-red-600 text-xs tracking-wider z-10">
                            ÉPUISÉ
                        </div>
                        <div>
                            <div class="w-full h-24 bg-coffee-50 rounded-xl flex items-center justify-center text-coffee-600 text-3xl mb-2">
                                <i :class="prod.icon"></i>
                            </div>
                            <h4 class="font-bold text-gray-800 text-sm line-clamp-1">{{ prod.name }}</h4>
                            <p class="text-xs text-gray-400 mt-0.5">{{ prod.recipe_summary || 'Sans recette liée' }}</p>
                        </div>
                        <div class="mt-2 flex justify-between items-center pt-2 border-t border-gray-50">
                            <span class="font-black text-coffee-700 text-sm">{{ prod.price.toFixed(3) }} <span class="text-[10px] font-bold">{{ cafeSettings.currency }}</span></span>
                            <span class="w-7 h-7 bg-coffee-100 text-coffee-800 rounded-lg flex items-center justify-center text-xs font-black shadow-sm">
                                <i class="fa-solid fa-plus"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODE GLOBAL (CLÔTURE DE SERVICE) -->
            <div v-else class="space-y-4">
                <div class="bg-purple-50 border-l-4 border-purple-500 p-3.5 rounded-r-2xl text-purple-900 text-xs leading-relaxed shadow-sm">
                    <i class="fa-solid fa-layer-group text-purple-600 mr-1.5"></i>
                    <strong>Saisie Globale :</strong> Saisissez le total des quantités vendues durant ce service pour clôturer la caisse.
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4 p-3">
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Date du service</label>
                    <input v-model="bulkDate" type="date" class="w-full border border-gray-300 rounded-xl p-2 text-sm font-extrabold focus:outline-coffee-600">
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantités Vendues</h3>
                        <span class="text-xs font-black text-coffee-600">Total : {{ bulkTotalAmount.toFixed(3) }} {{ cafeSettings.currency }}</span>
                    </div>
                    <div class="divide-y divide-gray-100">
                        <div v-for="prod in products" :key="prod.id" class="p-3 flex justify-between items-center">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center text-lg">
                                    <i :class="prod.icon"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-sm text-gray-800">{{ prod.name }}</h4>
                                    <p class="text-[10px] text-gray-500 mt-0.5">{{ prod.price.toFixed(3) }} {{ cafeSettings.currency }} / unité</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-3">
                                <button @click="updateBulkQuantity(prod.id, -1)" class="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 font-black flex items-center justify-center transition active:scale-90">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <input v-model.number="bulkQuantities[prod.id]" type="number" min="0" class="w-14 text-center font-black text-sm border-b-2 border-gray-300 focus:border-coffee-600 focus:outline-none pb-1 bg-transparent">
                                <button @click="updateBulkQuantity(prod.id, 1)" class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 font-black flex items-center justify-center transition active:scale-90">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="p-4 bg-gray-50 border-t border-gray-200 flex items-center space-x-3">
                        <button 
                            @click="submitBulkShift"
                            :disabled="bulkTotalAmount <= 0"
                            :class="['w-full py-3.5 rounded-xl font-extrabold text-sm flex justify-center items-center space-x-2 transition active:scale-95 shadow-md', bulkTotalAmount > 0 ? 'bg-coffee-600 hover:bg-coffee-500 text-white shadow-coffee-600/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed']">
                            <i class="fa-solid fa-lock"></i>
                            <span>Valider la Clôture du Service</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- ============================================== -->
        <!-- TAB 2 : FINANCES & ANALYTICS                   -->
        <!-- ============================================== -->
        <section v-if="activeTab === 'sales'" class="p-4 space-y-4">
            
            <!-- Finances Sub-Navigation -->
            <div class="flex space-x-2 bg-gray-200 p-1 rounded-xl shadow-inner mb-4">
                <button @click="financeSubTab = 'sales'" :class="['flex-1 py-1.5 text-xs font-bold rounded-lg transition', financeSubTab === 'sales' ? 'bg-white text-coffee-700 shadow-sm' : 'text-gray-500 hover:text-gray-700']">Recettes</button>
                <button @click="financeSubTab = 'expenses'" :class="['flex-1 py-1.5 text-xs font-bold rounded-lg transition', financeSubTab === 'expenses' ? 'bg-white text-coffee-700 shadow-sm' : 'text-gray-500 hover:text-gray-700']">Sorties</button>
                <button @click="financeSubTab = 'stats'" :class="['flex-1 py-1.5 text-xs font-bold rounded-lg transition', financeSubTab === 'stats' ? 'bg-white text-coffee-700 shadow-sm' : 'text-gray-500 hover:text-gray-700']">Bénéfices</button>
            </div>

            <!-- Date Filter for Finances -->
            <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 grid grid-cols-2 gap-2 mb-4">
                <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Du</label>
                    <input v-model="financeStartDate" type="date" class="w-full border border-gray-300 rounded-lg p-1.5 text-xs font-bold focus:outline-coffee-600">
                </div>
                <div>
                    <label class="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Au</label>
                    <input v-model="financeEndDate" type="date" class="w-full border border-gray-300 rounded-lg p-1.5 text-xs font-bold focus:outline-coffee-600">
                </div>
            </div>

            <!-- RECETTES SUB-TAB -->
            <div v-if="financeSubTab === 'sales'" class="space-y-4">
                <!-- Summary Cards -->
                <div class="grid grid-cols-2 gap-3">
                <div class="bg-gradient-to-br from-coffee-600 to-coffee-800 text-white p-3.5 rounded-2xl shadow-md">
                    <span class="text-xs text-coffee-100 block font-medium">Chiffre d'Affaires (Période)</span>
                    <span class="text-xl font-black mt-1 block">{{ todayRevenue.toFixed(3) }} {{ cafeSettings.currency }}</span>
                    <span class="text-[10px] text-emerald-300 font-bold mt-1 block"><i class="fa-solid fa-arrow-trend-up mr-1"></i> TVA incluse ({{ cafeSettings.taxRate }}%)</span>
                </div>
                <div class="bg-white p-3.5 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between">
                    <span class="text-xs text-gray-500 block font-medium">Commandes Validées</span>
                    <span class="text-xl font-black text-gray-800 mt-1 block">{{ orders.length }}</span>
                    <span class="text-[10px] text-coffee-600 font-bold mt-1 block"><i class="fa-solid fa-utensils mr-1"></i> Actif: {{ currentUser.name }}</span>
                </div>
            </div>

            <!-- Payment Split Breakdown -->
            <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-200">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Répartition des Encaissements</h3>
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                        <span class="text-[10px] text-emerald-700 font-black block tracking-tight">ESPÈCES</span>
                        <span class="text-xs font-black text-slate-800 mt-0.5 block">{{ cashRevenue.toFixed(3) }}</span>
                    </div>
                    <div class="p-2 bg-blue-50 rounded-xl border border-blue-100">
                        <span class="text-[10px] text-blue-700 font-black block tracking-tight">CARTE / MOBILE</span>
                        <span class="text-xs font-black text-slate-800 mt-0.5 block">{{ cardRevenue.toFixed(3) }}</span>
                    </div>
                    <div class="p-2 bg-amber-50 rounded-xl border border-amber-100">
                        <span class="text-[10px] text-amber-700 font-black block tracking-tight">CRÉDIT CLIENT</span>
                        <span class="text-xs font-black text-slate-800 mt-0.5 block">{{ creditRevenue.toFixed(3) }}</span>
                    </div>
                </div>
            </div>

            <!-- Orders History List -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Historique Récent</h3>
                    <span class="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold">{{ orders.length }}</span>
                </div>
                <div class="divide-y divide-gray-100">
                    <div v-if="orders.length === 0" class="p-6 text-center text-gray-400 text-xs italic">
                        Aucune commande passée aujourd'hui.
                    </div>
                    <div v-for="ord in sortedOrders" :key="ord.id" class="p-3.5 hover:bg-gray-50 transition">
                        <div class="flex justify-between items-start mb-1">
                            <div class="flex items-center space-x-2">
                                <span class="font-black text-sm text-gray-800">#{{ ord.order_number }}</span>
                                <span v-if="ord.table_number" class="text-xs bg-coffee-100 text-coffee-800 px-2 py-0.5 rounded-md font-bold">
                                    {{ ord.table_number }}
                                </span>
                                <span v-else class="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-bold">
                                    À emporter
                                </span>
                            </div>
                            <span class="font-black text-sm text-coffee-700">{{ ord.total_amount.toFixed(3) }} {{ cafeSettings.currency }}</span>
                        </div>
                        <div class="flex justify-between items-center text-xs text-gray-500 mt-1.5">
                            <span>{{ new Date(ord.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }} • Par {{ ord.barista_name }}</span>
                            <span :class="['px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide', getPaymentBadge(ord.payment_method)]">
                                {{ getPaymentLabel(ord.payment_method) }}
                            </span>
                        </div>
                        <div v-if="ord.customer_name" class="mt-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg font-bold flex items-center justify-between border border-amber-200/50">
                            <span><i class="fa-solid fa-user-tag mr-1 text-amber-600"></i> Client: {{ ord.customer_name }}</span>
                            <span class="text-[10px] bg-amber-200/60 px-1.5 py-0.5 rounded uppercase font-black text-amber-900">Ardoise</span>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            <!-- SORTIES SUB-TAB -->
            <div v-if="financeSubTab === 'expenses'" class="space-y-4">
                <div class="flex justify-between items-center">
                    <h2 class="font-extrabold text-gray-800 text-lg">Dépenses & Sorties</h2>
                    <button 
                        @click="showAddExpenseModal = true"
                        class="bg-red-600 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 hover:bg-red-700 transition active:scale-95 shadow-sm">
                        <i class="fa-solid fa-minus"></i>
                        <span>Nouvelle Sortie</span>
                    </button>
                </div>
                
                <!-- Total Expenses Card -->
                <div class="bg-gradient-to-br from-red-600 to-red-800 text-white p-3.5 rounded-2xl shadow-md flex justify-between items-center">
                    <div>
                        <span class="text-xs text-red-100 block font-medium">Total des Sorties (Période)</span>
                        <span class="text-xl font-black mt-1 block">{{ totalExpenses.toFixed(3) }} {{ cafeSettings.currency }}</span>
                    </div>
                    <i class="fa-solid fa-money-bill-transfer text-3xl text-red-300/50"></i>
                </div>

                <!-- Expenses List -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Historique des sorties</h3>
                    </div>
                    <div class="divide-y divide-gray-100">
                        <div v-if="expenses.length === 0" class="p-6 text-center text-gray-400 text-xs italic">
                            Aucune dépense enregistrée.
                        </div>
                        <div v-for="exp in filteredExpenses" :key="exp.id" class="p-3.5 hover:bg-gray-50 transition flex justify-between items-center">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-lg">
                                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                                </div>
                                <div>
                                    <h4 class="font-bold text-sm text-gray-800">{{ exp.category }}</h4>
                                    <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">{{ exp.description }}</p>
                                    <p class="text-[10px] text-gray-400 mt-0.5">{{ new Date(exp.date).toLocaleDateString() }} • Par {{ exp.barista_name }}</p>
                                </div>
                            </div>
                            <span class="font-black text-sm text-red-600">-{{ exp.amount.toFixed(3) }} {{ cafeSettings.currency }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- STATS SUB-TAB -->
            <div v-if="financeSubTab === 'stats'" class="space-y-4">
                <h2 class="font-extrabold text-gray-800 text-lg mb-2">Bénéfices & Clôtures</h2>
                
                <!-- Profit Margin Breakdown -->
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-bold text-gray-600">Total Recettes</span>
                        <span class="text-sm font-black text-emerald-600">{{ todayRevenue.toFixed(3) }} {{ cafeSettings.currency }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-bold text-gray-600">Total Sorties</span>
                        <span class="text-sm font-black text-red-600">-{{ totalExpenses.toFixed(3) }} {{ cafeSettings.currency }}</span>
                    </div>
                    <div class="pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span class="text-base font-black text-gray-800">Marge Nette (Bénéfice)</span>
                        <span :class="['text-xl font-black', (todayRevenue - totalExpenses) >= 0 ? 'text-emerald-600' : 'text-red-600']">
                            {{ (todayRevenue - totalExpenses).toFixed(3) }} {{ cafeSettings.currency }}
                        </span>
                    </div>
                </div>

                <!-- Shift Closures List -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-4">
                    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Clôtures de Caisse (Mode Global)</h3>
                    </div>
                    <div class="divide-y divide-gray-100">
                        <div v-if="shiftClosures.length === 0" class="p-6 text-center text-gray-400 text-xs italic">
                            Aucune clôture enregistrée.
                        </div>
                        <div v-for="shift in filteredShiftClosures" :key="shift.id" class="p-3.5 hover:bg-gray-50 transition cursor-pointer" @click="openShiftDetails(shift)">
                            <div class="flex justify-between items-start mb-1">
                                <div class="flex items-center space-x-2">
                                    <span class="w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold">
                                        <i class="fa-solid fa-lock"></i>
                                    </span>
                                    <div>
                                        <span class="font-black text-sm text-gray-800">Clôture #{{ shift.id.split('_')[1] }}</span>
                                        <span class="block text-[10px] text-gray-500">{{ new Date(shift.date).toLocaleString() }} • Par {{ shift.barista_name }}</span>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="font-black text-sm text-coffee-700 block">{{ shift.total_revenue.toFixed(3) }} {{ cafeSettings.currency }}</span>
                                    <span class="text-[9px] text-blue-600 font-bold uppercase underline mt-0.5">Détails <i class="fa-solid fa-chevron-right text-[8px]"></i></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ============================================== -->
        <!-- TAB 3 : STOCK & INGRÉDIENTS                    -->
        <!-- ============================================== -->
        <section v-if="activeTab === 'stock'" class="p-4 space-y-4">
            <div class="flex justify-between items-center">
                <h2 class="font-extrabold text-gray-800 text-lg">Stock & Fournitures</h2>
                <div class="flex space-x-2">
                    <button 
                        @click="showAddStockModal = true"
                        class="bg-coffee-700 text-white text-xs font-extrabold px-3 py-2 rounded-xl flex items-center space-x-1.5 hover:bg-coffee-800 transition active:scale-95 shadow-sm">
                        <i class="fa-solid fa-box-open"></i>
                        <span>Approvisionner</span>
                    </button>
                    <button 
                        v-if="currentUser.role === 'admin'"
                        @click="openCreateInventoryModal()"
                        class="bg-emerald-600 text-white text-xs font-extrabold px-3 py-2 rounded-xl flex items-center space-x-1.5 hover:bg-emerald-700 transition active:scale-95 shadow-sm">
                        <i class="fa-solid fa-plus"></i>
                        <span>Nouveau</span>
                    </button>
                </div>
            </div>

            <!-- Alert Banner -->
            <div v-if="stockAlerts.length > 0" class="bg-red-50 border-l-4 border-red-500 p-3.5 rounded-r-2xl flex items-start space-x-3 text-red-900 shadow-sm">
                <i class="fa-solid fa-triangle-exclamation text-red-500 text-lg mt-0.5"></i>
                <div>
                    <h4 class="font-black text-xs uppercase tracking-wide text-red-800">Alerte Rupture de Stock</h4>
                    <p class="text-xs mt-0.5 leading-relaxed">
                        <span class="font-black">{{ stockAlerts.length }}</span> article(s) en dessous du seuil critique d'alerte ! Pensez à recommander.
                    </p>
                </div>
            </div>

            <!-- Inventory List -->
            <div class="space-y-2.5">
                <div 
                    v-for="item in inventory" :key="item.id"
                    class="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                        <div :class="['w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner', item.current_stock <= item.min_stock_alert ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-coffee-50 text-coffee-700 border border-coffee-100']">
                            <i :class="item.icon"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-sm text-gray-800">{{ item.name }}</h4>
                            <span class="text-xs text-gray-400">Seuil min: {{ item.min_stock_alert }} {{ item.unit }}</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-end space-y-2">
                        <div :class="['font-black text-base text-right', item.current_stock <= item.min_stock_alert ? 'text-red-600 font-black' : 'text-gray-800']">
                            {{ item.current_stock }} <span class="text-xs font-semibold text-gray-500">{{ item.unit }}</span>
                        </div>
                        <div class="flex items-center justify-end space-x-2">
                            <div v-if="item.current_stock <= item.min_stock_alert" class="text-[10px] font-black text-red-600 uppercase tracking-tight bg-red-50 px-1.5 py-0.5 rounded inline-block">
                                <i class="fa-solid fa-cart-shopping"></i>
                            </div>
                            <button 
                                v-if="currentUser.role === 'admin'"
                                @click="openEditInventoryModal(item)"
                                class="text-gray-400 hover:text-blue-600 p-1 transition text-sm"
                                title="Modifier l'article">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button 
                                v-if="currentUser.role === 'admin'"
                                @click="deleteInventoryItem(item)"
                                class="text-gray-400 hover:text-red-600 p-1 transition text-sm"
                                title="Supprimer l'article">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ============================================== -->
        <!-- TAB 4 : CLIENTS & CRÉDITS (ARDOISES)           -->
        <!-- ============================================== -->
        <section v-if="activeTab === 'customers'" class="p-4 space-y-4">
            <div class="flex justify-between items-center">
                <h2 class="font-extrabold text-gray-800 text-lg">Clients & Ardoises</h2>
                <button 
                    @click="showAddCustomerModal = true"
                    class="bg-coffee-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 hover:bg-coffee-800 transition active:scale-95 shadow-sm">
                    <i class="fa-solid fa-user-plus"></i>
                    <span>Nouveau Client</span>
                </button>
            </div>

            <!-- Total Outstanding Credit Card -->
            <div class="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
                <div>
                    <span class="text-xs text-amber-100 block uppercase font-extrabold tracking-wide">Total Ardoises Clients (Impayés)</span>
                    <span class="text-2xl font-black mt-1 block">{{ totalOutstandingCredit.toFixed(3) }} {{ cafeSettings.currency }}</span>
                </div>
                <i class="fa-solid fa-book-bookmark text-4xl text-amber-200/50"></i>
            </div>

            <!-- Customers List -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                <div v-if="customers.length === 0" class="p-6 text-center text-gray-400 text-xs">
                    Aucun client enregistré pour l'instant.
                </div>
                <div v-for="cust in customers" :key="cust.id" class="p-3.5 flex justify-between items-center">
                    <div class="flex-1 pr-2">
                        <h4 class="font-extrabold text-sm text-gray-800 flex items-center">
                            <span>{{ cust.full_name }}</span>
                            <span v-if="cust.credit_balance >= cust.credit_limit" class="ml-2 bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-tight">
                                Plafond dépassé
                            </span>
                        </h4>
                        <p class="text-xs text-gray-500 mt-0.5 font-medium"><i class="fa-solid fa-phone text-[10px] mr-1 text-coffee-600"></i> {{ cust.phone || 'Non renseigné' }}</p>
                        <div class="w-full bg-gray-100 h-2 rounded-full mt-2.5 overflow-hidden max-w-[180px] border border-gray-200/60">
                            <div 
                                :class="['h-full transition-all duration-500', cust.credit_balance > (cust.credit_limit*0.8) ? 'bg-red-500' : 'bg-amber-500']"
                                :style="{ width: Math.min(100, (cust.credit_balance / cust.credit_limit) * 100) + '%' }">
                            </div>
                        </div>
                        <span class="text-[10px] text-gray-400 block mt-1 font-medium">Plafond autorisée: <strong>{{ cust.credit_limit.toFixed(3) }}</strong> {{ cafeSettings.currency }}</span>
                    </div>
                    <div class="text-right">
                        <span :class="['font-black text-base block', cust.credit_balance > 0 ? 'text-amber-600' : 'text-gray-400 font-semibold']">
                            {{ cust.credit_balance.toFixed(3) }} <span class="text-xs font-bold">{{ cafeSettings.currency }}</span>
                        </span>
                        <button 
                            v-if="cust.credit_balance > 0"
                            @click="openRepaymentModal(cust)"
                            class="mt-2 bg-emerald-600 text-white text-[11px] font-black px-3 py-1.5 rounded-xl hover:bg-emerald-500 active:scale-95 transition inline-flex items-center shadow-sm shadow-emerald-600/30">
                            <i class="fa-solid fa-hand-holding-dollar mr-1.5 text-emerald-200"></i> Régler
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- ========================================================= -->
        <!-- TAB 5 : RÉGLAGES (PARAMÈTRES, PRODUITS, BACKUP, USERS)    -->
        <!-- ========================================================= -->
        <section v-if="activeTab === 'settings'" class="p-4 space-y-4">
            <h2 class="font-extrabold text-gray-800 text-lg">Réglages & Administration</h2>

            <div v-if="currentUser.role !== 'admin'" class="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-2xl text-amber-900 text-xs leading-relaxed shadow-sm">
                <i class="fa-solid fa-shield-halved text-amber-600 mr-1.5"></i>
                <strong>Mode Barista :</strong> Vous êtes en mode lecture. Pour ajouter/supprimer des produits, modifier les utilisateurs ou faire un Backup, passez au rôle <strong>Admin</strong> en haut à droite.
            </div>

            <!-- SECTION A : GESTION DES PRODUITS (AJOUTER / SUPPRIMER) -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-xs font-black text-gray-600 uppercase tracking-wider flex items-center">
                        <i class="fa-solid fa-mug-hot text-coffee-600 mr-2 text-sm"></i> Catalogue & Produits
                    </h3>
                    <button 
                        v-if="currentUser.role === 'admin'"
                        @click="showAddProductModal = true"
                        class="bg-coffee-600 text-white px-2.5 py-1 rounded-lg text-xs font-black hover:bg-coffee-500 active:scale-95 transition flex items-center space-x-1 shadow-sm">
                        <i class="fa-solid fa-plus"></i>
                        <span>Ajouter</span>
                    </button>
                </div>
                <div class="divide-y divide-gray-100">
                    <div v-for="p in products" :key="p.id" class="p-3 flex justify-between items-center">
                        <div class="flex items-center space-x-3">
                            <span class="w-9 h-9 bg-coffee-50 text-coffee-700 rounded-xl flex items-center justify-center font-bold text-base">
                                <i :class="p.icon"></i>
                            </span>
                            <div>
                                <h4 class="font-extrabold text-xs text-gray-800">{{ p.name }}</h4>
                                <span class="text-[10px] text-gray-400 uppercase font-bold">{{ p.category_id }} • {{ p.price.toFixed(3) }} {{ cafeSettings.currency }}</span>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button 
                                @click="toggleAvailability(p)"
                                :class="['px-2 py-1 rounded-lg text-[10px] font-black uppercase transition', p.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800']">
                                {{ p.is_available ? 'Disponible' : 'Épuisé' }}
                            </button>
                            <button 
                                v-if="currentUser.role === 'admin'"
                                @click="deleteProduct(p.id)"
                                class="text-gray-400 hover:text-red-600 p-1.5 transition text-sm"
                                title="Supprimer le produit">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="text-xs font-black text-gray-600 uppercase tracking-wider flex items-center">
                        <i class="fa-solid fa-user-gear text-coffee-600 mr-2 text-sm"></i> Équipe & Rôles
                    </h3>
                    <button 
                        @click="handleLogout"
                        class="bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs font-black hover:bg-red-500 active:scale-95 transition flex items-center space-x-1 shadow-sm mr-2">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>Déconnexion</span>
                    </button>
                    <button 
                        v-if="currentUser.role === 'admin'"
                        @click="showAddUserModal = true"
                        class="bg-coffee-600 text-white px-2.5 py-1 rounded-lg text-xs font-black hover:bg-coffee-500 active:scale-95 transition flex items-center space-x-1 shadow-sm">
                        <i class="fa-solid fa-user-plus"></i>
                        <span>Nouveau</span>
                    </button>
                </div>
                <div class="divide-y divide-gray-100">
                    <div v-for="u in userList" :key="u.id" class="p-3 flex justify-between items-center">
                        <div class="flex items-center space-x-2.5">
                            <span :class="['w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white', u.role === 'admin' ? 'bg-purple-600' : 'bg-coffee-600']">
                                <i :class="u.role === 'admin' ? 'fa-solid fa-user-shield' : 'fa-solid fa-user'"></i>
                            </span>
                            <div>
                                <div class="flex items-center space-x-2">
                                    <input 
                                        v-if="currentUser.role === 'admin'"
                                        v-model="u.name" 
                                        type="text" 
                                        class="font-extrabold text-xs text-gray-800 border-b border-dashed border-gray-300 focus:border-coffee-600 focus:outline-none pb-0.5">
                                    <span v-else class="font-extrabold text-xs text-gray-800">{{ u.name }}</span>
                                    <span v-if="u.id === currentUser.id" class="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded">MOI</span>
                                </div>
                                <span class="text-[10px] text-gray-400 uppercase font-bold block mt-0.5">Rôle : {{ u.role }}</span>
                            </div>
                        </div>
                        <div v-if="currentUser.role === 'admin' && u.id !== currentUser.id" class="flex space-x-2">
                            <button 
                                @click="deleteUser(u.id)"
                                class="text-gray-400 hover:text-red-600 p-1.5 transition text-sm"
                                title="Supprimer ce profil">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SECTION C : PARAMÈTRES GÉNÉRAUX DU CAFÉ -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-3">
                <h3 class="text-xs font-black text-gray-600 uppercase tracking-wider flex items-center mb-3">
                    <i class="fa-solid fa-store text-coffee-600 mr-2 text-sm"></i> Paramètres du Café & Ticket
                </h3>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Nom de l'Établissement</label>
                    <input v-model="cafeSettings.name" :disabled="currentUser.role !== 'admin'" type="text" class="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-extrabold text-gray-800 focus:outline-coffee-600">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Devise</label>
                        <input v-model="cafeSettings.currency" :disabled="currentUser.role !== 'admin'" type="text" class="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-extrabold text-gray-800 focus:outline-coffee-600">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Taux de TVA (%)</label>
                        <input v-model.number="cafeSettings.taxRate" :disabled="currentUser.role !== 'admin'" type="number" class="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-extrabold text-gray-800 focus:outline-coffee-600">
                    </div>
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Matricule Fiscal / En-tête Ticket</label>
                    <input v-model="cafeSettings.fiscalId" :disabled="currentUser.role !== 'admin'" type="text" placeholder="Ex: 1234567/X/A/M/000" class="w-full border border-gray-300 rounded-xl p-2 text-xs font-medium text-gray-700 focus:outline-coffee-600">
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div class="flex items-center space-x-2">
                        <i class="fa-solid fa-print text-gray-500 text-lg"></i>
                        <span class="text-xs font-bold text-gray-800">Impression automatique du ticket</span>
                    </div>
                    <input type="checkbox" v-model="cafeSettings.autoPrint" :disabled="currentUser.role !== 'admin'" class="w-5 h-5 accent-coffee-600 rounded cursor-pointer">
                </div>
                <div class="pt-2 border-t border-gray-100">
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Mode de Caisse / Saisie</label>
                    <select v-model="cafeSettings.orderEntryMode" :disabled="currentUser.role !== 'admin'" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold text-gray-800 focus:outline-coffee-600 bg-gray-50">
                        <option value="pos">Mode Standard (Caisse classique)</option>
                        <option value="bulk">Mode Global (Clôture de service)</option>
                    </select>
                </div>
            </div>

            <!-- SECTION D : SAUVEGARDE & BACKUP BASE DE DONNÉES -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-3">
                <h3 class="text-xs font-black text-coffee-700 uppercase tracking-wider flex items-center">
                    <i class="fa-solid fa-cloud-arrow-down text-coffee-600 mr-2 text-base"></i> Sauvegarde Cloud & Export
                </h3>
                <p class="text-xs text-gray-500 leading-relaxed">
                    Exportez un instantané complet de votre base Supabase (Ventes, Catalogue, Stock, Ardoises) au format JSON sécurisé.
                </p>
                <div class="flex space-x-2 pt-1">
                    <button 
                        @click="exportDatabaseBackup"
                        class="flex-1 bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md active:scale-95">
                        <i class="fa-solid fa-download text-sm"></i>
                        <span>Télécharger le Backup JSON</span>
                    </button>
                </div>
                <div class="pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-medium">
                    <span>Dernier export : {{ lastBackupTime || 'Jamais' }}</span>
                    <button @click="resetDemoData" v-if="currentUser.role === 'admin'" class="text-red-500 hover:underline font-bold">
                        Réinitialiser la démo
                    </button>
                </div>
            </div>
        </section>

    </main>

    <!-- Floating Basket Preview (POS Tab only - Standard Mode) -->
    <div v-if="activeTab === 'pos' && cafeSettings.orderEntryMode === 'pos' && cart.length > 0" class="absolute bottom-16 left-0 right-0 p-3 bg-gradient-to-t from-gray-100 via-gray-100/90 to-transparent pointer-events-none z-20">
        <div class="bg-coffee-900 text-white p-3.5 rounded-2xl shadow-xl flex justify-between items-center pointer-events-auto border border-coffee-700">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-amber-400 text-coffee-950 rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                    {{ totalCartItems }}
                </div>
                <div>
                    <span class="text-xs text-coffee-200 block font-semibold">En Caisse</span>
                    <span class="font-black text-lg">{{ cartTotal.toFixed(3) }} {{ cafeSettings.currency }}</span>
                </div>
            </div>
            <button 
                @click="showOrderModal = true"
                class="bg-amber-400 hover:bg-amber-300 text-coffee-950 font-black px-5 py-2.5 rounded-xl text-sm transition shadow-md flex items-center space-x-1.5 active:scale-95">
                <span>Encaisser</span>
                <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    </div>

    <!-- Mobile Navigation Bar -->
    <nav class="bg-white border-t border-gray-200 px-2 py-1.5 flex justify-around items-center shadow-lg absolute bottom-0 left-0 right-0 z-30 h-16">
        <button 
            @click="activeTab = 'pos'"
            :class="['flex flex-col items-center flex-1 py-1 rounded-xl transition', activeTab === 'pos' ? 'text-coffee-600 font-extrabold scale-105' : 'text-gray-400 font-medium hover:text-gray-600']">
            <i class="fa-solid fa-cash-register text-xl"></i>
            <span class="text-[10px] mt-1">Caisse</span>
        </button>
        <button 
            @click="activeTab = 'sales'"
            :class="['flex flex-col items-center flex-1 py-1 rounded-xl transition relative', activeTab === 'sales' ? 'text-coffee-600 font-extrabold scale-105' : 'text-gray-400 font-medium hover:text-gray-600']">
            <i class="fa-solid fa-chart-line text-xl"></i>
            <span class="text-[10px] mt-1">Finances</span>
            <span class="absolute top-1 right-3 w-2 h-2 bg-emerald-500 rounded-full shadow-sm"></span>
        </button>
        <button 
            @click="activeTab = 'stock'"
            :class="['flex flex-col items-center flex-1 py-1 rounded-xl transition relative', activeTab === 'stock' ? 'text-coffee-600 font-extrabold scale-105' : 'text-gray-400 font-medium hover:text-gray-600']">
            <i class="fa-solid fa-cubes text-xl"></i>
            <span class="text-[10px] mt-1">Stock</span>
            <span v-if="stockAlerts.length > 0" class="absolute top-0.5 right-3 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-sm">{{ stockAlerts.length }}</span>
        </button>
        <button 
            @click="activeTab = 'customers'"
            :class="['flex flex-col items-center flex-1 py-1 rounded-xl transition', activeTab === 'customers' ? 'text-coffee-600 font-extrabold scale-105' : 'text-gray-400 font-medium hover:text-gray-600']">
            <i class="fa-solid fa-users text-xl"></i>
            <span class="text-[10px] mt-1">Ardoises</span>
        </button>
        <button 
            @click="activeTab = 'settings'"
            :class="['flex flex-col items-center flex-1 py-1 rounded-xl transition', activeTab === 'settings' ? 'text-coffee-600 font-extrabold scale-105' : 'text-gray-400 font-medium hover:text-gray-600']">
            <i class="fa-solid fa-gear text-xl"></i>
            <span class="text-[10px] mt-1">Réglages</span>
        </button>
    </nav>

    <!-- ========================================================= -->
    <!-- MODAL 1 : FINALISER LA COMMANDE (ENCAISSEMENT)            -->
    <!-- ========================================================= -->
    <div v-if="showOrderModal" class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-40 p-0 sm:p-4">
        <div class="bg-white w-full rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
            <div class="bg-coffee-700 text-white px-4 py-3.5 flex justify-between items-center shadow-sm">
                <h3 class="font-bold text-base flex items-center">
                    <i class="fa-solid fa-cart-shopping mr-2 text-amber-400"></i> Finaliser l'Encaissement
                </h3>
                <button @click="showOrderModal = false" class="text-white/80 hover:text-white p-1">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>

            <div class="p-4 overflow-y-auto space-y-4 flex-1">
                <!-- Cart summary list -->
                <div>
                    <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">Articles de la Commande</h4>
                    <div class="divide-y divide-gray-100 bg-gray-50 p-2.5 rounded-2xl border border-gray-200/80">
                        <div v-for="(item, index) in cart" :key="index" class="py-2 flex justify-between items-center text-sm">
                            <div class="flex items-center space-x-2.5">
                                <span class="w-6 h-6 bg-coffee-600 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-sm">{{ item.quantity }}</span>
                                <span class="font-bold text-gray-800">{{ item.product.name }}</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="font-black text-gray-800">{{ (item.product.price * item.quantity).toFixed(3) }}</span>
                                <button @click="removeFromCart(index)" class="text-red-500 hover:text-red-700 text-xs p-1">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Service Type -->
                <div>
                    <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">Lieu de Service</h4>
                    <div class="grid grid-cols-2 gap-2.5">
                        <button 
                            @click="orderType = 'takeaway'; tableNumber = ''"
                            :class="['p-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition active:scale-95', orderType === 'takeaway' ? 'bg-coffee-50 border-coffee-600 text-coffee-800 shadow-sm' : 'bg-white border-gray-200 text-gray-600']">
                            <i class="fa-solid fa-bag-shopping text-base text-coffee-600"></i>
                            <span>À emporter</span>
                        </button>
                        <button 
                            @click="orderType = 'table'"
                            :class="['p-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition active:scale-95', orderType === 'table' ? 'bg-coffee-50 border-coffee-600 text-coffee-800 shadow-sm' : 'bg-white border-gray-200 text-gray-600']">
                            <i class="fa-solid fa-utensils text-base text-coffee-600"></i>
                            <span>Sur Place (Table)</span>
                        </button>
                    </div>
                    <div v-if="orderType === 'table'" class="mt-2.5 flex items-center space-x-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <span class="text-xs font-extrabold text-gray-700 whitespace-nowrap"><i class="fa-solid fa-chair mr-1 text-coffee-600"></i> Numéro Table :</span>
                        <input v-model="tableNumber" type="text" placeholder="Ex: Terrasse 3" class="bg-white border border-gray-300 rounded-lg px-3 py-1 text-xs font-black w-full focus:outline-coffee-600">
                    </div>
                </div>

                <!-- Payment Method -->
                <div>
                    <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">Méthode d'Encaissement</h4>
                    <div class="grid grid-cols-3 gap-2">
                        <button 
                            @click="paymentMethod = 'cash'"
                            :class="['p-3 rounded-2xl border flex flex-col items-center justify-center transition text-xs font-extrabold active:scale-95', paymentMethod === 'cash' ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm' : 'bg-white border-gray-200 text-gray-600']">
                            <i class="fa-solid fa-money-bill-wave text-lg mb-1 text-emerald-600"></i>
                            <span>Espèces</span>
                        </button>
                        <button 
                            @click="paymentMethod = 'card'"
                            :class="['p-3 rounded-2xl border flex flex-col items-center justify-center transition text-xs font-extrabold active:scale-95', paymentMethod === 'card' ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-sm' : 'bg-white border-gray-200 text-gray-600']">
                            <i class="fa-solid fa-credit-card text-lg mb-1 text-blue-600"></i>
                            <span>Carte / QR</span>
                        </button>
                        <button 
                            @click="paymentMethod = 'customer_credit'"
                            :class="['p-3 rounded-2xl border flex flex-col items-center justify-center transition text-xs font-extrabold active:scale-95', paymentMethod === 'customer_credit' ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm' : 'bg-white border-gray-200 text-gray-600']">
                            <i class="fa-solid fa-book-bookmark text-lg mb-1 text-amber-600"></i>
                            <span>Ardoise</span>
                        </button>
                    </div>
                </div>

                <!-- Customer Selection (Mandatory for client credit) -->
                <div v-if="paymentMethod === 'customer_credit' || selectedCustomer">
                    <h4 class="text-xs font-black text-amber-700 uppercase mb-1.5 flex items-center">
                        <i class="fa-solid fa-user-check mr-1.5"></i> Client Associé
                    </h4>
                    <select v-model="selectedCustomer" class="w-full border-2 border-amber-400 bg-amber-50/70 rounded-2xl p-3 text-xs font-black text-gray-800 focus:outline-amber-600 shadow-sm">
                        <option :value="null">-- Choisir ou rechercher un client --</option>
                        <option v-for="c in customers" :key="c.id" :value="c.id" :disabled="c.credit_balance >= c.credit_limit">
                            {{ c.full_name }} (Crédit: {{ c.credit_balance.toFixed(3) }} / {{ c.credit_limit }} {{ cafeSettings.currency }}) {{ c.credit_balance >= c.credit_limit ? '⚠️ BLOQUÉ' : '' }}
                        </option>
                    </select>
                    <p v-if="paymentMethod === 'customer_credit' && !selectedCustomer" class="text-[10px] text-red-600 font-extrabold mt-1.5 flex items-center">
                        <i class="fa-solid fa-circle-exclamation mr-1"></i> Sélection obligatoire pour créditer le client.
                    </p>
                </div>

                <!-- Notes / Customization -->
                <div>
                    <h4 class="text-xs font-bold text-gray-400 uppercase mb-1">Notes ou Demandes Client</h4>
                    <input v-model="orderNotes" type="text" placeholder="Ex: Moins de sucre, lait de soja, extra mousse..." class="w-full border border-gray-300 rounded-xl p-3 text-xs font-medium focus:outline-coffee-600">
                </div>
            </div>

            <!-- Footer actions -->
            <div class="p-4 bg-gray-50 border-t border-gray-200 flex items-center space-x-3 shadow-inner">
                <div class="flex-1">
                    <span class="text-xs text-gray-500 block font-medium">Total Commande</span>
                    <span class="text-2xl font-black text-coffee-800">{{ cartTotal.toFixed(3) }} <span class="text-sm font-bold">{{ cafeSettings.currency }}</span></span>
                </div>
                <button 
                    @click="confirmOrder"
                    :disabled="paymentMethod === 'customer_credit' && !selectedCustomer"
                    :class="['px-6 py-3.5 rounded-2xl font-extrabold text-sm flex items-center space-x-2 shadow-lg transition active:scale-95', 
                            (paymentMethod === 'customer_credit' && !selectedCustomer) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30']">
                    <i class="fa-solid fa-check-double text-lg"></i>
                    <span>Valider Paiement</span>
                </button>
            </div>
        </div>
    </div>

    <!-- ========================================================= -->
    <!-- MODAL SORTIE (DÉPENSE)                                    -->
    <!-- ========================================================= -->
    <div v-if="showAddExpenseModal" class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div class="bg-red-700 text-white px-4 py-3 flex justify-between items-center">
                <h3 class="font-bold text-base flex items-center">
                    <i class="fa-solid fa-minus-circle mr-2 text-red-200"></i> Nouvelle Sortie
                </h3>
                <button @click="showAddExpenseModal = false" class="text-white/80 hover:text-white">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <div class="p-4 space-y-3">
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Type de Sortie</label>
                    <select v-model="newExpenseForm.category" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold focus:outline-red-600">
                        <option value="Salaire / Paiement Ouvrier">Salaire / Paiement Ouvrier</option>
                        <option value="Fournitures (Matières 1ères)">Fournitures (Matières 1ères)</option>
                        <option value="Charges Fixes (Électricité, Eau...)">Charges Fixes (Électricité, Eau...)</option>
                        <option value="Autre Dépense">Autre Dépense</option>
                    </select>
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Montant ({{ cafeSettings.currency }})</label>
                    <input v-model.number="newExpenseForm.amount" type="number" step="0.1" placeholder="Ex: 50.0" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-black focus:outline-red-600">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Description (Optionnel)</label>
                    <input v-model="newExpenseForm.description" type="text" placeholder="Ex: Paiement journalier, Achat sucre..." class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-medium focus:outline-red-600">
                </div>
            </div>
            <div class="p-4 bg-gray-50 border-t border-gray-200">
                <button 
                    @click="saveExpense"
                    class="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl text-sm transition shadow-md active:scale-95">
                    Valider la Sortie
                </button>
            </div>
        </div>
    </div>

    <!-- ========================================================= -->
    <!-- MODAL 2 : AJOUTER PRODUIT (ADMIN)                         -->
    <!-- ========================================================= -->
    <div v-if="showAddProductModal" class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div class="bg-white w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div class="bg-coffee-700 text-white px-4 py-3 flex justify-between items-center">
                <h3 class="font-bold text-base flex items-center">
                    <i class="fa-solid fa-circle-plus mr-2 text-amber-400"></i> Ajouter un Nouvel Article
                </h3>
                <button @click="showAddProductModal = false" class="text-white/80 hover:text-white">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <div class="p-4 space-y-3">
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Nom du Produit</label>
                    <input v-model="newProdForm.name" type="text" placeholder="Ex: Thé Menthe Pignons" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold focus:outline-coffee-600">
                </div>
                <div class="grid grid-cols-2 gap-2.5">
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Prix ({{ cafeSettings.currency }})</label>
                        <input v-model.number="newProdForm.price" type="number" step="0.1" placeholder="3.500" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-black focus:outline-coffee-600">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Catégorie</label>
                        <select v-model="newProdForm.category_id" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold focus:outline-coffee-600">
                            <option value="hot">Cafés & Chaud</option>
                            <option value="cold">Boissons Froides</option>
                            <option value="pastry">Pâtisseries & Snacks</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Icône (FontAwesome)</label>
                    <input v-model="newProdForm.icon" type="text" placeholder="Ex: fa-solid fa-leaf" class="w-full border border-gray-300 rounded-xl p-2 text-xs font-mono focus:outline-coffee-600">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase flex justify-between items-center mb-2">
                        <span>Ingrédients de la recette (Stock)</span>
                        <button @click="newProdForm.recipe.push({ inv_id: '', inv_qty: 0 })" class="text-[10px] bg-coffee-100 text-coffee-700 px-2 py-1 rounded font-black"><i class="fa-solid fa-plus"></i> Ajouter</button>
                    </label>
                    <div v-for="(item, index) in newProdForm.recipe" :key="index" class="flex items-end space-x-2 mb-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                        <div class="flex-1">
                            <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Ingrédient</label>
                            <select v-model="item.inv_id" class="w-full border border-gray-300 rounded-lg p-2 text-xs font-bold focus:outline-coffee-600">
                                <option value="">-- Sans ingrédient --</option>
                                <option v-for="inv in inventory" :key="inv.id" :value="inv.id">{{ inv.name }}</option>
                            </select>
                        </div>
                        <div class="w-24" v-if="item.inv_id">
                            <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Qté déduite</label>
                            <input v-model.number="item.inv_qty" type="number" step="0.001" placeholder="Qté" class="w-full border border-gray-300 rounded-lg p-2 text-xs font-bold focus:outline-coffee-600">
                        </div>
                        <button v-if="newProdForm.recipe.length > 1" @click="newProdForm.recipe.splice(index, 1)" class="p-2 mb-0.5 text-red-500 hover:text-red-700 bg-white rounded-lg border border-red-200 shadow-sm">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="p-3.5 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                <button @click="showAddProductModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold">Annuler</button>
                <button @click="confirmAddProduct" class="px-5 py-2 bg-coffee-600 text-white rounded-xl text-xs font-extrabold hover:bg-coffee-500 shadow-sm shadow-coffee-600/30">Ajouter au Menu</button>
            </div>
        </div>
    </div>

    <!-- ========================================================= -->
    <!-- MODAL 3 : AJOUTER UTILISATEUR / MEMBRE                    -->
    <!-- ========================================================= -->
    <div v-if="showAddUserModal" class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div class="bg-white w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div class="bg-coffee-700 text-white px-4 py-3 flex justify-between items-center">
                <h3 class="font-bold text-base flex items-center">
                    <i class="fa-solid fa-user-plus mr-2 text-amber-400"></i> Ajouter un Collaborateur
                </h3>
                <button @click="showAddUserModal = false" class="text-white/80 hover:text-white">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <div class="p-4 space-y-3">
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Nom / Prénom</label>
                    <input v-model="newUserForm.name" type="text" placeholder="Ex: Sami Barista" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold focus:outline-coffee-600">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Identifiant Barista (sans espaces)</label>
                    <input v-model="newUserForm.username" type="text" placeholder="Ex: sami_caisse" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold focus:outline-coffee-600">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Mot de passe</label>
                    <input v-model="newUserForm.password" type="password" placeholder="Min 6 caractères" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold focus:outline-coffee-600">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Rôle d'Accès</label>
                    <select v-model="newUserForm.role" disabled class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold bg-gray-100 text-gray-500">
                        <option value="barista">Barista (Création via ce formulaire)</option>
                    </select>
                </div>
            </div>
            <div class="p-3.5 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                <button @click="showAddUserModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold">Annuler</button>
                <button @click="confirmAddUser" class="px-5 py-2 bg-coffee-600 text-white rounded-xl text-xs font-extrabold hover:bg-coffee-500 shadow-sm shadow-coffee-600/30">Créer le Compte</button>
            </div>
        </div>
    </div>

    <!-- Modals 4 & 5 : Add Stock, Repayment, Add Customer remain exactly intact and high quality -->
    <div v-if="showAddStockModal" class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div class="bg-white w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div class="bg-coffee-700 text-white px-4 py-3 flex justify-between items-center">
                <h3 class="font-bold text-base">Entrée de Fournitures</h3>
                <button @click="showAddStockModal = false" class="text-white/80 hover:text-white">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <div class="p-4 space-y-3">
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Fourniture / Ingrédient</label>
                    <select v-model="stockForm.item_id" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold">
                        <option v-for="item in inventory" :key="item.id" :value="item.id">
                            {{ item.name }} (Actuel: {{ item.current_stock }} {{ item.unit }})
                        </option>
                    </select>
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Quantité Réceptionnée</label>
                    <input v-model.number="stockForm.qty" type="number" step="0.5" placeholder="0" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold focus:outline-coffee-600">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Facture / Fournisseur</label>
                    <input v-model="stockForm.note" type="text" placeholder="Ex: Commande Centrale Laitière" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-coffee-600">
                </div>
            </div>
            <div class="p-3.5 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                <button @click="showAddStockModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold">Annuler</button>
                <button @click="confirmAddStock" class="px-5 py-2 bg-coffee-600 text-white rounded-xl text-xs font-bold hover:bg-coffee-700 shadow-sm shadow-coffee-600/30">Mettre à jour le stock</button>
            </div>
        </div>
    </div>

    <!-- Repayment Modal -->
    <div v-if="repaymentModal.show" class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div class="bg-white w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div class="bg-emerald-700 text-white px-4 py-3 flex justify-between items-center">
                <h3 class="font-bold text-base flex items-center"><i class="fa-solid fa-cash-register mr-2 text-emerald-200"></i> Remboursement Ardoise</h3>
                <button @click="repaymentModal.show = false" class="text-white/80 hover:text-white">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <div class="p-4 space-y-3">
                <div class="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                    <span class="text-xs text-emerald-800 block font-medium">Client : <strong class="font-black text-emerald-950 text-sm">{{ repaymentModal.customer?.full_name }}</strong></span>
                    <span class="text-sm font-black text-emerald-900 mt-1 block">Reste à payer : {{ repaymentModal.customer?.credit_balance.toFixed(3) }} {{ cafeSettings.currency }}</span>
                </div>
                <div>
                    <label class="text-xs font-extrabold text-gray-500 uppercase block mb-1">Montant Encaissé ({{ cafeSettings.currency }})</label>
                    <input v-model.number="repaymentModal.amount" type="number" step="0.5" :max="repaymentModal.customer?.credit_balance" class="w-full border-2 border-emerald-400 rounded-2xl p-3 text-lg font-black text-emerald-700 focus:outline-emerald-600 shadow-sm">
                </div>
            </div>
            <div class="p-3.5 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                <button @click="repaymentModal.show = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold">Annuler</button>
                <button @click="confirmRepayment" class="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-500 shadow-md shadow-emerald-600/30">Valider l'Encaissement</button>
            </div>
        </div>
    </div>

    <!-- Shift Details Modal -->
    <div v-if="shiftDetailsModal.show" class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div class="bg-white w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div class="bg-purple-700 text-white px-4 py-3 flex justify-between items-center">
                <h3 class="font-bold text-base flex items-center"><i class="fa-solid fa-list-check mr-2 text-purple-200"></i> Détails Clôture #{{ shiftDetailsModal.shift?.id.split('_')[1] }}</h3>
                <button @click="shiftDetailsModal.show = false" class="text-white/80 hover:text-white">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <div class="p-4 overflow-y-auto">
                <div class="bg-purple-50 p-3 rounded-2xl border border-purple-100 mb-4 flex justify-between items-center">
                    <div>
                        <span class="text-[10px] text-purple-500 font-bold block uppercase">Total Encaissé</span>
                        <span class="text-lg font-black text-purple-900">{{ shiftDetailsModal.shift?.total_revenue.toFixed(3) }} {{ cafeSettings.currency }}</span>
                    </div>
                    <div class="text-right">
                        <span class="text-[10px] text-purple-500 font-bold block uppercase">Date & Barista</span>
                        <span class="text-xs font-bold text-purple-900">{{ new Date(shiftDetailsModal.shift?.date).toLocaleDateString() }} • {{ shiftDetailsModal.shift?.barista_name }}</span>
                    </div>
                </div>
                
                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Produits Vendus</h4>
                <div class="divide-y divide-gray-100 border border-gray-100 rounded-xl">
                    <div v-for="item in shiftDetailsModal.shift?.details" :key="item.product.id" class="p-3 flex justify-between items-center bg-gray-50/50">
                        <div class="flex items-center space-x-3">
                            <span class="w-8 h-8 bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center font-bold text-sm">
                                <i :class="item.product.icon"></i>
                            </span>
                            <div>
                                <span class="font-extrabold text-sm text-gray-800">{{ item.product.name }}</span>
                                <span class="block text-[10px] text-gray-400">{{ item.product.price.toFixed(3) }} {{ cafeSettings.currency }} / unité</span>
                            </div>
                        </div>
                        <span class="font-black text-base text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm">x{{ item.qty }}</span>
                    </div>
                </div>
            </div>
            <div class="p-3.5 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button @click="shiftDetailsModal.show = false" class="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-500 shadow-md shadow-purple-600/30">Fermer</button>
            </div>
        </div>
    </div>

    <!-- Add/Edit Inventory Item Modal -->
    <div v-if="showManageInventoryModal" class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div class="bg-white w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div class="bg-coffee-700 text-white px-4 py-3 flex justify-between items-center">
                <h3 class="font-bold text-base flex items-center"><i class="fa-solid fa-boxes-stacked mr-2 text-amber-400"></i> {{ manageInventoryMode === 'add' ? 'Nouvel Article Stock' : 'Modifier Article' }}</h3>
                <button @click="showManageInventoryModal = false" class="text-white/80 hover:text-white">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <div class="p-4 space-y-3">
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Nom de l'ingrédient</label>
                    <input v-model="manageInventoryForm.name" type="text" placeholder="Ex: Gobelets 8oz" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold focus:outline-coffee-600">
                </div>
                <div class="grid grid-cols-2 gap-2.5">
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Unité</label>
                        <input v-model="manageInventoryForm.unit" type="text" placeholder="kg, L, unités" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-black focus:outline-coffee-600">
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Seuil Alerte</label>
                        <input v-model.number="manageInventoryForm.min_stock_alert" type="number" step="0.5" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-black focus:outline-coffee-600">
                    </div>
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Icône (FontAwesome)</label>
                    <input v-model="manageInventoryForm.icon" type="text" placeholder="fa-solid fa-box" class="w-full border border-gray-300 rounded-xl p-2 text-xs font-mono focus:outline-coffee-600">
                </div>
            </div>
            <div class="p-3.5 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                <button @click="showManageInventoryModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold">Annuler</button>
                <button @click="confirmSaveInventoryItem" class="px-5 py-2 bg-coffee-600 text-white rounded-xl text-xs font-black hover:bg-coffee-500 shadow-sm shadow-coffee-600/30">Enregistrer</button>
            </div>
        </div>
    </div>

    <!-- Add Customer Modal -->
    <div v-if="showAddCustomerModal" class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div class="bg-white w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div class="bg-coffee-700 text-white px-4 py-3 flex justify-between items-center">
                <h3 class="font-bold text-base flex items-center"><i class="fa-solid fa-user-plus mr-2 text-amber-400"></i> Créer un Compte Client</h3>
                <button @click="showAddCustomerModal = false" class="text-white/80 hover:text-white">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
            <div class="p-4 space-y-3">
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Nom / Prénom du Client</label>
                    <input v-model="newCust.full_name" type="text" placeholder="Ex: Karim Ben Ahmed" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold focus:outline-coffee-600">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Numéro de Téléphone</label>
                    <input v-model="newCust.phone" type="text" placeholder="Ex: +216 98 765 432" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-extrabold focus:outline-coffee-600">
                </div>
                <div>
                    <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Plafond de Crédit Autorisé ({{ cafeSettings.currency }})</label>
                    <input v-model.number="newCust.credit_limit" type="number" step="10" class="w-full border border-gray-300 rounded-xl p-2.5 text-xs font-black focus:outline-coffee-600">
                </div>
            </div>
            <div class="p-3.5 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                <button @click="showAddCustomerModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold">Annuler</button>
                <button @click="confirmAddCustomer" class="px-5 py-2 bg-coffee-600 text-white rounded-xl text-xs font-black hover:bg-coffee-500 shadow-sm shadow-coffee-600/30">Ouvrir l'Ardoise</button>
            </div>
        </div>
    </div>

</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import { createClient } from '@supabase/supabase-js';

const router = useRouter();

// App State
        const activeTab = ref('pos');
const currentCafeId = ref(null); // pos, sales, stock, customers, settings
        
        // Settings State
        const cafeSettings = ref({
            name: 'Café de la Marina Pro',
            currency: 'TND',
            taxRate: 19,
            fiscalId: '1234567/X/A/M/000',
            autoPrint: true,
            orderEntryMode: 'pos' // 'pos' or 'bulk'
        });

        // Finances State
        const financeSubTab = ref('sales'); // 'sales', 'expenses', 'stats'
        const expenses = ref([]);
        const shiftClosures = ref([]);

        // Real Users Data
        const userList = ref([]);
        const currentUser = ref({ id: '', name: 'Chargement...', role: 'barista' });
        
        onMounted(async () => {
             const { data: { session } } = await supabase.auth.getSession();
             if(!session) {
                 router.push('/login');
                 return;
             }
             const userId = session.user.id;
             
             // Check if Admin
             const { data: cafeAdmin } = await supabase.from('cafes').select('*').eq('admin_id', userId).single();
             if (cafeAdmin) {
                 currentUser.value = { id: userId, name: 'Gérant (Admin)', role: 'admin' };
                 userList.value = [{ id: userId, name: 'Moi (Gérant)', role: 'admin' }];
                 currentCafeId.value = cafeAdmin.id;
                 cafeSettings.value.name = cafeAdmin.name;
                 if (cafeAdmin.currency) cafeSettings.value.currency = cafeAdmin.currency;
                 if (cafeAdmin.tax_rate) cafeSettings.value.taxRate = cafeAdmin.tax_rate;
                 
                 // Fetch baristas
                 const { data: baristas } = await supabase.from('barista_accounts').select('*').eq('cafe_id', cafeAdmin.id);
                 if (baristas) {
                     baristas.forEach(b => userList.value.push({ id: b.id, name: b.name, role: 'barista' }));
                 }
             } else {
                 // It's a barista or a broken admin
                 const isProbablyAdmin = session.user.email && !session.user.email.endsWith('@barista.local');
                 
                 if (isProbablyAdmin) {
                     // Try to auto-repair missing cafe entry for admin
                     const { error: insertErr } = await supabase.from('cafes').insert({
                         admin_id: userId,
                         name: 'Mon Café'
                     });
                     if (!insertErr) {
                         window.location.reload();
                         return;
                     }
                 }

                 const usernameFromEmail = session.user.email.split('@')[0];
                 const { data: baristaAccount } = await supabase.from('barista_accounts').select('name, cafe_id').eq('username', usernameFromEmail).single();
                 if (baristaAccount) {
                     currentUser.value = { id: userId, name: baristaAccount.name, role: 'barista' };
                     currentCafeId.value = baristaAccount.cafe_id;
                     const { data: cafeData } = await supabase.from('cafes').select('*').eq('id', baristaAccount.cafe_id).single();
                     if (cafeData) {
                         cafeSettings.value.name = cafeData.name;
                         if (cafeData.currency) cafeSettings.value.currency = cafeData.currency;
                         if (cafeData.tax_rate) cafeSettings.value.taxRate = cafeData.tax_rate;
                     }
                 } else {
                     currentUser.value = { id: userId, name: isProbablyAdmin ? 'Gérant (Réparation)' : 'Barista Anonyme', role: 'barista' };
                 }
                 userList.value = [currentUser.value];
             }
             
             if (currentCafeId.value) {
                 const [invRes, prodRes, custRes, ordRes, expRes, shiftRes] = await Promise.all([
                     supabase.from('inventory').select('*').eq('cafe_id', currentCafeId.value),
                     supabase.from('products').select('*').eq('cafe_id', currentCafeId.value),
                     supabase.from('customers').select('*').eq('cafe_id', currentCafeId.value),
                     supabase.from('orders').select('*').eq('cafe_id', currentCafeId.value).order('created_at', { ascending: false }).limit(100),
                     supabase.from('expenses').select('*').eq('cafe_id', currentCafeId.value).order('date', { ascending: false }).limit(100),
                     supabase.from('shift_closures').select('*').eq('cafe_id', currentCafeId.value).order('date', { ascending: false }).limit(50)
                 ]);
                 if(invRes.data) inventory.value = invRes.data;
                 if(prodRes.data) products.value = prodRes.data;
                 if(custRes.data) customers.value = custRes.data;
                 if(ordRes.data) orders.value = ordRes.data;
                 if(expRes.data) expenses.value = expRes.data;
                 if(shiftRes.data) shiftClosures.value = shiftRes.data;
                 
                 products.value.forEach(p => {
                     if (bulkQuantities.value[p.id] === undefined) bulkQuantities.value[p.id] = 0;
                 });
             }
        });

        const handleLogout = async () => {
            await supabase.auth.signOut();
            router.push('/login');
        };

        // Users Administration
        const showAddUserModal = ref(false);
        const newUserForm = ref({ name: '', username: '', password: '', role: 'barista' });
        
        const confirmAddUser = async () => {
            if (!newUserForm.value.name || !newUserForm.value.username || !newUserForm.value.password) {
                alert("Veuillez remplir tous les champs !");
                return;
            }
            try {
                // 1. Récupérer le cafe_id de l'admin actuel
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error("Non connecté");
                
                let { data: cafeData } = await supabase
                    .from('cafes')
                    .select('id')
                    .eq('admin_id', session.user.id)
                    .single();
                
                let cafeId = cafeData?.id;
                
                // --- AUTO-RÉPARATION ---
                // Si la création du café a échoué lors de l'inscription à cause d'une ancienne erreur RLS, on le recrée ici.
                if (!cafeId) {
                    const { data: newCafe, error: newCafeErr } = await supabase
                        .from('cafes')
                        .insert({ admin_id: session.user.id, name: 'Mon Café' })
                        .select('id')
                        .single();
                        
                    if (newCafeErr) throw new Error("Impossible de lier ou créer le café : " + newCafeErr.message);
                    cafeId = newCafe.id;
                }

                // 2. Créer l'utilisateur dans Supabase Auth (Sans déconnecter l'admin)
                // On utilise un second client avec persistSession: false
                const secondaryClient = createClient(
                    'https://wnqxnuwbtpjzefekovmg.supabase.co', 
                    'sb_publishable_hYZfyYpGy9Ef9vmQB0bFMQ_phRj9Dli', 
                    { auth: { persistSession: false, autoRefreshToken: false } }
                );

                const dummyEmail = `${newUserForm.value.username.toLowerCase().trim()}@barista.local`;
                const { data: authData, error: authErr } = await secondaryClient.auth.signUp({
                    email: dummyEmail,
                    password: newUserForm.value.password
                });

                if (authErr) throw authErr;

                // 3. Ajouter l'enregistrement dans barista_accounts
                const { error: dbErr } = await supabase.from('barista_accounts').insert({
                    cafe_id: cafeId,
                    username: newUserForm.value.username,
                    name: newUserForm.value.name,
                    password_hash: 'managed_by_auth'
                });

                if (dbErr) throw dbErr;

                // Mise à jour de l'affichage local
                userList.value.push({
                    id: authData.user?.id || ('u' + Date.now()),
                    name: newUserForm.value.name,
                    role: 'barista'
                });

                alert(`Barista ${newUserForm.value.name} créé avec succès !`);
                showAddUserModal.value = false;
                newUserForm.value = { name: '', username: '', password: '', role: 'barista' };

            } catch (error) {
                alert("Erreur lors de la création : " + error.message);
            }
        };
        const deleteUser = async (id) => {
            if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
                const { error } = await supabase.from('barista_accounts').delete().eq('id', id);
                if (error) {
                    alert("Erreur lors de la suppression : " + error.message);
                } else {
                    userList.value = userList.value.filter(u => u.id !== id);
                }
            }
        };

        // Mock Categories
        const categories = ref([
            { id: 'all', name: 'Tout', icon: 'fa-solid fa-star text-amber-500' },
            { id: 'hot', name: 'Cafés & Chaud', icon: 'fa-solid fa-mug-hot text-amber-600' },
            { id: 'cold', name: 'Boissons Froides', icon: 'fa-solid fa-glass-water text-cyan-500' },
            { id: 'pastry', name: 'Pâtisseries & Snacks', icon: 'fa-solid fa-cookie-bite text-amber-700' }
        ]);
        const selectedCategory = ref('all');

        // Mock Inventory
        const inventory = ref([]);

        const stockAlerts = computed(() => {
            return inventory.value.filter(i => i.current_stock <= i.min_stock_alert);
        });

        // Mock Products
        const products = ref([]);

        const filteredProducts = computed(() => {
            if (selectedCategory.value === 'all') return products.value;
            return products.value.filter(p => p.category_id === selectedCategory.value);
        });

        // Product Administration
        const showAddProductModal = ref(false);
        const showAddExpenseModal = ref(false);
        
        const newExpenseForm = ref({ amount: null, category: 'Fournitures', description: '' });
        
        const saveExpense = async () => {
            if (!newExpenseForm.value.amount || newExpenseForm.value.amount <= 0) {
                alert("Montant invalide.");
                return;
            }
            const newExp = {
                cafe_id: currentCafeId.value,
                amount: newExpenseForm.value.amount,
                category: newExpenseForm.value.category,
                description: newExpenseForm.value.description,
                date: new Date().toISOString(),
                barista_name: currentUser.value.name
            };
            const { data, error } = await supabase.from('expenses').insert(newExp).select().single();
            if (error) { alert("Erreur: " + error.message); return; }
            expenses.value.unshift(data);
            showAddExpenseModal.value = false;
            newExpenseForm.value = { amount: null, category: 'Fournitures', description: '' };
        };
        const newProdForm = ref({ name: '', price: 3.000, category_id: 'hot', icon: 'fa-solid fa-mug-hot', recipe: [{ inv_id: '', inv_qty: 0 }] });
        
        const confirmAddProduct = async () => {
            if (!newProdForm.value.name) return;
            const recipe = [];
            const summaryParts = [];
            
            newProdForm.value.recipe.forEach(item => {
                if(item.inv_id && item.inv_qty > 0) {
                   recipe.push({ id: item.inv_id, qty: item.inv_qty });
                   const invObj = inventory.value.find(i => i.id === item.inv_id);
                   if(invObj) summaryParts.push(`${item.inv_qty} ${invObj.unit} ${invObj.name}`);
                }
            });
            const recipeSummary = summaryParts.join(' + ') || 'Sans recette liée';

            const newProd = {
                cafe_id: currentCafeId.value,
                name: newProdForm.value.name,
                price: newProdForm.value.price,
                category_id: newProdForm.value.category_id,
                icon: newProdForm.value.icon || 'fa-solid fa-utensils',
                is_available: true,
                recipe: recipe,
                recipe_summary: recipeSummary
            };
            const { data, error } = await supabase.from('products').insert(newProd).select().single();
            if (error) { alert("Erreur: " + error.message); return; }
            products.value.push(data);
            alert(`Produit ${newProdForm.value.name} ajouté au catalogue !`);
            showAddProductModal.value = false;
            newProdForm.value = { name: '', price: 3.000, category_id: 'hot', icon: 'fa-solid fa-mug-hot', recipe: [{ inv_id: '', inv_qty: 0 }] };
        };

        const toggleAvailability = async (p) => {
            p.is_available = !p.is_available;
            await supabase.from('products').update({ is_available: p.is_available }).eq('id', p.id);
        };
        const deleteProduct = async (id) => {
            if (confirm('Voulez-vous vraiment supprimer cet article du catalogue ?')) {
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) { alert("Erreur: " + error.message); return; }
                products.value = products.value.filter(p => p.id !== id);
            }
        };

        // Mock Customers
        const customers = ref([]);

        const totalOutstandingCredit = computed(() => {
            return customers.value.reduce((acc, c) => acc + c.credit_balance, 0);
        });

        // Orders & Cart
        const cart = ref([]);

        // Bulk Entry Mode
        const bulkDate = ref(new Date().toISOString().slice(0, 10));
        const bulkQuantities = ref({});
        
        

        const updateBulkQuantity = (prodId, delta) => {
            if (bulkQuantities.value[prodId] === undefined) {
                bulkQuantities.value[prodId] = 0;
            }
            const newQty = bulkQuantities.value[prodId] + delta;
            if (newQty >= 0) {
                bulkQuantities.value[prodId] = newQty;
            }
        };

        const bulkTotalAmount = computed(() => {
            let total = 0;
            for (const prod of products.value) {
                const qty = bulkQuantities.value[prod.id] || 0;
                total += qty * prod.price;
            }
            return total;
        });

        const submitBulkShift = async () => {
            if (bulkTotalAmount.value <= 0) return;
            
            const details = [];
            
            for (const prod of products.value) {
                const qty = bulkQuantities.value[prod.id] || 0;
                if (qty > 0) {
                    details.push({ product: prod, qty: qty });
                    if (prod.recipe && prod.recipe.length > 0) {
                        for (const item of prod.recipe) {
                            const invItem = inventory.value.find(i => i.id === item.inv_id || i.id === item.id);
                            if (invItem) {
                                const newStock = Number((invItem.current_stock - ((item.inv_qty || item.qty) * qty)).toFixed(2));
                                invItem.current_stock = newStock < 0 ? 0 : newStock;
                                await supabase.from('inventory').update({ current_stock: invItem.current_stock }).eq('id', invItem.id);
                            }
                        }
                    }
                }
            }
            
            const shiftDateObj = new Date(bulkDate.value);
            const now = new Date();
            shiftDateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
            
            const newShift = {
                cafe_id: currentCafeId.value,
                total_revenue: bulkTotalAmount.value,
                date: shiftDateObj.toISOString(),
                barista_name: currentUser.value.name,
                details: details
            };
            
            const { data, error } = await supabase.from('shift_closures').insert(newShift).select().single();
            if (error) { alert("Erreur: " + error.message); return; }
            
            shiftClosures.value.unshift(data);
            products.value.forEach(p => bulkQuantities.value[p.id] = 0);
            
            alert(`Service clôturé avec succès. Total: ${bulkTotalAmount.value.toFixed(3)} ${cafeSettings.value.currency}`);
        };
        const addToCart = (prod) => {
            if (!prod.is_available) return;
            const existing = cart.value.find(item => item.product.id === prod.id);
            if (existing) {
                existing.quantity++;
            } else {
                cart.value.push({ product: prod, quantity: 1 });
            }
        };

        const removeFromCart = (idx) => {
            cart.value.splice(idx, 1);
        };

        const cartTotal = computed(() => {
            return cart.value.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        });

        const totalCartItems = computed(() => {
            return cart.value.reduce((acc, item) => acc + item.quantity, 0);
        });

        // Date Filtering for Finances
        const financeStartDate = ref(new Date().toISOString().slice(0, 10));
        const financeEndDate = ref(new Date().toISOString().slice(0, 10));

        const isDateInRange = (dateString) => {
            if (!dateString) return false;
            const date = new Date(dateString).toISOString().slice(0, 10);
            return date >= financeStartDate.value && date <= financeEndDate.value;
        };

        // Mock Orders History
        const orders = ref([]);

        const filteredOrders = computed(() => {
            return orders.value.filter(o => isDateInRange(o.created_at));
        });

        const filteredShiftClosures = computed(() => {
            return shiftClosures.value.filter(s => isDateInRange(s.date));
        });

        const filteredExpenses = computed(() => {
            return expenses.value.filter(e => isDateInRange(e.date));
        });

        const sortedOrders = computed(() => {
            return [...filteredOrders.value].reverse();
        });

        const todayRevenue = computed(() => {
            const posRevenue = filteredOrders.value.reduce((acc, o) => acc + o.total_amount, 0);
            const bulkRevenue = filteredShiftClosures.value.reduce((acc, s) => acc + s.total_revenue, 0);
            return posRevenue + bulkRevenue;
        });
        const totalExpenses = computed(() => {
            return filteredExpenses.value.reduce((acc, exp) => acc + exp.amount, 0);
        });
        const cashRevenue = computed(() => {
            return filteredOrders.value.filter(o => o.payment_method === 'cash').reduce((acc, o) => acc + o.total_amount, 0);
        });
        const cardRevenue = computed(() => {
            return filteredOrders.value.filter(o => o.payment_method === 'card').reduce((acc, o) => acc + o.total_amount, 0);
        });
        const creditRevenue = computed(() => {
            return filteredOrders.value.filter(o => o.payment_method === 'customer_credit').reduce((acc, o) => acc + o.total_amount, 0);
        });

        // Modals
        const showOrderModal = ref(false);
        const orderType = ref('table');
        const tableNumber = ref('Table 1');
        const paymentMethod = ref('cash');
        const selectedCustomer = ref(null);
        const orderNotes = ref('');

        const confirmOrder = async () => {
            if (cart.value.length === 0) return;

            let custName = null;
            if (paymentMethod.value === 'customer_credit') {
                const cust = customers.value.find(c => c.id === selectedCustomer.value);
                if (cust) {
                    cust.credit_balance += cartTotal.value;
                    await supabase.from('customers').update({ credit_balance: cust.credit_balance }).eq('id', cust.id);
                    custName = cust.full_name;
                }
            } else if (selectedCustomer.value) {
                const cust = customers.value.find(c => c.id === selectedCustomer.value);
                if (cust) custName = cust.full_name;
            }

            for (const cartItem of cart.value) {
                if (cartItem.product.recipe) {
                    for (const rec of cartItem.product.recipe) {
                        const inv = inventory.value.find(i => i.id === rec.id);
                        if (inv) {
                            inv.current_stock = Number((inv.current_stock - (rec.qty * cartItem.quantity)).toFixed(2));
                            await supabase.from('inventory').update({ current_stock: inv.current_stock }).eq('id', inv.id);
                        }
                    }
                }
            }

            for (const inv of inventory.value) {
                if (inv.current_stock <= 0) {
                    for (const p of products.value) {
                        if (p.recipe?.some(r => r.id === inv.id)) {
                            p.is_available = false;
                            await supabase.from('products').update({ is_available: false }).eq('id', p.id);
                        }
                    }
                }
            }

            const newOrder = {
                cafe_id: currentCafeId.value,
                order_number: 100 + orders.value.length + 1,
                barista_name: currentUser.value.name,
                total_amount: cartTotal.value,
                payment_method: paymentMethod.value,
                created_at: new Date().toISOString(),
                table_number: orderType.value === 'table' ? tableNumber.value : '',
                customer_name: custName,
                notes: orderNotes.value
            };
            
            const { data, error } = await supabase.from('orders').insert(newOrder).select().single();
            if (error) { alert("Erreur: " + error.message); return; }
            
            orders.value.push(data);
            cart.value = [];
            showOrderModal.value = false;
            orderNotes.value = '';
            selectedCustomer.value = null;
            alert(`Encaissé avec succès ! Commande #${data.order_number}`);
        };

        // Add Stock Modal
        const showAddStockModal = ref(false);
        const stockForm = ref({ item_id: 'inv_1', qty: 5, note: '' });
        
        const confirmAddStock = async () => {
            const item = inventory.value.find(i => i.id === stockForm.value.item_id);
            if (item) {
                item.current_stock = Number((item.current_stock + stockForm.value.qty).toFixed(2));
                await supabase.from('inventory').update({ current_stock: item.current_stock }).eq('id', item.id);
                
                if (item.current_stock > 0) {
                    for (const p of products.value) {
                        if (p.recipe?.some(r => r.id === item.id) && !p.is_available) {
                            p.is_available = true;
                            await supabase.from('products').update({ is_available: true }).eq('id', p.id);
                        }
                    }
                }
                alert(`Stock mis à jour pour ${item.name} : ${item.current_stock} ${item.unit}`);
                showAddStockModal.value = false;
                stockForm.value.qty = 0;
                stockForm.value.note = '';
            }
        };

        // Add/Edit Inventory Item
        const showManageInventoryModal = ref(false);
        const manageInventoryMode = ref('add');
        const manageInventoryForm = ref({ id: '', name: '', unit: '', min_stock_alert: 5.0, icon: 'fa-solid fa-box' });

        const openCreateInventoryModal = () => {
            manageInventoryMode.value = 'add';
            manageInventoryForm.value = { id: '', name: '', unit: '', min_stock_alert: 5.0, icon: 'fa-solid fa-box' };
            showManageInventoryModal.value = true;
        };

        const openEditInventoryModal = (item) => {
            manageInventoryMode.value = 'edit';
            manageInventoryForm.value = { ...item };
            showManageInventoryModal.value = true;
        };

        const confirmSaveInventoryItem = async () => {
            if (!manageInventoryForm.value.name || !manageInventoryForm.value.unit) return;
            
            if (manageInventoryMode.value === 'add') {
                const newItem = {
                    cafe_id: currentCafeId.value,
                    name: manageInventoryForm.value.name,
                    unit: manageInventoryForm.value.unit,
                    current_stock: 0,
                    min_stock_alert: manageInventoryForm.value.min_stock_alert,
                    icon: manageInventoryForm.value.icon || 'fa-solid fa-box'
                };
                const { data, error } = await supabase.from('inventory').insert(newItem).select().single();
                if (error) { alert("Erreur: " + error.message); return; }
                inventory.value.push(data);
            } else {
                const { id, name, unit, min_stock_alert, icon } = manageInventoryForm.value;
                const { data, error } = await supabase.from('inventory').update({ name, unit, min_stock_alert, icon }).eq('id', id).select().single();
                if (error) { alert("Erreur: " + error.message); return; }
                const idx = inventory.value.findIndex(i => i.id === id);
                if (idx !== -1) inventory.value[idx] = data;
            }
            showManageInventoryModal.value = false;
        };

        const deleteInventoryItem = async (item) => {
            const isUsed = products.value.some(p => p.recipe && p.recipe.some(r => r.id === item.id));
            if (isUsed) {
                alert("Impossible de supprimer cet ingrédient car il est utilisé dans la recette d'un produit.");
                return;
            }
            if (confirm(`Voulez-vous vraiment supprimer ${item.name} du stock ?`)) {
                const { error } = await supabase.from('inventory').delete().eq('id', item.id);
                if (error) { alert("Erreur: " + error.message); return; }
                inventory.value = inventory.value.filter(i => i.id !== item.id);
            }
        };

        // Shift Details Modal
        const shiftDetailsModal = ref({ show: false, shift: null });
        const openShiftDetails = (shift) => {
            shiftDetailsModal.value.shift = shift;
            shiftDetailsModal.value.show = true;
        };

        // Repayment Modal
        const repaymentModal = ref({ show: false, customer: null, amount: 0 });
        const openRepaymentModal = (cust) => {
            repaymentModal.value.customer = cust;
            repaymentModal.value.amount = cust.credit_balance;
            repaymentModal.value.show = true;
        };
        const confirmRepayment = async () => {
            if (repaymentModal.value.customer && repaymentModal.value.amount > 0) {
                const cust = repaymentModal.value.customer;
                cust.credit_balance -= repaymentModal.value.amount;
                await supabase.from('customers').update({ credit_balance: cust.credit_balance }).eq('id', cust.id);
                alert(`Paiement de ${repaymentModal.value.amount.toFixed(3)} ${cafeSettings.value.currency} enregistré pour ${cust.full_name} !`);
                repaymentModal.value.show = false;
            }
        };

        // Add Customer Modal
        const showAddCustomerModal = ref(false);
        const newCust = ref({ full_name: '', phone: '', credit_limit: 100.0 });
        const confirmAddCustomer = async () => {
            if (!newCust.value.full_name) return;
            const newCustomer = {
                cafe_id: currentCafeId.value,
                full_name: newCust.value.full_name,
                phone: newCust.value.phone,
                credit_balance: 0,
                credit_limit: newCust.value.credit_limit
            };
            const { data, error } = await supabase.from('customers').insert(newCustomer).select().single();
            if (error) { alert("Erreur: " + error.message); return; }
            customers.value.push(data);
            alert(`Client ${newCust.value.full_name} ajouté !`);
            showAddCustomerModal.value = false;
            newCust.value = { full_name: '', phone: '', credit_limit: 100.0 };
        };

        // Database Backup Export (JSON Download)
        const lastBackupTime = ref('');
        const exportDatabaseBackup = () => {
            const backupObject = {
                exported_at: new Date().toISOString(),
                cafe_settings: cafeSettings.value,
                users: userList.value,
                categories: categories.value,
                products: products.value,
                inventory_items: inventory.value,
                customers: customers.value,
                orders: orders.value,
                expenses: expenses.value,
                shift_closures: shiftClosures.value
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObject, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `Backup_${cafeSettings.value.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            lastBackupTime.value = new Date().toLocaleTimeString();
            alert("Sauvegarde de la base de données réussie ! Fichier JSON téléchargé.");
        };

        const resetDemoData = () => {
            if (confirm('Attention : Réinitialiser la base aux données de démonstration ?')) {
                window.location.reload();
            }
        };

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

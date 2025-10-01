let coins = 1000;
let inventory = [];
let customCards = {
    normal: [],
    premium: [],
    legendary: []
};
let cardsData = {};
let allTypes = new Set();
let favorites = new Set();

const basePrices = {
    normal: 25,
    premium: 75,
    legendary: 150
};

const prices = {
    normal: 0,
    premium: 500,
    legendary: 1500
};

const probabilities = {
    normal: { normal: 0.9, premium: 0.08, legendary: 0.02 },
    premium: { normal: 0.6, premium: 0.3, legendary: 0.1 },
    legendary: { normal: 0.3, premium: 0.4, legendary: 0.3 }
};

// Elementos DOM
const coinsElement = document.getElementById('coins');
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const openButtons = document.querySelectorAll('.open-btn');
const cardsContainer = document.getElementById('cards-container');
const collectionContainer = document.getElementById('collection-container');
const favoritesContainer = document.getElementById('favorites-container');
const openingAnimation = document.getElementById('opening-animation');
const cardReveal = document.getElementById('card-reveal');
const quickSellBtn = document.getElementById('quick-sell-btn');
const quickKeepBtn = document.getElementById('quick-keep-btn');

// Elementos de búsqueda
const inventorySearch = document.getElementById('inventory-search');
const inventoryRarityFilter = document.getElementById('inventory-rarity-filter');
const collectionSearch = document.getElementById('collection-search');
const collectionRarityFilter = document.getElementById('collection-rarity-filter');
const favoritesSearch = document.getElementById('favorites-search');
const favoritesRarityFilter = document.getElementById('favorites-rarity-filter');
const searchInput = document.getElementById('search-cards');
const searchBtn = document.getElementById('search-btn');
const rarityFilter = document.getElementById('rarity-filter');
const typeFilterDb = document.getElementById('type-filter-db');

// Botones de acción
const sellAllNormalBtn = document.getElementById('sell-all-normal');
const sellAllDuplicatesBtn = document.getElementById('sell-all-duplicates');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const resetBtn = document.getElementById('reset-btn');

// Modales
const sellModal = document.getElementById('sell-modal');
const editModal = document.getElementById('edit-modal');
const sellDuplicatesModal = document.getElementById('sell-duplicates-modal');
const sellVariantModal = document.getElementById('sell-variant-modal');
const imageModal = document.getElementById('image-modal');

// Elementos del creador
const cardNameInput = document.getElementById('card-name');
const cardRaritySelect = document.getElementById('card-rarity');
const cardTypeInput = document.getElementById('card-type');
const cardPriceInput = document.getElementById('card-price');
const cardImageInput = document.getElementById('card-image');
const createCardBtn = document.getElementById('create-card-btn');
const customCardsContainer = document.getElementById('custom-cards-container');

// Elementos de edición
const editNameInput = document.getElementById('edit-name');
const editRaritySelect = document.getElementById('edit-rarity');
const editTypeInput = document.getElementById('edit-type');
const editPriceInput = document.getElementById('edit-price');
const editImageInput = document.getElementById('edit-image');
const confirmEditBtn = document.getElementById('confirm-edit');
const cancelEditBtn = document.getElementById('cancel-edit');

// Elementos de venta
const sellMessage = document.getElementById('sell-message');
const modalCardPreview = document.getElementById('modal-card-preview');
const sellPriceElement = document.getElementById('sell-price');
const confirmSellBtn = document.getElementById('confirm-sell');
const cancelSellBtn = document.getElementById('cancel-sell');

// Elementos de estadísticas
const totalCardsElement = document.getElementById('total-cards');
const totalValueElement = document.getElementById('total-value');
const normalCountElement = document.getElementById('normal-count');
const premiumCountElement = document.getElementById('premium-count');
const legendaryCountElement = document.getElementById('legendary-count');

// Elementos de duplicados
const duplicatesList = document.getElementById('duplicates-list');
const duplicatesTotal = document.getElementById('duplicates-total');
const confirmSellDuplicatesBtn = document.getElementById('confirm-sell-duplicates');
const cancelSellDuplicatesBtn = document.getElementById('cancel-sell-duplicates');

// Elementos de imagen expandida
const expandedImage = document.getElementById('expanded-image');
const expandedCardName = document.getElementById('expanded-card-name');
const expandedCardRarity = document.getElementById('expanded-card-rarity');
const expandedCardType = document.getElementById('expanded-card-type');
const expandedCardPrice = document.getElementById('expanded-card-price');
const closeImageModal = document.getElementById('close-image-modal');

// Variables temporales
let currentSellCard = null;
let currentOpenedCard = null;
let currentEditCard = null;
let currentEditRarity = null;
let currentEditIndex = null;
let currentDuplicates = [];

// Cargar datos guardados
function loadSavedData() {
    const savedCoins = localStorage.getItem('lootboxCoins');
    const savedInventory = localStorage.getItem('lootboxInventory');
    const savedCustomCards = localStorage.getItem('lootboxCustomCards');
    const savedTypes = localStorage.getItem('lootboxTypes');
    const savedFavorites = localStorage.getItem('lootboxFavorites');
    
    if (savedCoins) coins = parseInt(savedCoins);
    if (savedInventory) inventory = JSON.parse(savedInventory);
    if (savedCustomCards) customCards = JSON.parse(savedCustomCards);
    if (savedTypes) allTypes = new Set(JSON.parse(savedTypes));
    if (savedFavorites) favorites = new Set(JSON.parse(savedFavorites));
    
    coinsElement.textContent = coins;
    updateInventoryStats();
    updateTypeFilters();
}

// Guardar datos
function saveData() {
    localStorage.setItem('lootboxCoins', coins.toString());
    localStorage.setItem('lootboxInventory', JSON.stringify(inventory));
    localStorage.setItem('lootboxCustomCards', JSON.stringify(customCards));
    localStorage.setItem('lootboxTypes', JSON.stringify(Array.from(allTypes)));
    localStorage.setItem('lootboxFavorites', JSON.stringify(Array.from(favorites)));
}

// Cargar cartas desde JSON
async function loadCards() {
    try {
        const response = await fetch('cartas.json');
        cardsData = await response.json();
        addBasePricesToCards();
        extractTypesFromCards();
    } catch (error) {
        console.error('Error cargando las cartas:', error);
        cardsData = {
            normal: [
                { name: "Guerrero Básico", image: "images/guerrero-basico.jpg", price: 25, type: "Guerreros" },
                { name: "Mago Novato", image: "images/mago-novato.jpg", price: 25, type: "Magos" }
            ],
            premium: [
                { name: "Caballero Élite", image: "images/caballero-elite.jpg", price: 75, type: "Guerreros" },
                { name: "Mago Arcano", image: "images/mago-arcano.jpg", price: 75, type: "Magos" }
            ],
            legendary: [
                { name: "Dragón Ancestral", image: "images/dragon-ancestral.jpg", price: 150, type: "Criaturas" },
                { name: "Fénix", image: "images/fenix.jpg", price: 150, type: "Criaturas" }
            ]
        };
        extractTypesFromCards();
    }
}

function addBasePricesToCards() {
    Object.keys(cardsData).forEach(rarity => {
        cardsData[rarity].forEach(card => {
            if (!card.price) {
                card.price = basePrices[rarity];
            }
        });
    });
}

function extractTypesFromCards() {
    Object.keys(cardsData).forEach(rarity => {
        cardsData[rarity].forEach(card => {
            if (card.type) {
                allTypes.add(card.type);
            }
        });
    });
    Object.keys(customCards).forEach(rarity => {
        customCards[rarity].forEach(card => {
            if (card.type) {
                allTypes.add(card.type);
            }
        });
    });
    updateTypeFilters();
}

function updateTypeFilters() {
    const typeFilter = document.getElementById('type-filter');
    if (typeFilter) {
        typeFilter.innerHTML = '<option value="all">Todos los tipos</option>';
    }
    if (typeFilterDb) {
        typeFilterDb.innerHTML = '<option value="all">Todos los tipos</option>';
    }
    
    const typeSuggestions = document.getElementById('type-suggestions');
    const editTypeSuggestions = document.getElementById('edit-type-suggestions');
    
    if (typeSuggestions) typeSuggestions.innerHTML = '';
    if (editTypeSuggestions) editTypeSuggestions.innerHTML = '';
    
    allTypes.forEach(type => {
        if (typeFilter) typeFilter.innerHTML += `<option value="${type}">${type}</option>`;
        if (typeFilterDb) typeFilterDb.innerHTML += `<option value="${type}">${type}</option>`;
        if (typeSuggestions) typeSuggestions.innerHTML += `<option value="${type}">`;
        if (editTypeSuggestions) editTypeSuggestions.innerHTML += `<option value="${type}">`;
    });
}

// Sistema de favoritos
function toggleFavorite(cardId) {
    if (favorites.has(cardId)) {
        favorites.delete(cardId);
    } else {
        favorites.add(cardId);
    }
    saveData();
    updateInventory();
    updateFavorites();
    updateCollection();
}

function isFavorite(cardId) {
    return favorites.has(cardId);
}

// Funciones del juego
function openLootbox(type) {
    if (coins < prices[type]) {
        showNotification('No tienes suficientes monedas para abrir esta lootbox', 'error');
        return;
    }
    
    coins -= prices[type];
    coinsElement.textContent = coins;
    
    const rarity = getRandomRarity(type);
    const card = getRandomCard(rarity);
    
    currentOpenedCard = JSON.parse(JSON.stringify({
        ...card,
        rarity: rarity,
        id: generateCardId()
    }));
    
    saveData();
    updateInventoryStats();
    
    showOpeningAnimation(currentOpenedCard, rarity);
}

function generateCardId() {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getRandomRarity(lootboxType) {
    const prob = probabilities[lootboxType];
    const rand = Math.random();
    
    if (rand < prob.normal) return 'normal';
    if (rand < prob.normal + prob.premium) return 'premium';
    return 'legendary';
}

function getRandomCard(rarity) {
    const allCards = getAllCards();
    const cardList = allCards[rarity];
    
    if (!cardList || cardList.length === 0) {
        return { 
            name: "Carta Misteriosa", 
            image: "https://via.placeholder.com/300x400/333/fff?text=Carta+Misteriosa",
            price: basePrices[rarity],
            type: "Misterioso",
            id: generateCardId()
        };
    }
    
    const randomCard = cardList[Math.floor(Math.random() * cardList.length)];
    return JSON.parse(JSON.stringify({
        ...randomCard,
        id: generateCardId()
    }));
}

function getAllCards() {
    const allCards = {
        normal: [...(cardsData.normal || []), ...customCards.normal],
        premium: [...(cardsData.premium || []), ...customCards.premium],
        legendary: [...(cardsData.legendary || []), ...customCards.legendary]
    };
    return allCards;
}

function getAllCardsForDatabase() {
    const allCards = getAllCards();
    const databaseCards = [];
    
    Object.keys(allCards).forEach(rarity => {
        allCards[rarity].forEach(card => {
            databaseCards.push({
                ...card,
                rarity: rarity,
                isCustom: customCards[rarity].some(c => c.name === card.name && c.image === card.image)
            });
        });
    });
    
    return databaseCards;
}

// Animación de apertura
function showOpeningAnimation(card, rarity) {
    cardReveal.className = 'card-reveal';
    cardReveal.classList.add(rarity);
    
    // Contar duplicados
    const duplicateCount = countDuplicateCards(card);
    
    const img = document.createElement('img');
    img.src = card.image;
    img.alt = card.name;
    img.className = 'revealed-card-image';
    img.onerror = function() {
        this.src = 'https://via.placeholder.com/300x400/333/fff?text=Imagen+no+disponible';
    };
    
    // Badge de cantidad
    let countBadge = '';
    if (duplicateCount > 0) {
        countBadge = `<div class="opening-duplicate-count">Ya tienes ${duplicateCount}</div>`;
    }
    
    cardReveal.innerHTML = `
        ${countBadge}
        <img src="${card.image}" alt="${card.name}" class="revealed-card-image" onerror="this.src='https://via.placeholder.com/300x400/333/fff?text=Imagen+no+disponible'">
    `;
    
    openingAnimation.classList.add('active');
    
    setTimeout(() => {
        cardReveal.classList.add('active');
    }, 300);
}

function countDuplicateCards(newCard) {
    let count = 0;
    inventory.forEach(card => {
        if (card.name === newCard.name && card.rarity === newCard.rarity && card.type === newCard.type) {
            count++;
        }
    });
    return count;
}

// Venta rápida
function quickSellCard() {
    if (currentOpenedCard) {
        const cardPrice = currentOpenedCard.price || basePrices[currentOpenedCard.rarity];
        coins += cardPrice;
        coinsElement.textContent = coins;
        saveData();
        updateInventoryStats();
        showNotification(`¡Has vendido ${currentOpenedCard.name} por ${cardPrice} monedas!`);
        closeOpeningAnimation();
    }
}

function quickKeepCard() {
    if (currentOpenedCard) {
        inventory.push(currentOpenedCard);
        saveData();
        updateInventory();
        showNotification(`¡Has guardado ${currentOpenedCard.name} en tu inventario!`);
        closeOpeningAnimation();
    }
}

function closeOpeningAnimation() {
    openingAnimation.classList.remove('active');
    cardReveal.classList.remove('active');
    currentOpenedCard = null;
}

// Actualización de vistas
function updateInventory() {
    const searchTerm = inventorySearch.value.toLowerCase();
    const rarityFilterValue = inventoryRarityFilter.value;
    
    cardsContainer.innerHTML = '';
    
    if (inventory.length === 0) {
        cardsContainer.innerHTML = '<p class="empty-message">No tienes cartas. ¡Abre algunas lootboxes!</p>';
        updateInventoryStats();
        return;
    }
    
    const filteredCards = inventory.filter(card => {
        const matchesSearch = card.name.toLowerCase().includes(searchTerm);
        const matchesRarity = rarityFilterValue === 'all' || card.rarity === rarityFilterValue;
        return matchesSearch && matchesRarity;
    });
    
    if (filteredCards.length === 0) {
        cardsContainer.innerHTML = '<p class="empty-message">No hay cartas que coincidan con tu búsqueda.</p>';
        return;
    }
    
    filteredCards.forEach((card, index) => {
        const cardElement = createCardElement(card, index, true);
        cardsContainer.appendChild(cardElement);
    });
    
    updateInventoryStats();
}

function updateCollection() {
    const searchTerm = collectionSearch.value.toLowerCase();
    const rarityFilterValue = collectionRarityFilter.value;
    
    collectionContainer.innerHTML = '';
    
    const allCards = getAllCardsForDatabase();
    const ownedCards = new Set(inventory.map(card => `${card.name}-${card.rarity}-${card.type}`));
    
    // Agrupar por tipo
    const cardsByType = {};
    allCards.forEach(card => {
        const type = card.type || 'Sin tipo';
        if (!cardsByType[type]) {
            cardsByType[type] = [];
        }
        cardsByType[type].push(card);
    });
    
    // Ordenar tipos alfabéticamente
    const sortedTypes = Object.keys(cardsByType).sort();
    
    sortedTypes.forEach(type => {
        const typeSection = document.createElement('div');
        typeSection.className = 'type-section';
        
        const typeHeader = document.createElement('div');
        typeHeader.className = 'type-header';
        typeHeader.innerHTML = `<h3>${type}</h3>`;
        
        const typeCards = document.createElement('div');
        typeCards.className = 'type-cards';
        
        // Filtrar y ordenar cartas del tipo
        const filteredCards = cardsByType[type]
            .filter(card => {
                const matchesSearch = card.name.toLowerCase().includes(searchTerm);
                const matchesRarity = rarityFilterValue === 'all' || card.rarity === rarityFilterValue;
                return matchesSearch && matchesRarity;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
        
        if (filteredCards.length === 0) return;
        
        filteredCards.forEach(card => {
            const isOwned = ownedCards.has(`${card.name}-${card.rarity}-${card.type}`);
            const cardElement = createCardElement(card, 0, isOwned);
            if (!isOwned) {
                cardElement.classList.add('missing');
                // Remover eventos de click para cartas no obtenidas
                cardElement.style.cursor = 'default';
                const sellBtn = cardElement.querySelector('.sell-btn');
                if (sellBtn) sellBtn.remove();
                const favoriteBtn = cardElement.querySelector('.favorite-btn');
                if (favoriteBtn) favoriteBtn.remove();
            }
            typeCards.appendChild(cardElement);
        });
        
        typeSection.appendChild(typeHeader);
        typeSection.appendChild(typeCards);
        collectionContainer.appendChild(typeSection);
    });
}

function updateFavorites() {
    const searchTerm = favoritesSearch.value.toLowerCase();
    const rarityFilterValue = favoritesRarityFilter.value;
    
    favoritesContainer.innerHTML = '';
    
    const favoriteCards = inventory.filter(card => 
        favorites.has(card.id) &&
        card.name.toLowerCase().includes(searchTerm) &&
        (rarityFilterValue === 'all' || card.rarity === rarityFilterValue)
    );
    
    if (favoriteCards.length === 0) {
        favoritesContainer.innerHTML = '<p class="empty-message">No tienes cartas favoritas todavía. ¡Haz clic en el corazón de una carta para añadirla a favoritos!</p>';
        return;
    }
    
    favoriteCards.forEach((card, index) => {
        const cardElement = createCardElement(card, index, true);
        favoritesContainer.appendChild(cardElement);
    });
}

function createCardElement(card, index, showActions = true) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    const cardPrice = card.price || basePrices[card.rarity];
    
    // Contar duplicados
    const duplicateCount = inventory.filter(c => 
        c.name === card.name && c.rarity === card.rarity && c.type === card.type
    ).length;
    
    let duplicateBadge = '';
    if (duplicateCount > 1 && showActions) {
        duplicateBadge = `<div class="card-duplicate-count">${duplicateCount}</div>`;
    }
    
    let favoriteBtn = '';
    if (showActions) {
        const isFavorited = isFavorite(card.id);
        favoriteBtn = `<button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-card-id="${card.id}">${isFavorited ? '❤️' : '🤍'}</button>`;
    }
    
    let actions = '';
    if (showActions) {
        actions = `<button class="sell-btn" data-index="${index}">Vender</button>`;
    }
    
    cardElement.innerHTML = `
        ${duplicateBadge}
        ${favoriteBtn}
        <div class="card-img ${card.rarity}">
            <img src="${card.image}" alt="${card.name}" class="card-image" onerror="handleImageError(this)">
        </div>
        <div class="card-name">${card.name}</div>
        <div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>
        <div class="card-type">${card.type || 'Sin tipo'}</div>
        <div class="card-price">${cardPrice} monedas</div>
        ${actions}
    `;
    
    // Event listeners
    if (showActions) {
        const sellBtn = cardElement.querySelector('.sell-btn');
        if (sellBtn) {
            sellBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showSellModal(card);
            });
        }
        
        const favoriteBtn = cardElement.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cardId = e.target.getAttribute('data-card-id');
                toggleFavorite(cardId);
            });
        }
    }
    
    cardElement.addEventListener('click', (e) => {
        if (!e.target.classList.contains('sell-btn') && !e.target.classList.contains('favorite-btn')) {
            showExpandedImage(card);
        }
    });
    
    return cardElement;
}

// Estadísticas
function updateInventoryStats() {
    const totalCards = inventory.length;
    const totalValue = inventory.reduce((sum, card) => sum + (card.price || basePrices[card.rarity]), 0);
    
    totalCardsElement.textContent = totalCards;
    totalValueElement.textContent = totalValue;
}

// Venta de cartas
function showSellModal(card) {
    currentSellCard = card;
    const cardPrice = card.price || basePrices[card.rarity];
    
    sellMessage.textContent = `¿Estás seguro de que quieres vender "${card.name}"?`;
    sellPriceElement.textContent = cardPrice;
    
    modalCardPreview.innerHTML = `
        <img src="${card.image}" alt="${card.name}" onerror="handleImageError(this)">
    `;
    
    sellModal.classList.add('active');
}

function confirmSell() {
    if (currentSellCard) {
        const cardPrice = currentSellCard.price || basePrices[currentSellCard.rarity];
        const cardIndex = inventory.findIndex(card => card.id === currentSellCard.id);
        
        if (cardIndex !== -1) {
            coins += cardPrice;
            coinsElement.textContent = coins;
            // Remover de favoritos si estaba
            if (favorites.has(currentSellCard.id)) {
                favorites.delete(currentSellCard.id);
            }
            inventory.splice(cardIndex, 1);
            saveData();
            updateInventory();
            updateFavorites();
            updateCollection();
            showNotification(`¡Has vendido ${currentSellCard.name} por ${cardPrice} monedas!`);
        }
        
        sellModal.classList.remove('active');
        currentSellCard = null;
    }
}

// Venta masiva
function sellAllNormalCards() {
    const normalCards = inventory.filter(card => card.rarity === 'normal');
    
    if (normalCards.length === 0) {
        showNotification('No tienes cartas normales para vender', 'error');
        return;
    }
    
    const totalValue = normalCards.reduce((sum, card) => sum + (card.price || basePrices.normal), 0);
    
    if (confirm(`¿Vender todas las ${normalCards.length} cartas normales por ${totalValue} monedas?`)) {
        // Remover de favoritos
        normalCards.forEach(card => {
            if (favorites.has(card.id)) {
                favorites.delete(card.id);
            }
        });
        
        inventory = inventory.filter(card => card.rarity !== 'normal');
        coins += totalValue;
        coinsElement.textContent = coins;
        saveData();
        updateInventory();
        updateFavorites();
        updateCollection();
        showNotification(`¡Has vendido ${normalCards.length} cartas normales por ${totalValue} monedas!`);
    }
}

function showSellDuplicatesModal() {
    const duplicates = findDuplicatesToSell();
    
    if (duplicates.length === 0) {
        showNotification('No tienes cartas repetidas para vender', 'error');
        return;
    }
    
    showSellDuplicatesModalContent(duplicates);
}

function findDuplicatesToSell() {
    const cardCount = {};
    const duplicates = [];
    
    inventory.forEach(card => {
        const key = `${card.name}-${card.rarity}-${card.type}`;
        if (!cardCount[key]) {
            cardCount[key] = {
                card: JSON.parse(JSON.stringify(card)),
                count: 0,
                instances: []
            };
        }
        cardCount[key].count++;
        cardCount[key].instances.push(card);
    });
    
    Object.values(cardCount).forEach(group => {
        if (group.count > 1) {
            duplicates.push({
                card: group.card,
                totalCount: group.count,
                sellCount: group.count - 1,
                instances: group.instances
            });
        }
    });
    
    currentDuplicates = duplicates;
    return duplicates;
}

function showSellDuplicatesModalContent(duplicates) {
    duplicatesList.innerHTML = '';
    let totalValue = 0;
    
    duplicates.forEach(dup => {
        const cardPrice = dup.card.price || basePrices[dup.card.rarity];
        const itemValue = cardPrice * dup.sellCount;
        totalValue += itemValue;
        
        const duplicateItem = document.createElement('div');
        duplicateItem.className = 'duplicate-item';
        duplicateItem.innerHTML = `
            <div class="duplicate-info">
                <div class="duplicate-name">${dup.card.name}</div>
                <div class="duplicate-count">Tienes ${dup.totalCount}, vender ${dup.sellCount}</div>
            </div>
            <div class="duplicate-controls">
                <input type="number" class="duplicate-quantity" value="${dup.sellCount}" min="1" max="${dup.totalCount - 1}">
                <div class="duplicate-total">${itemValue} monedas</div>
            </div>
        `;
        
        duplicatesList.appendChild(duplicateItem);
        
        const quantityInput = duplicateItem.querySelector('.duplicate-quantity');
        quantityInput.addEventListener('change', (e) => {
            const newQuantity = parseInt(e.target.value);
            if (newQuantity < 1) e.target.value = 1;
            if (newQuantity > dup.totalCount - 1) e.target.value = dup.totalCount - 1;
            
            dup.sellCount = parseInt(e.target.value);
            updateDuplicatesTotal();
        });
    });
    
    duplicatesTotal.textContent = totalValue;
    sellDuplicatesModal.classList.add('active');
}

function updateDuplicatesTotal() {
    let totalValue = 0;
    document.querySelectorAll('.duplicate-item').forEach(item => {
        const quantity = parseInt(item.querySelector('.duplicate-quantity').value);
        const cardName = item.querySelector('.duplicate-name').textContent;
        const dup = currentDuplicates.find(d => d.card.name === cardName);
        
        if (dup) {
            dup.sellCount = quantity;
            const cardPrice = dup.card.price || basePrices[dup.card.rarity];
            totalValue += cardPrice * quantity;
            item.querySelector('.duplicate-total').textContent = `${cardPrice * quantity} monedas`;
        }
    });
    
    duplicatesTotal.textContent = totalValue;
}

function confirmSellDuplicates() {
    const duplicates = currentDuplicates;
    let totalSold = 0;
    let totalValue = 0;
    
    duplicates.forEach(dup => {
        if (dup.sellCount > 0) {
            const cardsToSell = dup.instances.slice(0, dup.sellCount);
            const cardPrice = dup.card.price || basePrices[dup.card.rarity];
            
            cardsToSell.forEach(card => {
                const index = inventory.findIndex(c => c.id === card.id);
                if (index !== -1) {
                    // Remover de favoritos
                    if (favorites.has(card.id)) {
                        favorites.delete(card.id);
                    }
                    inventory.splice(index, 1);
                    totalSold++;
                    totalValue += cardPrice;
                }
            });
        }
    });
    
    coins += totalValue;
    coinsElement.textContent = coins;
    saveData();
    updateInventory();
    updateFavorites();
    updateCollection();
    showNotification(`¡Has vendido ${totalSold} cartas repetidas por ${totalValue} monedas!`);
    sellDuplicatesModal.classList.remove('active');
}

// Creador de cartas
function createCustomCard() {
    const name = cardNameInput.value.trim();
    const rarity = cardRaritySelect.value;
    const type = cardTypeInput.value.trim();
    const price = parseInt(cardPriceInput.value) || basePrices[rarity];
    const image = cardImageInput.value.trim();
    
    if (!name) {
        showNotification('Por favor, ingresa un nombre para la carta', 'error');
        return;
    }
    
    if (!image) {
        showNotification('Por favor, ingresa una URL de imagen para la carta', 'error');
        return;
    }
    
    if (price < 1) {
        showNotification('El precio debe ser mayor a 0', 'error');
        return;
    }
    
    const newCard = {
        name: name,
        image: image,
        price: price,
        type: type || ''
    };
    
    if (type && !allTypes.has(type)) {
        allTypes.add(type);
        updateTypeFilters();
    }
    
    customCards[rarity].push(newCard);
    
    saveData();
    
    cardNameInput.value = '';
    cardTypeInput.value = '';
    cardImageInput.value = '';
    cardPriceInput.value = basePrices[rarity];
    
    updateCustomCards();
    updateDatabase();
    updateCollection();
    
    showNotification('¡Carta creada exitosamente!');
}

function updateCustomCards() {
    customCardsContainer.innerHTML = '';
    
    const allCustomCards = [
        ...customCards.normal.map(card => ({...card, rarity: 'normal'})),
        ...customCards.premium.map(card => ({...card, rarity: 'premium'})),
        ...customCards.legendary.map(card => ({...card, rarity: 'legendary'}))
    ];
    
    if (allCustomCards.length === 0) {
        customCardsContainer.innerHTML = '<p class="empty-message">No has creado ninguna carta personalizada todavía.</p>';
        return;
    }
    
    allCustomCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        cardElement.innerHTML = `
            <div class="card-img ${card.rarity}">
                <img src="${card.image}" alt="${card.name}" class="card-image" onerror="handleImageError(this)">
            </div>
            <div class="card-name">${card.name}</div>
            <div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>
            <div class="card-type">${card.type || 'Sin tipo'}</div>
            <div class="card-price">Precio: ${card.price} monedas</div>
            <div class="card-actions">
                <button class="edit-card-btn" data-rarity="${card.rarity}" data-index="${getCardIndex(card, card.rarity)}">Editar</button>
                <button class="delete-card-btn" data-rarity="${card.rarity}" data-index="${getCardIndex(card, card.rarity)}">Eliminar</button>
            </div>
        `;
        
        customCardsContainer.appendChild(cardElement);
    });
    
    // Event listeners para editar y eliminar
    document.querySelectorAll('.edit-card-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const rarity = e.target.getAttribute('data-rarity');
            const index = parseInt(e.target.getAttribute('data-index'));
            editCustomCard(rarity, index);
        });
    });
    
    document.querySelectorAll('.delete-card-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const rarity = e.target.getAttribute('data-rarity');
            const index = parseInt(e.target.getAttribute('data-index'));
            deleteCustomCard(rarity, index);
        });
    });
}

function getCardIndex(card, rarity) {
    return customCards[rarity].findIndex(c => 
        c.name === card.name && c.image === card.image
    );
}

function editCustomCard(rarity, index) {
    const card = customCards[rarity][index];
    currentEditCard = card;
    currentEditRarity = rarity;
    currentEditIndex = index;
    
    editNameInput.value = card.name;
    editRaritySelect.value = rarity;
    editTypeInput.value = card.type || '';
    editPriceInput.value = card.price;
    editImageInput.value = card.image;
    
    editModal.classList.add('active');
}

function confirmEdit() {
    if (currentEditCard && currentEditRarity !== null && currentEditIndex !== null) {
        const newName = editNameInput.value.trim();
        const newRarity = editRaritySelect.value;
        const newType = editTypeInput.value.trim();
        const newPrice = parseInt(editPriceInput.value);
        const newImage = editImageInput.value.trim();
        
        if (!newName) {
            showNotification('El nombre no puede estar vacío', 'error');
            return;
        }
        
        if (!newImage) {
            showNotification('La URL de la imagen no puede estar vacía', 'error');
            return;
        }
        
        if (newPrice < 1) {
            showNotification('El precio debe ser mayor a 0', 'error');
            return;
        }
        
        const oldType = currentEditCard.type;
        
        currentEditCard.name = newName;
        currentEditCard.type = newType;
        currentEditCard.price = newPrice;
        currentEditCard.image = newImage;
        
        if (newType && !allTypes.has(newType)) {
            allTypes.add(newType);
            updateTypeFilters();
        }
        
        if (oldType && newType !== oldType) {
            let typeStillExists = false;
            Object.keys(customCards).forEach(r => {
                if (customCards[r].some(c => c.type === oldType)) {
                    typeStillExists = true;
                }
            });
            Object.keys(cardsData).forEach(r => {
                if (cardsData[r] && cardsData[r].some(c => c.type === oldType)) {
                    typeStillExists = true;
                }
            });
            
            if (!typeStillExists) {
                allTypes.delete(oldType);
                updateTypeFilters();
            }
        }
        
        if (newRarity !== currentEditRarity) {
            customCards[currentEditRarity].splice(currentEditIndex, 1);
            customCards[newRarity].push(currentEditCard);
        }
        
        saveData();
        updateCustomCards();
        updateDatabase();
        updateCollection();
        showNotification('Carta editada exitosamente');
        
        editModal.classList.remove('active');
        currentEditCard = null;
        currentEditRarity = null;
        currentEditIndex = null;
    }
}

function deleteCustomCard(rarity, index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta carta de la base de datos?')) {
        const card = customCards[rarity][index];
        const cardType = card.type;
        
        customCards[rarity].splice(index, 1);
        
        if (cardType) {
            let typeStillExists = false;
            Object.keys(customCards).forEach(r => {
                if (customCards[r].some(c => c.type === cardType)) {
                    typeStillExists = true;
                }
            });
            Object.keys(cardsData).forEach(r => {
                if (cardsData[r] && cardsData[r].some(c => c.type === cardType)) {
                    typeStillExists = true;
                }
            });
            
            if (!typeStillExists) {
                allTypes.delete(cardType);
                updateTypeFilters();
            }
        }
        
        saveData();
        updateCustomCards();
        updateDatabase();
        updateCollection();
        showNotification('Carta eliminada de la base de datos');
    }
}

// Base de datos
function updateDatabase() {
    const searchTerm = searchInput.value.toLowerCase();
    const rarityFilterValue = rarityFilter.value;
    const typeFilterValue = typeFilterDb.value;
    
    databaseContainer.innerHTML = '';
    
    const allCards = getAllCardsForDatabase();
    
    const counts = {
        normal: cardsData.normal ? cardsData.normal.length + customCards.normal.length : customCards.normal.length,
        premium: cardsData.premium ? cardsData.premium.length + customCards.premium.length : customCards.premium.length,
        legendary: cardsData.legendary ? cardsData.legendary.length + customCards.legendary.length : customCards.legendary.length
    };
    
    normalCountElement.textContent = counts.normal;
    premiumCountElement.textContent = counts.premium;
    legendaryCountElement.textContent = counts.legendary;
    
    if (allCards.length === 0) {
        databaseContainer.innerHTML = '<p class="empty-message">No hay cartas en la base de datos.</p>';
        return;
    }
    
    const filteredCards = allCards.filter(card => {
        const matchesSearch = card.name.toLowerCase().includes(searchTerm) || 
                             (card.type && card.type.toLowerCase().includes(searchTerm));
        const matchesRarity = rarityFilterValue === 'all' || card.rarity === rarityFilterValue;
        const matchesType = typeFilterValue === 'all' || card.type === typeFilterValue;
        return matchesSearch && matchesRarity && matchesType;
    });
    
    if (filteredCards.length === 0) {
        databaseContainer.innerHTML = '<p class="empty-message">No hay cartas que coincidan con tu búsqueda.</p>';
        return;
    }
    
    filteredCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'database-card';
        
        cardElement.innerHTML = `
            ${card.isCustom ? '<div class="price-badge">Personalizada</div>' : ''}
            <div class="card-img ${card.rarity}">
                <img src="${card.image}" alt="${card.name}" class="card-image" onerror="handleImageError(this)">
            </div>
            <div class="card-name">${card.name}</div>
            <div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>
            <div class="card-type">${card.type || 'Sin tipo'}</div>
            <div class="card-price">Precio: ${card.price} monedas</div>
            ${card.isCustom ? `
                <div class="card-actions">
                    <button class="edit-card-btn" data-rarity="${card.rarity}" data-name="${card.name}">Editar</button>
                    <button class="delete-card-btn" data-rarity="${card.rarity}" data-name="${card.name}">Eliminar</button>
                </div>
            ` : ''}
        `;
        
        databaseContainer.appendChild(cardElement);
    });
    
    // Event listeners para editar y eliminar
    document.querySelectorAll('.edit-card-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const rarity = e.target.getAttribute('data-rarity');
            const name = e.target.getAttribute('data-name');
            editCardFromDatabase(rarity, name);
        });
    });
    
    document.querySelectorAll('.delete-card-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const rarity = e.target.getAttribute('data-rarity');
            const name = e.target.getAttribute('data-name');
            deleteCardFromDatabase(rarity, name);
        });
    });
}

function editCardFromDatabase(rarity, name) {
    const index = customCards[rarity].findIndex(card => card.name === name);
    if (index !== -1) {
        editCustomCard(rarity, index);
    }
}

function deleteCardFromDatabase(rarity, name) {
    const index = customCards[rarity].findIndex(card => card.name === name);
    if (index !== -1) {
        deleteCustomCard(rarity, index);
    }
}

// Importación/Exportación
function exportDatabase() {
    const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        data: {
            customCards: customCards,
            inventory: inventory,
            coins: coins,
            favorites: Array.from(favorites)
        }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lootbox-database-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Base de datos exportada exitosamente');
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            showImportPreview(importData);
        } catch (error) {
            showNotification('Error: Archivo JSON inválido', 'error');
        }
    };
    reader.readAsText(file);
    
    event.target.value = '';
}

function showImportPreview(importData) {
    if (!importData.data || !importData.data.customCards) {
        showNotification('Error: Formato de archivo inválido', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>📥 Importar Base de Datos</h3>
            <div class="import-stats">
                <div class="import-stat">
                    <span class="count">${Object.values(importData.data.customCards).flat().length}</span>
                    <span class="label">Cartas Totales</span>
                </div>
                <div class="import-stat">
                    <span class="count">${importData.data.customCards.normal?.length || 0}</span>
                    <span class="label">Normales</span>
                </div>
                <div class="import-stat">
                    <span class="count">${importData.data.customCards.premium?.length || 0}</span>
                    <span class="label">Premium</span>
                </div>
                <div class="import-stat">
                    <span class="count">${importData.data.customCards.legendary?.length || 0}</span>
                    <span class="label">Legendarias</span>
                </div>
                <div class="import-stat">
                    <span class="count">${importData.data.inventory?.length || 0}</span>
                    <span class="label">En Inventario</span>
                </div>
                <div class="import-stat">
                    <span class="count">${importData.data.coins || 0}</span>
                    <span class="label">Monedas</span>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="modal-btn confirm" id="confirm-import">Importar</button>
                <button class="modal-btn cancel" id="cancel-import">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirm-import').addEventListener('click', () => {
        confirmImport(importData.data);
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancel-import').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

function confirmImport(importData) {
    const backup = {
        customCards: JSON.parse(JSON.stringify(customCards)),
        inventory: JSON.parse(JSON.stringify(inventory)),
        coins: coins,
        types: new Set(allTypes),
        favorites: new Set(favorites)
    };
    
    try {
        if (importData.customCards) {
            customCards = importData.customCards;
            
            Object.values(customCards).flat().forEach(card => {
                if (card.type) {
                    allTypes.add(card.type);
                }
            });
            updateTypeFilters();
        }
        
        if (importData.inventory && confirm('¿Deseas importar el inventario también? Esto reemplazará tu inventario actual.')) {
            inventory = importData.inventory;
        }
        
        if (importData.coins && confirm('¿Deseas importar las monedas? Esto reemplazará tu cantidad actual de monedas.')) {
            coins = importData.coins;
            coinsElement.textContent = coins;
        }
        
        if (importData.favorites && confirm('¿Deseas importar los favoritos? Esto reemplazará tus favoritos actuales.')) {
            favorites = new Set(importData.favorites);
        }
        
        saveData();
        updateInventory();
        updateFavorites();
        updateCustomCards();
        updateDatabase();
        updateCollection();
        
        showNotification('Base de datos importada exitosamente');
        
    } catch (error) {
        customCards = backup.customCards;
        inventory = backup.inventory;
        coins = backup.coins;
        allTypes = backup.types;
        favorites = backup.favorites;
        coinsElement.textContent = coins;
        updateTypeFilters();
        
        showNotification('Error durante la importación. Se restauró la copia de seguridad.', 'error');
    }
}

function resetDatabase() {
    if (confirm('⚠️ ¿ESTÁS SEGURO? Esto eliminará TODAS tus cartas personalizadas y no se puede deshacer.')) {
        if (confirm('¿Realmente estás seguro? Se perderán todas las cartas que hayas creado.')) {
            customCards = {
                normal: [],
                premium: [],
                legendary: []
            };
            
            allTypes.clear();
            Object.keys(cardsData).forEach(rarity => {
                cardsData[rarity].forEach(card => {
                    if (card.type) {
                        allTypes.add(card.type);
                    }
                });
            });
            
            saveData();
            updateCustomCards();
            updateDatabase();
            updateCollection();
            updateTypeFilters();
            
            showNotification('Base de datos reseteada exitosamente');
        }
    }
}

// Utilidades
function showExpandedImage(card) {
    expandedImage.src = card.image;
    expandedCardName.textContent = card.name;
    expandedCardRarity.innerHTML = `<div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>`;
    expandedCardType.textContent = `Tipo: ${card.type || 'Sin tipo'}`;
    expandedCardPrice.textContent = `Precio: ${card.price || basePrices[card.rarity]} monedas`;
    
    imageModal.classList.add('active');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function handleImageError(img) {
    img.onerror = null;
    img.src = 'https://via.placeholder.com/300x400/333/fff?text=Imagen+no+disponible';
}

// Inicialización
function initGame() {
    loadSavedData();
    loadCards().then(() => {
        updateInventory();
        updateCollection();
        updateFavorites();
        updateCustomCards();
        updateDatabase();
    });
    
    setupEventListeners();
}

function setupEventListeners() {
    // Navegación
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
            
            if (targetSection === 'inventory') {
                updateInventory();
            } else if (targetSection === 'collection') {
                updateCollection();
            } else if (targetSection === 'favorites') {
                updateFavorites();
            } else if (targetSection === 'creator') {
                updateCustomCards();
            } else if (targetSection === 'database') {
                updateDatabase();
            }
        });
    });

    // Lootboxes
    openButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lootboxType = button.getAttribute('data-type');
            openLootbox(lootboxType);
        });
    });

    // Búsquedas
    inventorySearch.addEventListener('input', updateInventory);
    inventoryRarityFilter.addEventListener('change', updateInventory);
    collectionSearch.addEventListener('input', updateCollection);
    collectionRarityFilter.addEventListener('change', updateCollection);
    favoritesSearch.addEventListener('input', updateFavorites);
    favoritesRarityFilter.addEventListener('change', updateFavorites);
    searchInput.addEventListener('input', updateDatabase);
    searchBtn.addEventListener('click', updateDatabase);
    rarityFilter.addEventListener('change', updateDatabase);
    typeFilterDb.addEventListener('change', updateDatabase);

    // Botones de acción
    sellAllNormalBtn.addEventListener('click', sellAllNormalCards);
    sellAllDuplicatesBtn.addEventListener('click', showSellDuplicatesModal);
    exportBtn.addEventListener('click', exportDatabase);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', handleFileImport);
    resetBtn.addEventListener('click', resetDatabase);

    // Creador de cartas
    cardRaritySelect.addEventListener('change', () => {
        const rarity = cardRaritySelect.value;
        cardPriceInput.value = basePrices[rarity];
    });
    createCardBtn.addEventListener('click', createCustomCard);

    // Modales
    confirmSellBtn.addEventListener('click', confirmSell);
    cancelSellBtn.addEventListener('click', () => sellModal.classList.remove('active'));
    confirmEditBtn.addEventListener('click', confirmEdit);
    cancelEditBtn.addEventListener('click', () => editModal.classList.remove('active'));
    confirmSellDuplicatesBtn.addEventListener('click', confirmSellDuplicates);
    cancelSellDuplicatesBtn.addEventListener('click', () => sellDuplicatesModal.classList.remove('active'));

    // Animación de apertura
    quickSellBtn.addEventListener('click', quickSellCard);
    quickKeepBtn.addEventListener('click', quickKeepCard);

    // Imagen expandida
    closeImageModal.addEventListener('click', () => imageModal.classList.remove('active'));
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.classList.remove('active');
        }
    });
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', initGame);

let coins = 1000;
let inventory = [];
let customCards = {
    normal: [],
    premium: [],
    legendary: []
};
let cardsData = {};
let allTypes = new Set();

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

const coinsElement = document.getElementById('coins');
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const openButtons = document.querySelectorAll('.open-btn');
const cardsContainer = document.getElementById('cards-container');
const openingAnimation = document.getElementById('opening-animation');
const cardReveal = document.getElementById('card-reveal');
const quickSellBtn = document.getElementById('quick-sell-btn');
const quickKeepBtn = document.getElementById('quick-keep-btn');
const cardNameInput = document.getElementById('card-name');
const cardRaritySelect = document.getElementById('card-rarity');
const cardTypeInput = document.getElementById('card-type');
const cardPriceInput = document.getElementById('card-price');
const cardImageInput = document.getElementById('card-image');
const createCardBtn = document.getElementById('create-card-btn');
const customCardsContainer = document.getElementById('custom-cards-container');
const searchInput = document.getElementById('search-cards');
const searchBtn = document.getElementById('search-btn');
const rarityFilter = document.getElementById('rarity-filter');
const typeFilterDb = document.getElementById('type-filter-db');
const typeFilter = document.getElementById('type-filter');
const databaseContainer = document.getElementById('database-container');
const normalCountElement = document.getElementById('normal-count');
const premiumCountElement = document.getElementById('premium-count');
const legendaryCountElement = document.getElementById('legendary-count');
const sellModal = document.getElementById('sell-modal');
const sellMessage = document.getElementById('sell-message');
const modalCardPreview = document.getElementById('modal-card-preview');
const sellPriceElement = document.getElementById('sell-price');
const confirmSellBtn = document.getElementById('confirm-sell');
const cancelSellBtn = document.getElementById('cancel-sell');
const totalCardsElement = document.getElementById('total-cards');
const totalValueElement = document.getElementById('total-value');
const sellAllNormalBtn = document.getElementById('sell-all-normal');
const sellAllDuplicatesBtn = document.getElementById('sell-all-duplicates');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const resetBtn = document.getElementById('reset-btn');
const imageModal = document.getElementById('image-modal');
const expandedImage = document.getElementById('expanded-image');
const expandedCardName = document.getElementById('expanded-card-name');
const expandedCardRarity = document.getElementById('expanded-card-rarity');
const expandedCardType = document.getElementById('expanded-card-type');
const expandedCardPrice = document.getElementById('expanded-card-price');
const closeImageModal = document.getElementById('close-image-modal');
const editModal = document.getElementById('edit-modal');
const editNameInput = document.getElementById('edit-name');
const editRaritySelect = document.getElementById('edit-rarity');
const editTypeInput = document.getElementById('edit-type');
const editPriceInput = document.getElementById('edit-price');
const editImageInput = document.getElementById('edit-image');
const confirmEditBtn = document.getElementById('confirm-edit');
const cancelEditBtn = document.getElementById('cancel-edit');
const sellDuplicatesModal = document.getElementById('sell-duplicates-modal');
const duplicatesList = document.getElementById('duplicates-list');
const duplicatesTotal = document.getElementById('duplicates-total');
const confirmSellDuplicatesBtn = document.getElementById('confirm-sell-duplicates');
const cancelSellDuplicatesBtn = document.getElementById('cancel-sell-duplicates');
const typeSuggestions = document.getElementById('type-suggestions');
const editTypeSuggestions = document.getElementById('edit-type-suggestions');

let currentSellCard = null;
let currentOpenedCard = null;
let currentEditCard = null;
let currentEditRarity = null;
let currentEditIndex = null;

function loadSavedData() {
    const savedCoins = localStorage.getItem('lootboxCoins');
    const savedInventory = localStorage.getItem('lootboxInventory');
    const savedCustomCards = localStorage.getItem('lootboxCustomCards');
    const savedTypes = localStorage.getItem('lootboxTypes');
    
    if (savedCoins) coins = parseInt(savedCoins);
    if (savedInventory) inventory = JSON.parse(savedInventory);
    if (savedCustomCards) customCards = JSON.parse(savedCustomCards);
    if (savedTypes) allTypes = new Set(JSON.parse(savedTypes));
    
    coinsElement.textContent = coins;
    updateInventoryStats();
    updateTypeFilters();
}

function saveData() {
    localStorage.setItem('lootboxCoins', coins.toString());
    localStorage.setItem('lootboxInventory', JSON.stringify(inventory));
    localStorage.setItem('lootboxCustomCards', JSON.stringify(customCards));
    localStorage.setItem('lootboxTypes', JSON.stringify(Array.from(allTypes)));
}

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
    typeFilter.innerHTML = '<option value="all">Todos los tipos</option>';
    typeFilterDb.innerHTML = '<option value="all">Todos los tipos</option>';
    typeSuggestions.innerHTML = '';
    editTypeSuggestions.innerHTML = '';
    
    allTypes.forEach(type => {
        typeFilter.innerHTML += `<option value="${type}">${type}</option>`;
        typeFilterDb.innerHTML += `<option value="${type}">${type}</option>`;
        typeSuggestions.innerHTML += `<option value="${type}">`;
        editTypeSuggestions.innerHTML += `<option value="${type}">`;
    });
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
                isCustom: customCards[rarity].includes(card)
            });
        });
    });
    
    return databaseCards;
}

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
        } else if (targetSection === 'creator') {
            updateCustomCards();
        } else if (targetSection === 'database') {
            updateDatabase();
        }
    });
});

openButtons.forEach(button => {
    button.addEventListener('click', () => {
        const lootboxType = button.getAttribute('data-type');
        openLootbox(lootboxType);
    });
});

function openLootbox(type) {
    if (coins < prices[type]) {
        showNotification('No tienes suficientes monedas para abrir esta lootbox', 'error');
        return;
    }
    
    coins -= prices[type];
    coinsElement.textContent = coins;
    
    const rarity = getRandomRarity(type);
    const card = getRandomCard(rarity);
    
    // Crear una NUEVA instancia de la carta, no reutilizar la referencia
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
    // ID más único que incluya timestamp y random
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
    // Devolver una COPIA, no la referencia original
    return JSON.parse(JSON.stringify({
        ...randomCard,
        id: generateCardId()
    }));
}

function getDuplicateCardInfo(newCard) {
    let total = 0;
    const types = new Set();
    
    inventory.forEach(card => {
        // Cartas con mismo nombre y rareza
        if (card.name === newCard.name && card.rarity === newCard.rarity) {
            total++;
            if (card.type) {
                types.add(card.type);
            }
        }
    });
    
    return {
        total: total,
        variants: types.size > 0 ? types.size : 1
    };
}

function showOpeningAnimation(card, rarity) {
    cardReveal.className = 'card-reveal';
    cardReveal.classList.add(rarity);
    
    // Obtener información de duplicados
    const duplicateInfo = getDuplicateCardInfo(card);
    
    const img = document.createElement('img');
    img.src = card.image;
    img.alt = card.name;
    img.className = 'revealed-card-image';
    img.onerror = function() {
        this.src = 'https://via.placeholder.com/300x400/333/fff?text=Imagen+no+disponible';
    };
    
    // Crear badge de cantidad con más información
    let countBadge = '';
    if (duplicateInfo.total > 0) {
        if (duplicateInfo.variants > 1) {
            countBadge = `
                <div class="opening-duplicate-count multiple-variants">
                    <div class="duplicate-main">Ya tienes ${duplicateInfo.total}</div>
                    <div class="duplicate-sub">en ${duplicateInfo.variants} tipos</div>
                </div>
            `;
        } else {
            countBadge = `
                <div class="opening-duplicate-count">
                    Ya tienes ${duplicateInfo.total}
                </div>
            `;
        }
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
        // Considerar cartas iguales si tienen mismo nombre, rareza y tipo
        if (card.name === newCard.name && 
            card.rarity === newCard.rarity && 
            card.type === newCard.type) {
            count++;
        }
    });
    
    return count;
}

quickSellBtn.addEventListener('click', () => {
    if (currentOpenedCard) {
        const cardPrice = currentOpenedCard.price || basePrices[currentOpenedCard.rarity];
        coins += cardPrice;
        coinsElement.textContent = coins;
        saveData();
        updateInventoryStats();
        showNotification(`¡Has vendido ${currentOpenedCard.name} por ${cardPrice} monedas!`);
        closeOpeningAnimation();
    }
});

quickKeepBtn.addEventListener('click', () => {
    if (currentOpenedCard) {
        inventory.push(currentOpenedCard);
        saveData();
        updateInventory();
        showNotification(`¡Has guardado ${currentOpenedCard.name} en tu inventario!`);
        closeOpeningAnimation();
    }
});

function closeOpeningAnimation() {
    openingAnimation.classList.remove('active');
    cardReveal.classList.remove('active');
    currentOpenedCard = null;
}

function updateInventoryStats() {
    const totalCards = inventory.length;
    const totalValue = inventory.reduce((sum, card) => sum + (card.price || basePrices[card.rarity]), 0);
    
    totalCardsElement.textContent = totalCards;
    totalValueElement.textContent = totalValue;
}

function getCardGroups() {
    const groups = {};
    inventory.forEach((card, index) => {
        // Usar el ID único de cada carta en lugar de nombre+rareza+tipo
        const key = card.id || `${card.name}-${card.rarity}-${card.type}-${index}`;
        if (!groups[key]) {
            groups[key] = {
                card: JSON.parse(JSON.stringify(card)),
                count: 1,
                instances: [card],
                displayKey: `${card.name}-${card.rarity}` // Solo para agrupar visualmente
            };
        } else {
            groups[key].count++;
            groups[key].instances.push(card);
        }
    });
    
    // Agrupar por displayKey para la vista
    const displayGroups = {};
    Object.values(groups).forEach(group => {
        const displayKey = group.displayKey;
        if (!displayGroups[displayKey]) {
            displayGroups[displayKey] = {
                card: group.card,
                totalCount: 0,
                variants: []
            };
        }
        displayGroups[displayKey].totalCount += group.count;
        displayGroups[displayKey].variants.push(group);
    });
    
    return displayGroups;
}

function updateInventory() {
    cardsContainer.innerHTML = '';
    
    if (inventory.length === 0) {
        cardsContainer.innerHTML = '<p>No tienes cartas. ¡Abre algunas lootboxes!</p>';
        updateInventoryStats();
        return;
    }
    
    const selectedType = typeFilter.value;
    const cardGroups = getCardGroups();
    
    Object.values(cardGroups).forEach(displayGroup => {
        // Filtrar por tipo si está seleccionado
        if (selectedType !== 'all') {
            const hasMatchingType = displayGroup.variants.some(variant => 
                variant.card.type === selectedType
            );
            if (!hasMatchingType) return;
        }
        
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        const cardPrice = displayGroup.card.price || basePrices[displayGroup.card.rarity];
        
        let duplicateBadge = '';
        if (displayGroup.totalCount > 1) {
            duplicateBadge = `<div class="card-duplicate-count">${displayGroup.totalCount}</div>`;
        }
        
        // Mostrar información de variantes si hay diferentes tipos
        let typeInfo = '';
        if (displayGroup.variants.length > 1) {
            const types = displayGroup.variants.map(v => v.card.type || 'Sin tipo').join(', ');
            typeInfo = `<div class="card-variants">Tipos: ${types}</div>`;
        }
        
        cardElement.innerHTML = `
            ${duplicateBadge}
            <div class="card-img ${displayGroup.card.rarity}">
                <img src="${displayGroup.card.image}" alt="${displayGroup.card.name}" class="card-image" onerror="handleImageError(this)">
            </div>
            <div class="card-name">${displayGroup.card.name}</div>
            <div class="card-rarity rarity-${displayGroup.card.rarity}">${displayGroup.card.rarity}</div>
            <div class="card-type">${displayGroup.card.type || 'Sin tipo'}</div>
            ${typeInfo}
            <div class="card-price">Precio: ${cardPrice} monedas</div>
            <button class="sell-btn" data-display-key="${displayGroup.variants[0].displayKey}">Vender 1</button>
            ${displayGroup.totalCount > 1 ? `<button class="sell-all-variant-btn" data-display-key="${displayGroup.variants[0].displayKey}">Vender Todas (${displayGroup.totalCount})</button>` : ''}
        `;
        
        cardsContainer.appendChild(cardElement);
    });
    
    // Event listeners para vender individualmente
    document.querySelectorAll('.sell-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const displayKey = e.target.getAttribute('data-display-key');
            const group = cardGroups[displayKey];
            if (group.variants.length === 1 && group.totalCount === 1) {
                showSellModal(group.variants[0].instances[0]);
            } else {
                showSellVariantModal(group);
            }
        });
    });
    
    
    // Event listeners para vender todas las variantes
    document.querySelectorAll('.sell-all-variant-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const displayKey = e.target.getAttribute('data-display-key');
            const group = cardGroups[displayKey];
            showSellAllVariantsModal(group);
        });
    });
    
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('sell-btn') && !e.target.classList.contains('sell-all-variant-btn')) {
                const displayKey = card.querySelector('.sell-btn').getAttribute('data-display-key');
                const group = cardGroups[displayKey];
                showExpandedImage(group.card);
            }
        });
    });
    
    updateInventoryStats();
}

function showSellAllVariantsModal(group) {
    const totalValue = group.variants.reduce((sum, variant) => {
        const cardPrice = variant.card.price || basePrices[variant.card.rarity];
        return sum + (cardPrice * variant.count);
    }, 0);
    
    if (confirm(`¿Vender todas las ${group.totalCount} cartas de "${group.card.name}" por ${totalValue} monedas?`)) {
        // Eliminar todas las instancias de todas las variantes
        group.variants.forEach(variant => {
            variant.instances.forEach(card => {
                const index = inventory.findIndex(c => c.id === card.id);
                if (index !== -1) {
                    inventory.splice(index, 1);
                }
            });
        });
        
        coins += totalValue;
        coinsElement.textContent = coins;
        saveData();
        updateInventory();
        showNotification(`¡Has vendido ${group.totalCount} cartas por ${totalValue} monedas!`);
    }
}

function showSellVariantModal(group) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Seleccionar Carta para Vender</h3>
            <p>${group.card.name} tiene ${group.totalCount} cartas con diferentes tipos:</p>
            <div class="variants-list">
                ${group.variants.map(variant => `
                    <div class="variant-item">
                        <div class="variant-info">
                            <strong>Tipo:</strong> ${variant.card.type || 'Sin tipo'}
                            <span class="variant-count">(${variant.count} disponibles)</span>
                        </div>
                        <button class="sell-variant-btn" data-variant-index="${group.variants.indexOf(variant)}">
                            Vender 1 por ${variant.card.price || basePrices[variant.card.rarity]} monedas
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="modal-actions">
                <button class="modal-btn cancel" id="cancel-sell-variant">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners para cada variante
    modal.querySelectorAll('.sell-variant-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const variantIndex = parseInt(e.target.getAttribute('data-variant-index'));
            const variant = group.variants[variantIndex];
            if (variant.instances.length > 0) {
                showSellModal(variant.instances[0]);
                document.body.removeChild(modal);
            }
        });
    });
    
    document.getElementById('cancel-sell-variant').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

function showSellOneModal(group) {
    // Usar la primera instancia REAL, no la copia del grupo
    const realCard = group.instances[0];
    const cardPrice = realCard.price || basePrices[realCard.rarity];
    
    sellMessage.textContent = `¿Vender 1 de ${group.count} "${realCard.name}"?`;
    sellPriceElement.textContent = cardPrice;
    
    modalCardPreview.innerHTML = `
        <img src="${realCard.image}" alt="${realCard.name}" onerror="handleImageError(this)">
    `;
    
    // Guardar la referencia REAL para la venta
    currentSellCard = realCard;
    
    sellModal.classList.add('active');
}

// Función para crear copias profundas de objetos
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function showExpandedImage(card) {
    expandedImage.src = card.image;
    expandedCardName.textContent = card.name;
    expandedCardRarity.innerHTML = `<div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>`;
    expandedCardType.textContent = `Tipo: ${card.type || 'Sin tipo'}`;
    expandedCardPrice.textContent = `Precio: ${card.price || basePrices[card.rarity]} monedas`;
    
    imageModal.classList.add('active');
}

closeImageModal.addEventListener('click', () => {
    imageModal.classList.remove('active');
});

imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
        imageModal.classList.remove('active');
    }
});

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

confirmSellBtn.addEventListener('click', () => {
    if (currentSellCard) {
        const cardPrice = currentSellCard.price || basePrices[currentSellCard.rarity];
        const cardIndex = inventory.findIndex(card => card.id === currentSellCard.id);
        
        if (cardIndex !== -1) {
            coins += cardPrice;
            coinsElement.textContent = coins;
            inventory.splice(cardIndex, 1);
            saveData();
            updateInventory();
            updateInventoryStats();
            showNotification(`¡Has vendido ${currentSellCard.name} por ${cardPrice} monedas!`);
        }
        
        sellModal.classList.remove('active');
        currentSellCard = null;
    }
});

cancelSellBtn.addEventListener('click', () => {
    sellModal.classList.remove('active');
    currentSellCard = null;
});

sellAllNormalBtn.addEventListener('click', () => {
    const normalCards = inventory.filter(card => card.rarity === 'normal');
    
    if (normalCards.length === 0) {
        showNotification('No tienes cartas normales para vender', 'error');
        return;
    }
    
    const totalValue = normalCards.reduce((sum, card) => sum + (card.price || basePrices.normal), 0);
    
    if (confirm(`¿Vender todas las ${normalCards.length} cartas normales por ${totalValue} monedas?`)) {
        inventory = inventory.filter(card => card.rarity !== 'normal');
        coins += totalValue;
        coinsElement.textContent = coins;
        saveData();
        updateInventory();
        showNotification(`¡Has vendido ${normalCards.length} cartas normales por ${totalValue} monedas!`);
    }
});

sellAllDuplicatesBtn.addEventListener('click', () => {
    const duplicates = findDuplicatesToSell();
    
    if (duplicates.length === 0) {
        showNotification('No tienes cartas repetidas para vender', 'error');
        return;
    }
    
    showSellDuplicatesModal(duplicates);
});

function findDuplicatesToSell() {
    const cardCount = {};
    const duplicates = [];
    
    inventory.forEach(card => {
        const key = `${card.name}-${card.rarity}-${card.type}`;
        if (!cardCount[key]) {
            cardCount[key] = {
                card: JSON.parse(JSON.stringify(card)), // Copia profunda
                count: 0,
                instances: []
            };
        }
        cardCount[key].count++;
        cardCount[key].instances.push(card); // Referencia real
    });
    
    Object.values(cardCount).forEach(group => {
        if (group.count > 1) {
            duplicates.push({
                card: group.card, // Esta es la copia
                totalCount: group.count,
                sellCount: group.count - 1,
                instances: group.instances // Estas son las referencias reales
            });
        }
    });
    
    currentDuplicates = duplicates;
    return duplicates;
}

function showSellDuplicatesModal(duplicates) {
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

let currentDuplicates = [];

confirmSellDuplicatesBtn.addEventListener('click', () => {
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
    showNotification(`¡Has vendido ${totalSold} cartas repetidas por ${totalValue} monedas!`);
    sellDuplicatesModal.classList.remove('active');
});

cancelSellDuplicatesBtn.addEventListener('click', () => {
    sellDuplicatesModal.classList.remove('active');
});

function updateCustomCards() {
    customCardsContainer.innerHTML = '';
    
    const allCustomCards = [
        ...customCards.normal.map(card => ({...card, rarity: 'normal'})),
        ...customCards.premium.map(card => ({...card, rarity: 'premium'})),
        ...customCards.legendary.map(card => ({...card, rarity: 'legendary'}))
    ];
    
    if (allCustomCards.length === 0) {
        customCardsContainer.innerHTML = '<p>No has creado ninguna carta personalizada todavía.</p>';
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
    // Crear una copia de la carta para editar, no usar la referencia directa
    const card = deepClone(customCards[rarity][index]);
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

confirmEditBtn.addEventListener('click', () => {
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
        
        // Obtener la carta ORIGINAL para comparar
        const originalCard = customCards[currentEditRarity][currentEditIndex];
        const oldType = originalCard.type;
        
        // Actualizar la carta ORIGINAL con los nuevos valores
        originalCard.name = newName;
        originalCard.type = newType;
        originalCard.price = newPrice;
        originalCard.image = newImage;
        
        if (newType && !allTypes.has(newType)) {
            allTypes.add(newType);
            updateTypeFilters();
        }
        
        if (oldType && newType !== oldType) {
            let typeStillExists = false;
            Object.keys(customCards).forEach(rarity => {
                if (customCards[rarity].some(card => card.type === oldType)) {
                    typeStillExists = true;
                }
            });
            Object.keys(cardsData).forEach(rarity => {
                if (cardsData[rarity] && cardsData[rarity].some(card => card.type === oldType)) {
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
        showNotification('Carta editada exitosamente');
        
        editModal.classList.remove('active');
        currentEditCard = null;
        currentEditRarity = null;
        currentEditIndex = null;
    }
});

cancelEditBtn.addEventListener('click', () => {
    editModal.classList.remove('active');
    currentEditCard = null;
    currentEditRarity = null;
    currentEditIndex = null;
});

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
        showNotification('Carta eliminada de la base de datos');
    }
}

createCardBtn.addEventListener('click', () => {
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
        type: type || '',
        id: generateCardId() // ID único para cada carta
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
    
    showNotification('¡Carta creada exitosamente!');
});

function updateDatabase() {
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
        databaseContainer.innerHTML = '<p>No hay cartas en la base de datos.</p>';
        return;
    }
    
    const searchTerm = searchInput.value.toLowerCase();
    const rarityFilterValue = rarityFilter.value;
    const typeFilterValue = typeFilterDb.value;
    
    const filteredCards = allCards.filter(card => {
        const matchesSearch = card.name.toLowerCase().includes(searchTerm) || 
                             (card.type && card.type.toLowerCase().includes(searchTerm));
        const matchesRarity = rarityFilterValue === 'all' || card.rarity === rarityFilterValue;
        const matchesType = typeFilterValue === 'all' || card.type === typeFilterValue;
        return matchesSearch && matchesRarity && matchesType;
    });
    
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

searchBtn.addEventListener('click', updateDatabase);
searchInput.addEventListener('input', updateDatabase);
rarityFilter.addEventListener('change', updateDatabase);
typeFilterDb.addEventListener('change', updateDatabase);
typeFilter.addEventListener('change', updateInventory);

exportBtn.addEventListener('click', exportDatabase);
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', handleFileImport);
resetBtn.addEventListener('click', resetDatabase);

function exportDatabase() {
    const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        data: {
            customCards: customCards,
            inventory: inventory,
            coins: coins
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
    modal.className = 'modal import-modal active';
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
            
            <div class="import-preview">
                <h4>Vista previa de cartas:</h4>
                ${generateImportPreview(importData.data.customCards)}
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

function generateImportPreview(customCards) {
    let previewHTML = '';
    const allCards = [
        ...(customCards.normal || []).map(card => ({...card, rarity: 'normal'})),
        ...(customCards.premium || []).map(card => ({...card, rarity: 'premium'})),
        ...(customCards.legendary || []).map(card => ({...card, rarity: 'legendary'}))
    ].slice(0, 10);
    
    if (allCards.length === 0) {
        return '<p>No hay cartas para mostrar</p>';
    }
    
    allCards.forEach(card => {
        previewHTML += `
            <div class="preview-card ${card.rarity}">
                <img src="${card.image}" alt="${card.name}" onerror="this.src='https://via.placeholder.com/50x65/333/fff?text=?'">
                <div class="preview-card-info">
                    <div class="preview-card-name">${card.name}</div>
                    <div class="preview-card-rarity rarity-${card.rarity}">${card.rarity}</div>
                    <div class="preview-card-type">${card.type || 'Sin tipo'}</div>
                    <div class="preview-card-price">${card.price} monedas</div>
                </div>
            </div>
        `;
    });
    
    if (Object.values(customCards).flat().length > 10) {
        previewHTML += `<p style="text-align: center; margin-top: 10px;">... y ${Object.values(customCards).flat().length - 10} cartas más</p>`;
    }
    
    return previewHTML;
}

function confirmImport(importData) {
    const backup = {
        customCards: JSON.parse(JSON.stringify(customCards)),
        inventory: JSON.parse(JSON.stringify(inventory)),
        coins: coins,
        types: new Set(allTypes)
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
        
        saveData();
        updateInventory();
        updateCustomCards();
        updateDatabase();
        
        showNotification('Base de datos importada exitosamente');
        
    } catch (error) {
        customCards = backup.customCards;
        inventory = backup.inventory;
        coins = backup.coins;
        allTypes = backup.types;
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
            updateTypeFilters();
            
            showNotification('Base de datos reseteada exitosamente');
        }
    }
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

function initGame() {
    loadSavedData();
    loadCards().then(() => {
        updateInventory();
        updateCustomCards();
        updateDatabase();
    });
    
    cardRaritySelect.addEventListener('change', () => {
        const rarity = cardRaritySelect.value;
        cardPriceInput.value = basePrices[rarity];
    });
}

document.addEventListener('DOMContentLoaded', initGame);

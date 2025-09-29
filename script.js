let coins = 1000;
let inventory = [];
let customCards = {
    normal: [],
    premium: [],
    legendary: []
};
let cardsData = {};

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
const cardPriceInput = document.getElementById('card-price');
const cardImageInput = document.getElementById('card-image');
const cardDescriptionInput = document.getElementById('card-description');
const createCardBtn = document.getElementById('create-card-btn');
const customCardsContainer = document.getElementById('custom-cards-container');
const searchInput = document.getElementById('search-cards');
const searchBtn = document.getElementById('search-btn');
const rarityFilter = document.getElementById('rarity-filter');
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
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const resetBtn = document.getElementById('reset-btn');
const imageModal = document.getElementById('image-modal');
const expandedImage = document.getElementById('expanded-image');
const expandedCardName = document.getElementById('expanded-card-name');
const expandedCardRarity = document.getElementById('expanded-card-rarity');
const expandedCardPrice = document.getElementById('expanded-card-price');
const expandedCardDescription = document.getElementById('expanded-card-description');
const closeImageModal = document.getElementById('close-image-modal');

let currentSellCard = null;
let currentOpenedCard = null;

function loadSavedData() {
    const savedCoins = localStorage.getItem('lootboxCoins');
    const savedInventory = localStorage.getItem('lootboxInventory');
    const savedCustomCards = localStorage.getItem('lootboxCustomCards');
    
    if (savedCoins) coins = parseInt(savedCoins);
    if (savedInventory) inventory = JSON.parse(savedInventory);
    if (savedCustomCards) customCards = JSON.parse(savedCustomCards);
    
    coinsElement.textContent = coins;
    updateInventoryStats();
}

function saveData() {
    localStorage.setItem('lootboxCoins', coins.toString());
    localStorage.setItem('lootboxInventory', JSON.stringify(inventory));
    localStorage.setItem('lootboxCustomCards', JSON.stringify(customCards));
}

async function loadCards() {
    try {
        const response = await fetch('cartas.json');
        cardsData = await response.json();
        addBasePricesToCards();
    } catch (error) {
        console.error('Error cargando las cartas:', error);
        cardsData = {
            normal: [
                { name: "Guerrero Básico", image: "images/guerrero-basico.jpg", price: 25 },
                { name: "Mago Novato", image: "images/mago-novato.jpg", price: 25 }
            ],
            premium: [
                { name: "Caballero Élite", image: "images/caballero-elite.jpg", price: 75 },
                { name: "Mago Arcano", image: "images/mago-arcano.jpg", price: 75 }
            ],
            legendary: [
                { name: "Dragón Ancestral", image: "images/dragon-ancestral.jpg", price: 150 },
                { name: "Fénix", image: "images/fenix.jpg", price: 150 }
            ]
        };
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
    
    currentOpenedCard = {
        ...card,
        rarity: rarity,
        id: generateCardId()
    };
    
    saveData();
    updateInventoryStats();
    
    showOpeningAnimation(currentOpenedCard, rarity);
}

function generateCardId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
            id: generateCardId()
        };
    }
    
    const randomCard = cardList[Math.floor(Math.random() * cardList.length)];
    return {
        ...randomCard,
        id: generateCardId()
    };
}

function showOpeningAnimation(card, rarity) {
    cardReveal.className = 'card-reveal';
    cardReveal.classList.add(rarity);
    
    const img = document.createElement('img');
    img.src = card.image;
    img.alt = card.name;
    img.className = 'revealed-card-image';
    img.onerror = function() {
        this.src = 'https://via.placeholder.com/300x400/333/fff?text=Imagen+no+disponible';
    };
    
    cardReveal.innerHTML = '';
    cardReveal.appendChild(img);
    
    openingAnimation.classList.add('active');
    
    setTimeout(() => {
        cardReveal.classList.add('active');
    }, 300);
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

function updateInventory() {
    cardsContainer.innerHTML = '';
    
    if (inventory.length === 0) {
        cardsContainer.innerHTML = '<p>No tienes cartas. ¡Abre algunas lootboxes!</p>';
        updateInventoryStats();
        return;
    }
    
    inventory.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        const cardPrice = card.price || basePrices[card.rarity];
        
        cardElement.innerHTML = `
            <div class="card-img ${card.rarity}">
                <img src="${card.image}" alt="${card.name}" class="card-image" onerror="handleImageError(this)">
            </div>
            <div class="card-name">${card.name}</div>
            <div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>
            <div class="card-price">Precio: ${cardPrice} monedas</div>
            ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
            <button class="sell-btn" data-index="${index}">Vender</button>
        `;
        
        cardsContainer.appendChild(cardElement);
    });
    
    document.querySelectorAll('.sell-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(e.target.getAttribute('data-index'));
            showSellModal(index);
        });
    });
    
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('sell-btn')) {
                const index = parseInt(card.querySelector('.sell-btn').getAttribute('data-index'));
                showExpandedImage(inventory[index]);
            }
        });
    });
    
    updateInventoryStats();
}

function showExpandedImage(card) {
    expandedImage.src = card.image;
    expandedCardName.textContent = card.name;
    expandedCardRarity.innerHTML = `<div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>`;
    expandedCardPrice.textContent = `Precio: ${card.price || basePrices[card.rarity]} monedas`;
    expandedCardDescription.textContent = card.description || 'Sin descripción';
    
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

function showSellModal(index) {
    currentSellCard = inventory[index];
    const cardPrice = currentSellCard.price || basePrices[currentSellCard.rarity];
    
    sellMessage.textContent = `¿Estás seguro de que quieres vender "${currentSellCard.name}"?`;
    sellPriceElement.textContent = cardPrice;
    
    modalCardPreview.innerHTML = `
        <img src="${currentSellCard.image}" alt="${currentSellCard.name}" onerror="handleImageError(this)">
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
            <div class="card-price">Precio: ${card.price} monedas</div>
            ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
            <button class="delete-card-btn" data-rarity="${card.rarity}" data-index="${getCardIndex(card, card.rarity)}">Eliminar</button>
        `;
        
        customCardsContainer.appendChild(cardElement);
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

function deleteCustomCard(rarity, index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta carta de la base de datos?')) {
        customCards[rarity].splice(index, 1);
        saveData();
        updateCustomCards();
        updateDatabase();
        showNotification('Carta eliminada de la base de datos');
    }
}

createCardBtn.addEventListener('click', () => {
    const name = cardNameInput.value.trim();
    const rarity = cardRaritySelect.value;
    const price = parseInt(cardPriceInput.value) || basePrices[rarity];
    const image = cardImageInput.value.trim();
    const description = cardDescriptionInput.value.trim();
    
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
        description: description || ''
    };
    
    customCards[rarity].push(newCard);
    
    saveData();
    
    cardNameInput.value = '';
    cardImageInput.value = '';
    cardDescriptionInput.value = '';
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
    
    const filteredCards = allCards.filter(card => {
        const matchesSearch = card.name.toLowerCase().includes(searchTerm) || 
                             (card.description && card.description.toLowerCase().includes(searchTerm));
        const matchesRarity = rarityFilterValue === 'all' || card.rarity === rarityFilterValue;
        return matchesSearch && matchesRarity;
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
            <div class="card-price">Precio: ${card.price} monedas</div>
            ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
            ${card.isCustom ? `<button class="delete-db-btn" data-rarity="${card.rarity}" data-name="${card.name}">Eliminar</button>` : ''}
        `;
        
        databaseContainer.appendChild(cardElement);
    });
    
    document.querySelectorAll('.delete-db-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const rarity = e.target.getAttribute('data-rarity');
            const name = e.target.getAttribute('data-name');
            deleteCardFromDatabase(rarity, name);
        });
    });
}

function deleteCardFromDatabase(rarity, name) {
    if (confirm('¿Estás seguro de que quieres eliminar esta carta de la base de datos?')) {
        const index = customCards[rarity].findIndex(card => card.name === name);
        if (index !== -1) {
            customCards[rarity].splice(index, 1);
            saveData();
            updateDatabase();
            updateCustomCards();
            showNotification('Carta eliminada de la base de datos');
        }
    }
}

searchBtn.addEventListener('click', updateDatabase);
searchInput.addEventListener('input', updateDatabase);
rarityFilter.addEventListener('change', updateDatabase);

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
        coins: coins
    };
    
    try {
        if (importData.customCards) {
            customCards = importData.customCards;
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
        coinsElement.textContent = coins;
        
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
            
            saveData();
            updateCustomCards();
            updateDatabase();
            
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

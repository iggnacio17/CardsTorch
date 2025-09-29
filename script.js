// Datos del juego
let coins = 1000;
let inventory = [];
let customCards = {
    normal: [],
    premium: [],
    legendary: []
};
let cardsData = {};

// Precios base por rareza
const basePrices = {
    normal: 25,
    premium: 75,
    legendary: 150
};

// Precios de las lootboxes
const prices = {
    normal: 0,
    premium: 500,
    legendary: 1500
};

// Probabilidades de cartas por tipo de lootbox (80% normal, 15% premium, 5% legendary)
const probabilities = {
    normal: { normal: 0.8, premium: 0.15, legendary: 0.05 },
    premium: { normal: 0.8, premium: 0.15, legendary: 0.05 },
    legendary: { normal: 0.8, premium: 0.15, legendary: 0.05 }
};

// Elementos DOM
const coinsElement = document.getElementById('coins');
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const openButtons = document.querySelectorAll('.open-btn');
const cardsContainer = document.getElementById('cards-container');
const openingAnimation = document.getElementById('opening-animation');
const cardReveal = document.getElementById('card-reveal');

// Elementos del creador de cartas
const cardNameInput = document.getElementById('card-name');
const cardRaritySelect = document.getElementById('card-rarity');
const cardPriceInput = document.getElementById('card-price');
const cardImageInput = document.getElementById('card-image');
const cardDescriptionInput = document.getElementById('card-description');
const createCardBtn = document.getElementById('create-card-btn');
const customCardsContainer = document.getElementById('custom-cards-container');

// Elementos de la base de datos
const searchInput = document.getElementById('search-cards');
const searchBtn = document.getElementById('search-btn');
const rarityFilter = document.getElementById('rarity-filter');
const databaseContainer = document.getElementById('database-container');
const normalCountElement = document.getElementById('normal-count');
const premiumCountElement = document.getElementById('premium-count');
const legendaryCountElement = document.getElementById('legendary-count');

// Elementos del modal de venta
const sellModal = document.getElementById('sell-modal');
const sellMessage = document.getElementById('sell-message');
const modalCardPreview = document.getElementById('modal-card-preview');
const sellPriceElement = document.getElementById('sell-price');
const confirmSellBtn = document.getElementById('confirm-sell');
const cancelSellBtn = document.getElementById('cancel-sell');

// Estadísticas del inventario
const totalCardsElement = document.getElementById('total-cards');
const totalValueElement = document.getElementById('total-value');

// Variables temporales
let currentSellCard = null;

// Cargar datos guardados
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

// Guardar datos
function saveData() {
    localStorage.setItem('lootboxCoins', coins.toString());
    localStorage.setItem('lootboxInventory', JSON.stringify(inventory));
    localStorage.setItem('lootboxCustomCards', JSON.stringify(customCards));
}

// Cargar cartas desde el archivo JSON
async function loadCards() {
    try {
        const response = await fetch('cartas.json');
        cardsData = await response.json();
        // Añadir precios base a las cartas predeterminadas
        addBasePricesToCards();
        console.log('Cartas cargadas:', cardsData);
    } catch (error) {
        console.error('Error cargando las cartas:', error);
        // Datos de ejemplo en caso de error
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

// Añadir precios base a las cartas predeterminadas
function addBasePricesToCards() {
    Object.keys(cardsData).forEach(rarity => {
        cardsData[rarity].forEach(card => {
            if (!card.price) {
                card.price = basePrices[rarity];
            }
        });
    });
}

// Combinar cartas predeterminadas con cartas personalizadas
function getAllCards() {
    const allCards = {
        normal: [...(cardsData.normal || []), ...customCards.normal],
        premium: [...(cardsData.premium || []), ...customCards.premium],
        legendary: [...(cardsData.legendary || []), ...customCards.legendary]
    };
    return allCards;
}

// Obtener todas las cartas para la base de datos
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

// Navegación entre secciones
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetSection = button.getAttribute('data-section');
        
        // Actualizar botones activos
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Mostrar sección correspondiente
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
        
        // Actualizar secciones específicas
        if (targetSection === 'inventory') {
            updateInventory();
        } else if (targetSection === 'creator') {
            updateCustomCards();
        } else if (targetSection === 'database') {
            updateDatabase();
        }
    });
});

// Abrir lootboxes
openButtons.forEach(button => {
    button.addEventListener('click', () => {
        const lootboxType = button.getAttribute('data-type');
        openLootbox(lootboxType);
    });
});

// Función para abrir una lootbox
function openLootbox(type) {
    // Verificar si hay suficientes monedas
    if (coins < prices[type]) {
        showNotification('No tienes suficientes monedas para abrir esta lootbox', 'error');
        return;
    }
    
    // Restar monedas
    coins -= prices[type];
    coinsElement.textContent = coins;
    
    // Obtener una carta aleatoria según las probabilidades
    const rarity = getRandomRarity(type);
    const card = getRandomCard(rarity);
    
    // Añadir carta al inventario
    inventory.push({
        ...card,
        rarity: rarity,
        id: generateCardId()
    });
    
    // Guardar datos
    saveData();
    updateInventoryStats();
    
    // Mostrar animación de apertura
    showOpeningAnimation(card, rarity);
}

// Generar ID único para carta
function generateCardId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Obtener rareza aleatoria según probabilidades (80% normal, 15% premium, 5% legendary)
function getRandomRarity(lootboxType) {
    const prob = probabilities[lootboxType];
    const rand = Math.random();
    
    if (rand < prob.normal) return 'normal';
    if (rand < prob.normal + prob.premium) return 'premium';
    return 'legendary';
}

// Obtener carta aleatoria de una rareza
function getRandomCard(rarity) {
    const allCards = getAllCards();
    const cardList = allCards[rarity];
    
    if (!cardList || cardList.length === 0) {
        // Carta por defecto en caso de error
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

// Mostrar animación de apertura
function showOpeningAnimation(card, rarity) {
    // Configurar la carta revelada
    cardReveal.className = 'card-reveal';
    cardReveal.classList.add(rarity);
    
    // Crear elemento de imagen
    const img = document.createElement('img');
    img.src = card.image;
    img.alt = card.name;
    img.className = 'revealed-card-image';
    
    // Limpiar contenido anterior y añadir la imagen
    cardReveal.innerHTML = '';
    cardReveal.appendChild(img);
    
    // Mostrar animación
    openingAnimation.classList.add('active');
    
    // Después de un tiempo, mostrar la carta
    setTimeout(() => {
        cardReveal.classList.add('active');
    }, 300);
    
    // Ocultar animación después de 3 segundos
    setTimeout(() => {
        openingAnimation.classList.remove('active');
        cardReveal.classList.remove('active');
        
        // Mostrar notificación
        showNotification(`¡Has obtenido: ${card.name} (${rarity})!`);
    }, 3000);
}

// Actualizar estadísticas del inventario
function updateInventoryStats() {
    const totalCards = inventory.length;
    const totalValue = inventory.reduce((sum, card) => sum + (card.price || basePrices[card.rarity]), 0);
    
    totalCardsElement.textContent = totalCards;
    totalValueElement.textContent = totalValue;
}

// Actualizar inventario
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
                <img src="${card.image}" alt="${card.name}" class="card-image">
            </div>
            <div class="card-name">${card.name}</div>
            <div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>
            <div class="card-price">Precio: ${cardPrice} monedas</div>
            ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
            <button class="sell-btn" data-index="${index}">Vender</button>
        `;
        
        cardsContainer.appendChild(cardElement);
    });
    
    // Añadir event listeners a los botones de vender
    document.querySelectorAll('.sell-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            showSellModal(index);
        });
    });
    
    updateInventoryStats();
}

// Mostrar modal de venta
function showSellModal(index) {
    currentSellCard = inventory[index];
    const cardPrice = currentSellCard.price || basePrices[currentSellCard.rarity];
    
    sellMessage.textContent = `¿Estás seguro de que quieres vender "${currentSellCard.name}"?`;
    sellPriceElement.textContent = cardPrice;
    
    modalCardPreview.innerHTML = `
        <img src="${currentSellCard.image}" alt="${currentSellCard.name}">
    `;
    
    sellModal.classList.add('active');
}

// Confirmar venta
confirmSellBtn.addEventListener('click', () => {
    if (currentSellCard) {
        const cardPrice = currentSellCard.price || basePrices[currentSellCard.rarity];
        const cardIndex = inventory.findIndex(card => card.id === currentSellCard.id);
        
        if (cardIndex !== -1) {
            // Añadir monedas
            coins += cardPrice;
            coinsElement.textContent = coins;
            
            // Eliminar carta del inventario
            inventory.splice(cardIndex, 1);
            
            // Guardar datos
            saveData();
            
            // Actualizar vistas
            updateInventory();
            updateInventoryStats();
            
            // Mostrar notificación
            showNotification(`¡Has vendido ${currentSellCard.name} por ${cardPrice} monedas!`);
        }
        
        sellModal.classList.remove('active');
        currentSellCard = null;
    }
});

// Cancelar venta
cancelSellBtn.addEventListener('click', () => {
    sellModal.classList.remove('active');
    currentSellCard = null;
});

// Actualizar cartas personalizadas
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
                <img src="${card.image}" alt="${card.name}" class="card-image">
            </div>
            <div class="card-name">${card.name}</div>
            <div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>
            <div class="card-price">Precio: ${card.price} monedas</div>
            ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
            <button class="delete-card-btn" data-rarity="${card.rarity}" data-index="${getCardIndex(card, card.rarity)}">Eliminar</button>
        `;
        
        customCardsContainer.appendChild(cardElement);
    });
    
    // Añadir event listeners a los botones de eliminar
    document.querySelectorAll('.delete-card-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const rarity = e.target.getAttribute('data-rarity');
            const index = parseInt(e.target.getAttribute('data-index'));
            deleteCustomCard(rarity, index);
        });
    });
}

// Obtener índice de carta en el array
function getCardIndex(card, rarity) {
    return customCards[rarity].findIndex(c => 
        c.name === card.name && c.image === card.image
    );
}

// Eliminar carta personalizada
function deleteCustomCard(rarity, index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta carta de la base de datos?')) {
        customCards[rarity].splice(index, 1);
        saveData();
        updateCustomCards();
        updateDatabase();
        showNotification('Carta eliminada de la base de datos');
    }
}

// Crear nueva carta personalizada
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
    
    // Crear nueva carta
    const newCard = {
        name: name,
        image: image,
        price: price,
        description: description || ''
    };
    
    // Añadir a las cartas personalizadas
    customCards[rarity].push(newCard);
    
    // Guardar datos
    saveData();
    
    // Limpiar formulario
    cardNameInput.value = '';
    cardImageInput.value = '';
    cardDescriptionInput.value = '';
    cardPriceInput.value = basePrices[rarity];
    
    // Actualizar vistas
    updateCustomCards();
    updateDatabase();
    
    showNotification('¡Carta creada exitosamente!');
});

// Actualizar base de datos
function updateDatabase() {
    databaseContainer.innerHTML = '';
    const allCards = getAllCardsForDatabase();
    
    // Actualizar estadísticas
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
    
    // Aplicar filtros
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
                <img src="${card.image}" alt="${card.name}" class="card-image">
            </div>
            <div class="card-name">${card.name}</div>
            <div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>
            <div class="card-price">Precio: ${card.price} monedas</div>
            ${card.description ? `<div class="card-description">${card.description}</div>` : ''}
            ${card.isCustom ? `<button class="delete-db-btn" data-rarity="${card.rarity}" data-name="${card.name}">Eliminar</button>` : ''}
        `;
        
        databaseContainer.appendChild(cardElement);
    });
    
    // Añadir event listeners a los botones de eliminar
    document.querySelectorAll('.delete-db-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const rarity = e.target.getAttribute('data-rarity');
            const name = e.target.getAttribute('data-name');
            deleteCardFromDatabase(rarity, name);
        });
    });
}

// Eliminar carta de la base de datos
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

// Buscar cartas
searchBtn.addEventListener('click', updateDatabase);
searchInput.addEventListener('input', updateDatabase);
rarityFilter.addEventListener('change', updateDatabase);

// Mostrar notificación
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

// Inicializar el juego
function initGame() {
    loadSavedData();
    loadCards().then(() => {
        updateInventory();
        updateCustomCards();
        updateDatabase();
    });
    
    // Configurar precios base en el formulario
    cardRaritySelect.addEventListener('change', () => {
        const rarity = cardRaritySelect.value;
        cardPriceInput.value = basePrices[rarity];
    });
}

// Iniciar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', initGame);

// Añadir después de las variables existentes
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const resetBtn = document.getElementById('reset-btn');

// Añadir después de los event listeners existentes
exportBtn.addEventListener('click', exportDatabase);
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', handleFileImport);
resetBtn.addEventListener('click', resetDatabase);

// Función para exportar la base de datos
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

// Función para manejar la importación de archivos
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
            console.error('Error parsing JSON:', error);
        }
    };
    reader.readAsText(file);
    
    // Resetear el input de archivo
    event.target.value = '';
}

// Función para mostrar preview de importación
function showImportPreview(importData) {
    // Validar estructura básica
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
    
    // Event listeners para los botones del modal
    document.getElementById('confirm-import').addEventListener('click', () => {
        confirmImport(importData.data);
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancel-import').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Generar vista previa de cartas para importación
function generateImportPreview(customCards) {
    let previewHTML = '';
    const allCards = [
        ...(customCards.normal || []).map(card => ({...card, rarity: 'normal'})),
        ...(customCards.premium || []).map(card => ({...card, rarity: 'premium'})),
        ...(customCards.legendary || []).map(card => ({...card, rarity: 'legendary'}))
    ].slice(0, 10); // Mostrar solo las primeras 10 cartas
    
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

// Confirmar importación
function confirmImport(importData) {
    // Backup de datos actuales por si hay error
    const backup = {
        customCards: JSON.parse(JSON.stringify(customCards)),
        inventory: JSON.parse(JSON.stringify(inventory)),
        coins: coins
    };
    
    try {
        // Importar cartas personalizadas
        if (importData.customCards) {
            customCards = importData.customCards;
        }
        
        // Importar inventario (opcional)
        if (importData.inventory && confirm('¿Deseas importar el inventario también? Esto reemplazará tu inventario actual.')) {
            inventory = importData.inventory;
        }
        
        // Importar monedas (opcional)
        if (importData.coins && confirm('¿Deseas importar las monedas? Esto reemplazará tu cantidad actual de monedas.')) {
            coins = importData.coins;
            coinsElement.textContent = coins;
        }
        
        // Guardar datos
        saveData();
        
        // Actualizar todas las vistas
        updateInventory();
        updateCustomCards();
        updateDatabase();
        
        showNotification('Base de datos importada exitosamente');
        
    } catch (error) {
        // Restaurar backup en caso de error
        customCards = backup.customCards;
        inventory = backup.inventory;
        coins = backup.coins;
        coinsElement.textContent = coins;
        
        showNotification('Error durante la importación. Se restauró la copia de seguridad.', 'error');
        console.error('Import error:', error);
    }
}

// Función para resetear la base de datos
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

// Añadir esta función auxiliar para manejar errores de imágenes
function handleImageError(img) {
    img.onerror = null;
    img.src = 'https://via.placeholder.com/300x400/333/fff?text=Imagen+no+disponible';
}
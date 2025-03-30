document.addEventListener('DOMContentLoaded', () => {
    const dataList = document.getElementById('data-list');
    const searchInput = document.getElementById('search');
    const apiButtons = document.querySelectorAll('.api-btn');
    let currentApi = 'berry';

    // API endpoints
    const apiEndpoints = {
        berry: 'https://pokeapi.co/api/v2/berry/',
        pokemon: 'https://pokeapi.co/api/v2/pokemon/'
    };

    // Initialize
    fetchAllData(apiEndpoints[currentApi]);
    setupApiSelector();
    setupSearch();

    // Fetch all data from API
    async function fetchAllData(url) {
        try {
            showLoading();
            let allResults = [];
            let nextUrl = url;
            
            while (nextUrl) {
                const response = await fetch(nextUrl);
                const data = await response.json();
                allResults = [...allResults, ...data.results];
                nextUrl = data.next;
            }
            
            displayData(allResults);
            hideLoading();
        } catch (error) {
            console.error('Error fetching data:', error);
            hideLoading();
        }
    }

    function showLoading() {
        const loading = document.createElement('div');
        loading.className = 'loading';
        
        // Add Pokéball animation
        const pokeball = document.createElement('div');
        pokeball.className = 'pokeball-loading';
        loading.appendChild(pokeball);
        
        dataList.innerHTML = '';
        dataList.appendChild(loading);
    }

    function hideLoading() {
        const loading = document.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }

    // Display data in the grid
    function displayData(items) {
        dataList.innerHTML = items.map(item => {
            const isPokemon = currentApi === 'pokemon';
            const imageUrl = isPokemon ? 
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.url.split('/')[6]}.png` : 
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/berries/${item.name}-berry.png`;
            
            return `
                <div class="data-card" data-url="${item.url}">
                    <img src="${imageUrl}" alt="${item.name}" class="item-image">
                    <div class="data-name">${item.name}</div>
                </div>
            `;
        }).join('');
        
        // Add click event listeners to all cards
        document.querySelectorAll('.data-card').forEach(card => {
            card.addEventListener('click', () => {
                fetchItemDetails(card.dataset.url);
            });
        });
    }

    // Setup API selector
    function setupApiSelector() {
        apiButtons.forEach(button => {
            button.addEventListener('click', () => {
                apiButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentApi = button.dataset.api;
                fetchAllData(apiEndpoints[currentApi]);
            });
        });
    }

    // Setup search functionality
    function setupSearch() {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.data-card');
            cards.forEach(card => {
                const name = card.querySelector('.data-name').textContent.toLowerCase();
                card.style.display = name.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }

    // Fetch detailed item information
    async function fetchItemDetails(url) {
        try {
            const response = await fetch(url);
            const item = await response.json();
            showItemDetails(item);
        } catch (error) {
            console.error('Error fetching item details:', error);
        }
    }

    // Show detailed item information
    function showItemDetails(item) {
        let detailsContent;
        if (currentApi === 'berry') {
            const flavors = item.flavors.map(flavor => `
                <div class="flavor-item">
                    <span>${flavor.flavor.name}</span>
                    <span>${flavor.potency}</span>
                </div>
            `).join('');
            
            detailsContent = `
                <h2>${item.name}</h2>
                <div class="details-grid">
                    <div>ID:</div><div>${item.id}</div>
                    <div>Growth Time:</div><div>${item.growth_time} hours</div>
                    <div>Max Harvest:</div><div>${item.max_harvest}</div>
                    <div>Flavors:</div>
                    <div class="flavors-list">${flavors}</div>
                </div>
            `;
        } else {
            const types = item.types.map(type => `
                <div class="type-item">${type.type.name}</div>
            `).join('');
            
            detailsContent = `
                <h2>${item.name}</h2>
                <div class="details-grid">
                    <div>ID:</div><div>${item.id}</div>
                    <div>Height:</div><div>${item.height / 10} m</div>
                    <div>Weight:</div><div>${item.weight / 10} kg</div>
                    <div>Types:</div>
                    <div class="types-list">${types}</div>
                </div>
            `;
        }

        const details = `
            <div class="berry-details">
                <button class="close-btn">&times;</button>
                ${detailsContent}
            </div>
        `;

        // Create or update details container
        let detailsContainer = document.querySelector('.details-container');
        if (!detailsContainer) {
            detailsContainer = document.createElement('div');
            detailsContainer.className = 'details-container';
            document.body.appendChild(detailsContainer);
        }
        detailsContainer.innerHTML = details;

        // Add close functionality
        const closeBtn = detailsContainer.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            detailsContainer.remove();
        });

        // Close when clicking outside the modal
        detailsContainer.addEventListener('click', (e) => {
            if (e.target === detailsContainer) {
                detailsContainer.remove();
            }
        });
    }
}); 
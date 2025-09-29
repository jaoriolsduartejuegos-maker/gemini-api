// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    // ... (todo el código anterior de manejo de pestañas es el mismo) ...
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const newTabButton = document.getElementById('newTabButton');
    const saveButton = document.getElementById('saveButton');
    const tabsContainer = document.getElementById('tabs');
    const contentArea = document.getElementById('content-area');

    let tabs = [];
    let activeTabId = null;
    let tabCounter = 0;

    // --- FUNCIONES DE MANEJO DE PESTAÑAS (SIN CAMBIOS) ---
    function createNewTab() {
        tabCounter++;
        const tabId = `tab-${tabCounter}`;
        const newTab = { id: tabId, title: `Ejercicio ${tabCounter}`, content: '' };
        tabs.push(newTab);
        renderTabs();
        setActiveTab(tabId);
    }
    function setActiveTab(tabId) {
        activeTabId = tabId;
        const activeTabData = tabs.find(tab => tab.id === tabId);
        if (activeTabData) {
            contentArea.innerHTML = activeTabData.content || '<p>Introduce una pregunta para empezar...</p>';
        }
        renderTabs();
    }
    function renderTabs() {
        tabsContainer.innerHTML = '';
        tabs.forEach(tab => {
            const tabElement = document.createElement('div');
            tabElement.className = 'tab' + (tab.id === activeTabId ? ' active' : '');
            tabElement.dataset.tabId = tab.id;
            tabElement.innerHTML = `${tab.title} <span class="close-tab">x</span>`;
            
            tabElement.querySelector('.close-tab').addEventListener('click', (e) => {
                e.stopPropagation();
                closeTab(tab.id);
            });
            tabElement.addEventListener('click', () => setActiveTab(tab.id));
            tabsContainer.appendChild(tabElement);
        });
    }
    function closeTab(tabId) {
        tabs = tabs.filter(tab => tab.id !== tabId);
        if (activeTabId === tabId) {
            activeTabId = tabs.length > 0 ? tabs[0].id : null;
            if (!activeTabId) createNewTab();
            else setActiveTab(activeTabId);
        }
        renderTabs();
    }
    
    // --- FUNCIÓN DE BÚSQUEDA Y LLAMADA A LA API (LA PARTE MODIFICADA) ---

    async function handleSearch() {
        const query = searchInput.value.trim();
        if (!query || !activeTabId) return;

        const activeTab = tabs.find(tab => tab.id === activeTabId);
        if (!activeTab) return;

        contentArea.innerHTML = '<p>Generando respuesta... ⏳</p>';
        
        try {
            // ¡ESTA ES LA LLAMADA REAL A NUESTRO BACKEND EN VERCEL!
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: query }),
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.statusText}`);
            }

            const data = await response.json();
            const formattedResponse = data.text; // El texto HTML que nos devuelve nuestro backend

            activeTab.content = formattedResponse;
            activeTab.title = query.substring(0, 15) + '...';
            
            renderTabs();
            contentArea.innerHTML = activeTab.content;

        } catch (error) {
            contentArea.innerHTML = `<p style="color: red;">Error al contactar con la IA. Por favor, inténtalo de nuevo.</p>`;
            console.error("Error:", error);
        }
    }

    // --- FUNCIÓN PARA GUARDAR (SIN CAMBIOS) ---
    function saveContentToFile() {
        const activeTab = tabs.find(tab => tab.id === activeTabId);
        if (!activeTab || !activeTab.content) {
            alert("No hay contenido que guardar.");
            return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = activeTab.content;
        const plainText = tempDiv.textContent || tempDiv.innerText || "";

        const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${activeTab.title.replace(/\./g, '')}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    
    // --- ASIGNACIÓN DE EVENTOS (SIN CAMBIOS) ---
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') handleSearch();
    });
    newTabButton.addEventListener('click', createNewTab);
    saveButton.addEventListener('click', saveContentToFile);

    // --- INICIALIZACIÓN (SIN CAMBIOS) ---
    createNewTab();
});
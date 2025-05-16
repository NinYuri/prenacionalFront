document.addEventListener("DOMContentLoaded", () => {
  initializeMenu();
});

/* ========================================== MENÚ ========================================== */
async function initializeMenu() {
  try {
      // Cargar disciplinas desde la API
      const disciplines = await fetchDisciplines();
      
      // Procesar y mostrar en el menu
      disciplinesMenu(disciplines);

      // Configurar interactividad
      setupMenuInteractions();
  } 
  catch(error) {
      handleMenuError(error);
  }
}

/* ============================= funciones principales ============================= */
// Procesar y mostrar disciplinas
function disciplinesMenu(disciplines) {
  const menuContainer = document.querySelector('.subdiscipline');
  const uniqueDisciplines = getUniqueDisciplines(disciplines);

  menuContainer.innerHTML = uniqueDisciplines
      .map(discipline => createDisciplineItem(discipline))
      .join('');
}

// Configurar eventos del menú
function setupMenuInteractions() {
  setupSubmenus('.navigation > li');
  setupSubmenus('.subdiscipline > li');
  setupSubmenus('.options > li');
}

/* ============================= funciones auxiliares ============================= */
// Filtrar disciplinas únicas por nombre
function getUniqueDisciplines(disciplines) {
  const seen = new Set();
  return disciplines.filter(discipline => {
      const normalized = discipline.nombre.toLowerCase().trim();
      return seen.has(normalized) ? false : seen.add(normalized);
  });
}

// Crear elemento HTML para una disciplina
function createDisciplineItem(discipline) {
  const name = discipline.nombre.toUpperCase();
  let ruta = '#';

  if(name === 'BÁSQUETBOL')
    ruta = './discBasquet.html';
  else if(name === 'VOLEIBOL')
    ruta = './discVolley.html';
  else if(name === 'FÚTBOL')
    ruta = './discFutbol.html';

  return `
  <li data-discipline-id="${discipline.id_diciplinas}" 
      data-category="${discipline.categoria}">
      <a href="${ruta}" class="menu-link">
          ${name}
      </a>
  </li>
  `;
}

// Configurar submenús
function setupSubmenus(selector) {
  document.querySelectorAll(selector).forEach(item => {
      const submenu = item.querySelector('ul');
      if (!submenu) return;

      let hoverTimeout;

      // Abrir con hover
      item.addEventListener('mouseenter', () => {
          if(!item.classList.contains('pinned')) {
              clearTimeout(hoverTimeout);
              handleSubmenuHover(item);
          }
      });

      // Cerrar submenú al salir
      item.addEventListener('mouseleave', () => {
          if(!item.classList.contains('pinned')) {
              hoverTimeout = setTimeout(() => closeSubmenu(item), 300);
          }
      });

      submenu.addEventListener('mouseenter', () => clearTimeout(hoverTimeout));
      submenu.addEventListener('mouseleave', () => {
          if (!item.classList.contains('pinned'))
              closeSubmenu(item);        
      });

      // Abrir / cerrar con click
      const link = item.querySelector('a');
      if(link) {
          link.addEventListener('click', (e) => {
              if(!submenu) return;
              e.preventDefault();
              const isPinned = item.classList.contains('pinned');

              submenu.querySelectorAll('a').forEach(link => {
                  link.addEventListener('click', () => {
                      closeAllSubmenus(); // Cierra menú al seleccionar opción
                  });
              });

              // Cerrar los demás submenús
              document.querySelectorAll(selector).forEach(otherItem => {
                  otherItem.classList.remove('pinned', 'active');
              });

              if(!isPinned)
                  item.classList.add('pinned', 'active');
              else
                  item.classList.remove('pinned', 'active');
          });
      }
  });

  document.addEventListener('click', (e) => {
      const clickedInsideMenu = e.target.closest('li');
      if(!clickedInsideMenu)
          closeAllSubmenus();
  });
}

// Manejar hover
function handleSubmenuHover(menuItem) {
  closeSiblingSubmenus(menuItem);
  menuItem.classList.add('active');
}

// Cerrar submenú
function closeSubmenu(menuItem) {
  menuItem.classList.remove('active');
}

// Cerrar otros submenús del mismo nivel
function closeSiblingSubmenus(currentItem) {
  const parentList = currentItem.closest('ul');
  if (parentList) {
      parentList.querySelectorAll('li').forEach(item => {
          if (item !== currentItem)
              item.classList.remove('active');            
      });
  }
}

// Cerrar al hacer click fuera de él
function closeAllSubmenus() {
  document.querySelectorAll('li.active, li.pinned').forEach(item => {
      item.classList.remove('active', 'pinned');
  });
}

// Manejo de errores
function handleMenuError(error) {
  console.error('Error en el menú:', error);
  document.querySelector('.subdiscience').innerHTML = `
      <li class="error-message">
          <ion-icon name="warning-outline"></ion-icon>
          Error cargando disciplinas
      </li>
  `;
}

/* ========================================== FETCH ========================================== */
async function fetchDisciplines() {
  try {
      const response = await fetch('http://localhost:3000/api/disciplinas');
      if(!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      return response.json();
  } catch(error) {
      console.error('Error obteniendo disciplinas:', error);
      return [];
  }
}
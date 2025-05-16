/* ========================================== VARIABLES / CARGA DE PÁGINA  ========================================== */
const form = document.querySelector('.login-form');
const user = document.getElementById("user");
const password = { 
  input: document.getElementById('pass'), 
  icon: document.querySelector('.icon-lock') 
};

document.addEventListener("DOMContentLoaded", () => {
  initializeMenu();
});

/* ========================================== MÉTODOS ========================================== */
// Visibilidad de contraseñas
const visibility = () => {
    password.icon.addEventListener("click", () => {
        if (password.input.type === "password") {
            password.input.type = "text";
            password.icon.innerHTML = '<ion-icon name="lock-open"></ion-icon>';
        } else {
            password.input.type = "password";
            password.icon.innerHTML = '<ion-icon name="lock-closed"></ion-icon>';
        }
    });
};

// Animación de input
function inputValidacion(inputElement) {
  inputElement.addEventListener("input", () => {
      if (inputElement.value.trim() !== "")
          inputElement.classList.add("valid");
      else
          inputElement.classList.remove("valid");      
  });
}

// Validación
form.addEventListener('submit', async e=>{
  e.preventDefault();

  if(user.value.length === 0 || user.value.trim() === '') 
    Toast('error', 'Bienvenido al Sistema' + '\n' + '\n' + 'Debes escribir un nombre de usuario.');
  else {
    const usuario = await getUserByName(user.value.trim());
    if(usuario === "")
      Toast('error', 'Bienvenido al Sistema' + '\n' + '\n' + `El usuario ${user.value} no se encuentra registrado.`);
    else
      if(password.input.value.length === 0)
        Toast('error', 'Bienvenido al Sistema' + '\n' + '\n' + 'Debes escribir una contraseña.');
      else
        if(password.input.value != usuario.contrasena)
          Toast('error', 'Bienvenido al Sistema' + '\n' + '\n' + 'La contraseña es incorrecta.');
        else {
          try {
            /*const res = await fetch('http://localhost:3000/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nombre: user.value.trim(), contrasena: password.input.value.trim() })
            });

            if (!res.ok) {
              const errorMessage = await res.text();
              throw new Error(`Error ${res.status}: ${errorMessage}`);
            }

            const data = await res.json();
            console.log("Token recibido:", data.access_token);
            localStorage.setItem('token', data.access_token);*/

            // Redirección por nombre de usuario
            const nombre = usuario.nombre;
            if (nombre.startsWith('AdminBasquet') || nombre.startsWith('AsisBasquet'))
              window.location.href = 'adminBasquet.html';
            else if (nombre.startsWith('AdminVolley') || nombre.startsWith('AsisVolley'))
              window.location.href = 'adminVolley.html';
            else if (nombre.startsWith('AdminFutbol') || nombre.startsWith('AsisFutbol'))
              window.location.href = 'adminFutbol.html';

          } catch (err) {
            Toast('error', 'Hubo un problema con el inicio de sesión.\n\n');
            console.log(err.message);
          }
        }
  }
});

/* ========================================== LLAMADAS ========================================== */

visibility();
inputValidacion(user);
inputValidacion(password.input);

/* ========================================== ALERTA ERROR ========================================== */
function Toast(icon, titulo) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-right',
      iconColor: 'white',
      customClass: {
        popup: 'colored-toast'
      },
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
    });
  
    Toast.fire({
      icon: icon,
      title: titulo
    });
  }

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

/* ========================================== API ========================================== */
async function getUserByName(name) {
  try {
      const users = await fetchUsers();
      return users.find(u => u.nombre === name) || "";
  } catch(error) {
      console.error('Error obteniendo usuarios:', error);
      return null;
  }
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

async function fetchUsers() {
  try {
    const response = await fetch('http://localhost:3000/api/user');
    if(!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response.json();
  } catch(error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
  }
}
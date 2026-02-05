// Abrir y cerrar receta

const botonesCerrar = document.getElementsByClassName('close');

function closeRecipe(event) {
    event.preventDefault();

    const recetaContenedor = event.target.closest('.recipecontainer');
    if (recetaContenedor) {
        recetaContenedor.style.display = 'none';
    }

    const darkscreen = document.querySelector('.darkscreen');
    if (darkscreen) {
        darkscreen.style.display = 'none';
    }
}

for (let i = 0; i < botonesCerrar.length; i++) {
    botonesCerrar[i].addEventListener('click', closeRecipe);
}

// Abrir receta
const botonesAbrir = document.querySelectorAll('.open-recipe');

function openRecipe(event) {
    event.preventDefault();

    const recetaId = event.currentTarget.getAttribute('data-target');

    const darkscreen = document.querySelector('.darkscreen');
    if (darkscreen) {
        darkscreen.style.display = 'flex';
        darkscreen.style.position = 'fixed';
    }

    const receta = document.getElementById(recetaId);
    if (receta) {
        receta.style.display = 'flex';
        receta.style.position = 'fixed';
    }
}


// Asignar el evento de clic a cada botón de abrir receta
botonesAbrir.forEach(button => {
    button.addEventListener('click', openRecipe);
});
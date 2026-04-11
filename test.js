const ROUTE_MAP = {
    'lecturas': '/pages/lectura.html',
    'dietas': '/pages/dieta.html',
    'rutinas': '/pages/rutina.html',
    'blog': '/pages/blog.html',
    'mi-espacio': '/pages/mi-espacio.html',
    'formulario': '/pages/form.html'
};
const path = '/rutinas/entrenamiento-en-15-minutos';
const parts = path.split('/').filter(p => p !== '');
const firstPart = parts[0];
let out = null;
if (ROUTE_MAP[firstPart]) {
    const slugCandidate = parts[1].replace('.html', '');
    if (slugCandidate) out = slugCandidate;
}
console.log(out);

// Custom Data for Mi Espacio Bento Box
// Must be loaded before MagicBento.js
const morningActivities = [
    "Tomar un vaso de agua al despertar",
    "Realizar 5 minutos de estiramientos",
    "Meditar durante 10 minutos",
    "Tender la cama con atención plena",
    "Agradecer por 3 cosas antes de levantarte",
    "Exponerte a la luz natural 5 minutos",
    "Desayunar sin pantallas"
];

const dayActivities = [
    "Leer 10 páginas de un libro",
    "Dar una caminata de 15 minutos",
    "Comer una fruta a media mañana",
    "Hacer 3 respiraciones profundas",
    "Corregir tu postura corporal",
    "Beber agua conscientemente",
    "Escuchar una canción que te motive"
];

const eveningActivities = [
    "Dejar pantallas 30 min antes de dormir",
    "Escribir una reflexión del día",
    "Preparar la ropa para mañana",
    "Tomar una infusión relajante",
    "Leer algo inspirador antes de dormir",
    "Realizar una rutina de skincare con calma"
];

const getDailyChecklist = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Simple pseudo-random using dayOfYear as seed offset
    const m1 = morningActivities[dayOfYear % morningActivities.length];
    const m2 = morningActivities[(dayOfYear + 1) % morningActivities.length];

    const d1 = dayActivities[dayOfYear % dayActivities.length];
    const d2 = dayActivities[(dayOfYear + 2) % dayActivities.length];

    const e1 = eveningActivities[dayOfYear % eveningActivities.length];

    return [
        { id: 1, text: m1, checked: false },
        { id: 2, text: m2, checked: false },
        { id: 3, text: d1, checked: false },
        { id: 4, text: d2, checked: false },
        { id: 5, text: e1, checked: false }
    ];
};

const ChecklistComponent = () => {
    const [items, setItems] = React.useState(() => getDailyChecklist());

    const toggle = (id) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="magic-bento-card__header mb-3" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div className="magic-bento-card__label" style={{ color: '#777' }}>Tu plan recomendado para hoy</div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgb(132, 0, 255)' }}></div>
            </div>

            <h4 style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1.2rem' }}>Pequeñas acciones para tu bienestar</h4>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flexGrow: 1,
                justifyContent: 'flex-start',
                overflowY: 'auto',
                minHeight: 0,
                paddingRight: '5px'
            }}>
                {items.map(item => (
                    <div key={item.id}
                        onClick={(e) => { e.stopPropagation(); toggle(item.id); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '4px 0'
                        }}>

                        {/* Checkbox circle */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '1rem',
                            width: '22px',
                            height: '22px',
                            minWidth: '22px',
                            borderRadius: '50%',
                            border: item.checked ? 'none' : '2px solid #ddd',
                            background: item.checked ? '#8400ff' : 'transparent',
                            transition: 'all 0.2s ease'
                        }}>
                            {item.checked && <i className="bi bi-check text-white" style={{ fontSize: '1.1rem', color: '#fff' }}></i>}
                        </div>

                        {/* Text */}
                        <span style={{
                            textDecoration: item.checked ? 'line-through' : 'none',
                            color: item.checked ? '#999' : '#333',
                            fontSize: '0.95rem',
                            transition: 'color 0.2s'
                        }}>
                            {item.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const reflections = [
    "Respira profundo antes de responder; ese segundo puede cambiar toda la conversación.",
    "No todo pensamiento merece atención; elige cuáles alimentar conscientemente.",
    "Descansar también es avanzar, aunque no produzca resultados visibles hoy.",
    "Escucha tu cuerpo: el cansancio también es una forma de información.",
    "Decir que no a tiempo evita resentimientos innecesarios después.",
    "Cambia el juicio por curiosidad y la ansiedad baja de volumen.",
    "Lo que evitas pensar suele pedir ser escuchado con calma.",
    "Pequeños hábitos diarios moldean más tu vida que grandes decisiones aisladas.",
    "Permítete empezar mal; la mejora viene caminando, no perfecta.",
    "No reacciones de inmediato: observa primero qué emoción quiere manejarte.",
    "Hacer pausas conscientes previene errores que el apuro fabrica.",
    "Tu valor no se mide por productividad constante.",
    "Nombrar una emoción reduce su intensidad automáticamente.",
    "Dormir bien es autocuidado, no un premio que se gana.",
    "Compararte apaga tu proceso; enfócate en tu propio ritmo.",
    "Pedir ayuda también es una forma de fortaleza emocional.",
    "El silencio bien usado aclara más que mil explicaciones.",
    "No todo merece una respuesta; elegir batallas protege energía mental.",
    "Agradecer lo pequeño entrena al cerebro para ver lo suficiente.",
    "Lo incómodo no siempre es peligro; a veces es crecimiento.",
    "Ordenar el espacio externo calma el ruido interno.",
    "Cambia “tengo que” por “elijo” y observa el alivio.",
    "El cuerpo recuerda lo que la mente intenta ignorar.",
    "Ser constante importa más que estar motivado.",
    "Tus límites enseñan a otros cómo tratarte.",
    "Una caminata corta puede destrabar pensamientos estancados.",
    "No todo malestar necesita solución inmediata.",
    "Descansar la mente también requiere práctica consciente.",
    "Releer tus logros ayuda cuando la autocrítica se exagera.",
    "La claridad llega cuando bajas el ruido, no cuando fuerzas respuestas.",
    "Hablarte con respeto cambia tu diálogo interno completo.",
    "El miedo disminuye cuando das el primer paso, aunque tiemble.",
    "No confundas urgencia con importancia.",
    "Hidratarte mejora más tu ánimo de lo que crees.",
    "Ser amable contigo facilita serlo con otros.",
    "Pensar menos y sentir mejor también es inteligencia.",
    "No necesitas tener todo resuelto para avanzar.",
    "El autocuidado empieza por escucharte sin interrumpirte.",
    "Aceptar límites propios libera energía para lo esencial.",
    "Respirar lento le enseña calma al sistema nervioso.",
    "El progreso real suele ser silencioso.",
    "No todo pensamiento negativo es una verdad disfrazada.",
    "Revisar expectativas evita decepciones repetidas.",
    "Cambiar hábitos pequeños genera efectos acumulativos grandes.",
    "El descanso mental previene decisiones impulsivas.",
    "Reconocer errores sin castigarte acelera el aprendizaje.",
    "Tu atención es un recurso limitado; cuídala.",
    "La paciencia también se entrena, como un músculo.",
    "Soltar el control reduce tensiones innecesarias.",
    "Validar lo que sientes no significa quedarte ahí.",
    "La autocompasión mejora la disciplina a largo plazo.",
    "Comer con atención regula más que solo el cuerpo.",
    "No responder también puede ser una respuesta sana.",
    "El estrés baja cuando simplificas expectativas.",
    "Nombrar prioridades aclara decisiones diarias.",
    "Descansar bien hoy previene agotamiento mañana.",
    "El foco se entrena eliminando distracciones pequeñas.",
    "Sentirte suficiente no depende de cumplirlo todo.",
    "La calma se construye, no aparece de golpe.",
    "El movimiento suave libera emociones acumuladas.",
    "Escuchar sin preparar respuesta mejora vínculos reales.",
    "Tus pensamientos no son órdenes; son sugerencias.",
    "Repetir rutinas estables tranquiliza al cerebro.",
    "El descanso emocional también necesita permiso.",
    "Reducir estímulos mejora la claridad mental.",
    "Decir la verdad con respeto alivia tensiones internas.",
    "El cansancio exagera problemas que luego se achican.",
    "Elegir lento puede ser una forma de cuidado.",
    "Tu ritmo no necesita justificarse.",
    "Priorizarte no te vuelve egoísta.",
    "Dormir suficiente es una estrategia emocional subestimada.",
    "El orden mental empieza por decidir menos.",
    "La práctica constante vence a la inspiración esporádica.",
    "Permitir errores reduce el miedo a intentar.",
    "Cerrar ciclos libera espacio psíquico.",
    "Tu bienestar mejora cuando bajas la autoexigencia extrema.",
    "Respirar profundo ayuda antes de tomar decisiones importantes.",
    "No todo pensamiento merece ser creído.",
    "El descanso mejora la memoria y el humor.",
    "Escuchar señales tempranas evita crisis mayores.",
    "Elegir una cosa a la vez calma la mente.",
    "Ser flexible protege más que resistir todo cambio.",
    "La claridad emocional llega cuando dejas de huir.",
    "Menos estímulos, más presencia.",
    "Tu atención define tu experiencia diaria.",
    "El equilibrio se ajusta, no se logra perfecto.",
    "Hacer menos, pero mejor, reduce ansiedad.",
    "El silencio también puede ser reparador.",
    "Reconocer avances pequeños sostiene la motivación.",
    "Escuchar tu respiración ancla al presente.",
    "El descanso es parte del proceso, no una pausa culpable.",
    "Tu mente necesita pausas tanto como foco.",
    "Simplificar decisiones reduce fatiga mental.",
    "Cambiar hábitos requiere paciencia, no dureza.",
    "Sentir incomodidad no significa retroceder.",
    "El autocuidado cotidiano previene agotamientos profundos.",
    "Escuchar tu cuerpo evita señales más fuertes después.",
    "Avanzar lento también es avanzar.",
    "La calma se practica, incluso en días difíciles.",
    "Tratarte bien es una habilidad que se aprende."
];

const getDailyReflection = () => {
    // Create a seed based on the date
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Use the day of year to select a reflection
    return reflections[dayOfYear % reflections.length];
};

const foodRecommendations = [
    { title: "Smoothie verde", type: "Desayuno", plan: "Energía y Vitalidad", url: "dietas/energia-y-vitalidad.html" },
    { title: "Ensalada con pollo a la plancha", type: "Almuerzo", plan: "Energía y Vitalidad", url: "dietas/energia-y-vitalidad.html" },
    { title: "Arroz integral con vegetales", type: "Cena", plan: "Energía y Vitalidad", url: "dietas/energia-y-vitalidad.html" },
    { title: "Batido de leche con fresas", type: "Desayuno", plan: "Energía y Vitalidad", url: "dietas/energia-y-vitalidad.html" },
    { title: "Salmón a la plancha", type: "Almuerzo", plan: "Energía y Vitalidad", url: "dietas/energia-y-vitalidad.html" },
    { title: "Buddha bowl de quinoa", type: "Almuerzo", plan: "Express Vegetariana", url: "dietas/express-vegetariana.html" },
    { title: "Crema de calabaza y jengibre", type: "Cena", plan: "Express Vegetariana", url: "dietas/express-vegetariana.html" },
    { title: "Tostadas con aguacate", type: "Desayuno", plan: "Express Vegetariana", url: "dietas/express-vegetariana.html" },
    { title: "Tacos de lechuga y garbanzos", type: "Almuerzo", plan: "Express Vegetariana", url: "dietas/express-vegetariana.html" },
    { title: "Pasta integral con pesto", type: "Cena", plan: "Express Vegetariana", url: "dietas/express-vegetariana.html" }
];

const getDailyFoodRecommendation = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return foodRecommendations[dayOfYear % foodRecommendations.length];
};

window.vitaliaBentoData = [
    // 1. Small (Top Left) - Reflection
    {
        color: '#FFFFFF',
        label: 'Reflexión del día',
        glowColor: '128, 202, 205', // --cyan
        customRender: () => (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="magic-bento-card__header">
                    <div className="magic-bento-card__label" style={{ color: '#777' }}>Reflexión del día</div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgb(128, 202, 205)' }}></div>
                </div>
                <h2 className="bento-reflection-text">
                    "{getDailyReflection()}"
                </h2>
                {/* Empty div to balance spacing if needed, or remove */}
                <div></div>
            </div>
        )
    },
    // 2. Small (Top Right) - Food
    {
        color: '#FFFFFF',
        label: 'Desayuno Recomendado',
        glowColor: '157, 96, 207', // --purple
        customRender: () => {
            const recommendation = getDailyFoodRecommendation();
            return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="magic-bento-card__header">
                        <div className="magic-bento-card__label" style={{ color: '#777' }}>Receta</div>
                        <i className="bi bi-arrow-up-right" style={{ fontSize: '1.2rem', color: '#333' }}></i>
                    </div>
                    <div>
                        <h5 className="bento-card-subtitle">{recommendation.plan}</h5>
                        <h3 className="bento-card-title">{recommendation.title}</h3>
                        <span className="bento-badge" style={{ background: 'rgba(157, 96, 207, 0.1)', color: '#9d60cf' }}>{recommendation.type}</span>
                    </div>
                </div>
            );
        },
        onClick: () => {
            const recommendation = getDailyFoodRecommendation();
            window.location.href = recommendation.url;
        }
    },
    // 3. Large (Index 3 - Span 2) - Checklist
    {
        color: '#FFFFFF',
        glowColor: '132, 0, 255',
        clickEffect: false,
        customRender: () => <ChecklistComponent />
    },
    // 4. Large (Index 4 - Span 2) - Article
    {
        glowColor: '225, 148, 127',
        style: {
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E"), 
            radial-gradient(at 10% 10%, rgba(225, 148, 127, 0.5) 0px, transparent 50%), 
            radial-gradient(at 90% 10%, rgba(253, 251, 247, 1) 0px, transparent 50%), 
            radial-gradient(at 90% 90%, rgba(128, 202, 205, 0.5) 0px, transparent 50%), 
            radial-gradient(at 10% 90%, rgba(157, 96, 207, 0.4) 0px, transparent 50%), 
            #FDFBF7`,
            backgroundSize: 'cover'
        },
        onClick: () => window.location.href = 'lectura.html?slug=enfoque-integral-trabajo',
        customRender: () => (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="magic-bento-card__header">
                    <div className="magic-bento-card__label" style={{ color: '#777' }}>Recurso recomendado</div>
                    <i className="bi bi-arrow-up-right" style={{ fontSize: '1.2rem', color: '#333' }}></i>
                </div>
                <div className="d-flex flex-row align-items-end justify-content-between">
                    <div>
                        <h2 className="bento-big-title">Beneficios de Incorporar un Enfoque Integral en tu Trabajo</h2>
                        <p className="bento-text-muted"><i className="bi bi-clock me-1"></i> 12 min de lectura</p>
                    </div>
                </div>
            </div>
        )
    },
    // 5. Small (Bottom Right 1) - Meditations Quick Access
    {
        color: '#FFFFFF',
        label: 'Acceso Rápido',
        glowColor: '174, 125, 215', // --purple-light
        customRender: () => (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="magic-bento-card__header">
                    <div className="magic-bento-card__label" style={{ color: '#777' }}>Acceso Rápido</div>
                    <i className="bi bi-arrow-down-right" style={{ fontSize: '1.2rem', color: '#333' }}></i>
                </div>
                <div>
                    <h3 className="bento-heading">Meditaciones</h3>
                    <p className="bento-text-muted" style={{ margin: '0.5rem 0 0', lineHeight: '1.3' }}>Encuentra tu centro con sesiones personalizadas.</p>
                </div>
            </div>
        ),
        onClick: () => {
            const element = document.getElementById('meditaciones');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    },
    // 6. Small (Bottom Right 2) - Exercise Routine
    {
        color: '#FFFFFF',
        label: 'Rutina Recomendada',
        glowColor: '128, 202, 205', // --cyan
        customRender: () => (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="magic-bento-card__header">
                    <div className="magic-bento-card__label" style={{ color: '#777' }}>Rutina Recomendada</div>
                    <i className="bi bi-arrow-up-right" style={{ fontSize: '1.2rem', color: '#333' }}></i>
                </div>
                <div>
                    <h5 className="bento-card-subtitle">Nivel Principiante</h5>
                    <h3 className="bento-card-title">Ejercicio en 15 Minutos</h3>
                    <span className="bento-badge mt-2" style={{ background: 'rgba(128, 202, 205, 0.1)', color: '#4d9ea1' }}>15 Minutos</span>
                </div>
            </div>
        ),
        onClick: () => window.location.href = 'rutinas/ejercicio-en-15-min.html'
    }
];

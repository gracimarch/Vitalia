import json
import copy

with open("assets/data/recetas.json", "r", encoding="utf-8") as f:
    data = json.load(f)

meals = data["meals"]

# ═══════════════════════════════════════════════════════════════
# CLASSIFICATION
# ═══════════════════════════════════════════════════════════════

SIMPLE_IDS = {
    "fruta_secos",          # Just fruit + nuts, no cooking
    "frutas_variadas",      # Just grab a fruit
    "punado_frutos_secos",  # Grab a handful of nuts
    "chocolate_amargo_porcion",  # Unwrap chocolate
    "cafe_solo",            # Just brew coffee
    "te_infusiones",        # Just steep tea
    "jugo_natural_naranja", # Just squeeze oranges
    "queso_fruta",          # Cut cheese + fruit
    "yogur_granola",        # Assemble yogurt bowl
    "yogur_con_semillas",   # Assemble yogurt bowl
    "tostadas_queso_mermelada",  # Toast + spread
    "cafe_tostadas",        # Coffee + toast
    "tostadas_mantequilla_mani", # Toast + spread
}

RECIPE_IDS = {
    "avena_fruta",
    "tostadas_palta_huevo",
    "smoothie_banana",
    "licuado_frutilla",
    "panqueques_avena",
    "huevos_tostadas",
    "chia_pudding",
    "batido_verde",
    "tacos",
    "canastitos",
    "hotcakes",
    "brownie_fit",
    "tiramisu",
    "helado",
    "ensalada_completa",
    "bowl_arroz_verduras",
    "pollo_plancha_ensalada",
    "tarta_verduras",
    "pasta_salsa_vegetales",
    "lentejas_guisadas",
    "arroz_huevo_verduras",
    "wrap_pollo_verduras",
    "sopa_verduras_proteina",
    "carne_horno_papas",
    "ensalada_garbanzos",
    "omelette_verduras",
    "milanesas_horno",
    "licuado_banana_snack",
    "barrita_avena_casera",
    "galletas_integrales_snack",
    "hummus_bastones_zanahoria",
    "ensalada_liviana_proteina",
    "sopa_verduras_dinner",
    "tortilla_papa_verduras",
    "verduras_horno_huevopollo",
    "salteado_verduras_arroz",
    "pescado_horno_ensalada",
    "revuelto_verduras_huevo",
    "limonada_menta_jengibre",
    "smoothie_frutas_mixtas",
}

# ═══════════════════════════════════════════════════════════════
# SIMPLE DESCRIPTIONS (replace recipe with short description)
# ═══════════════════════════════════════════════════════════════

simple_descriptions = {
    "fruta_secos": "Fruta fresca de estación (manzana, banana o la que prefieras) acompañada de un puñado de frutos secos como nueces o almendras. Ideal para saciar el hambre entre comidas.",
    "frutas_variadas": "Una pieza de fruta de estación: banana, manzana, naranja, durazno o la que tengas disponible. Lavar, pelar si es necesario y disfrutar.",
    "punado_frutos_secos": "Un puñado (aprox. 30 g) de nueces, almendras o maní sin sal. Fuente natural de grasas saludables, proteína y fibra.",
    "chocolate_amargo_porcion": "1–2 cuadraditos (aprox. 20 g) de chocolate amargo (70% cacao o más). Rico en antioxidantes y perfecto para un gusto dulce sin excesos.",
    "cafe_solo": "Preparar café en cafetera de filtro, italiana o la que uses habitualmente. Servir solo o con un chorrito de leche. Sin azúcar o con edulcorante a gusto.",
    "te_infusiones": "Calentar agua (sin que hierva del todo para tés verdes, con hervor para tisanas). Dejar infusionar el saquito o hebras 3–5 minutos. Opciones: manzanilla, tilo, té verde, menta.",
    "jugo_natural_naranja": "Exprimir 2–3 naranjas frescas. Servir inmediatamente para aprovechar las vitaminas. No agregar azúcar.",
    "queso_fruta": "Cortar 2–3 fetas de queso fresco o semi-duro y acompañar con fruta fresca picada (manzana, uva, pera). El contraste dulce-salado es ideal para meriendas rápidas.",
    "yogur_granola": "Servir 1 pote de yogur natural (200 g) en un bowl, agregar 3 cucharadas de granola y un hilito de miel. Mezclar ligeramente.",
    "yogur_con_semillas": "Servir 1 pote de yogur natural (200 g) en un bowl y espolvorear 1 cucharada de semillas mixtas (chía, lino, girasol). Mezclar y consumir.",
    "tostadas_queso_mermelada": "Tostar 2 rebanadas de pan. Untar una capa de queso crema y luego una cucharadita de mermelada por encima. Consumir al momento.",
    "cafe_tostadas": "Preparar café a gusto y tostar 2 rebanadas de pan. Acompañar con un poco de manteca o mermelada si se prefiere.",
    "tostadas_mantequilla_mani": "Tostar 2 rebanadas de pan y esparcir 1 cucharada generosa de mantequilla de maní natural. Se puede agregar rodajas de banana por encima.",
}

# ═══════════════════════════════════════════════════════════════
# IMPROVED RECIPES (ingredients + steps)
# ═══════════════════════════════════════════════════════════════

improved_recipes = {
    "avena_fruta": {
        "ingredients": [
            "½ taza de avena (40 g)",
            "1 taza de leche (250 ml)",
            "1 banana o fruta de estación",
            "1 cucharada de semillas de chía o lino",
            "Miel o canela a gusto (opcional)"
        ],
        "recipe": [
            "Colocar la avena y la leche en una olla pequeña a fuego medio.",
            "Revolver constantemente durante 5–7 minutos hasta que espese y la avena esté tierna.",
            "Retirar del fuego y servir en un bowl.",
            "Cortar la fruta en rodajas o trozos y distribuir por encima.",
            "Espolvorear las semillas y, si se desea, un toque de miel o canela."
        ]
    },
    "tostadas_palta_huevo": {
        "ingredients": [
            "2 rebanadas de pan integral",
            "½ palta madura",
            "2 huevos",
            "Sal, pimienta y jugo de limón a gusto",
            "1 cucharadita de aceite de oliva"
        ],
        "recipe": [
            "Tostar las rebanadas de pan hasta que estén crocantes.",
            "Pisar la palta con un tenedor, agregar unas gotas de limón, sal y pimienta.",
            "Distribuir la palta sobre las tostadas en cantidades iguales.",
            "Calentar una sartén con el aceite a fuego medio y cocinar los huevos a la plancha (o revueltos, según preferencia) durante 2–3 minutos.",
            "Colocar un huevo sobre cada tostada y servir de inmediato."
        ]
    },
    "smoothie_banana": {
        "ingredients": [
            "1 banana madura",
            "½ taza de leche (125 ml)",
            "2 cucharadas de avena (15 g)",
            "2–3 cubos de hielo (opcional)"
        ],
        "recipe": [
            "Pelar la banana y trozarla.",
            "Colocar la banana, la leche, la avena y el hielo en la licuadora.",
            "Licuar durante 30–45 segundos hasta obtener una textura cremosa y homogénea.",
            "Servir de inmediato en un vaso alto."
        ]
    },
    "licuado_frutilla": {
        "ingredients": [
            "6–8 frutillas frescas o congeladas",
            "1 pote de yogur natural (200 g)",
            "Endulzante a gusto (opcional)"
        ],
        "recipe": [
            "Lavar las frutillas y retirar las hojitas verdes.",
            "Colocar las frutillas y el yogur en la licuadora.",
            "Licuar 30 segundos hasta obtener una bebida suave y uniforme.",
            "Probar y ajustar dulzor si es necesario. Servir frío."
        ]
    },
    "panqueques_avena": {
        "ingredients": [
            "½ taza de avena (40 g)",
            "1 banana madura",
            "1 huevo",
            "½ cucharadita de canela (opcional)",
            "Aceite en spray o 1 cucharadita de manteca para la sartén",
            "Frutillas para decorar"
        ],
        "recipe": [
            "Colocar la avena, la banana trozada y el huevo en una licuadora o procesadora. Agregar la canela si se desea.",
            "Procesar hasta obtener una masa homogénea, sin grumos.",
            "Calentar una sartén antiadherente a fuego medio-bajo y engrasar ligeramente.",
            "Verter aproximadamente 2 cucharadas de masa por panqueque, formando círculos pequeños.",
            "Cocinar 2 minutos por lado o hasta que se dore la superficie. Dar vuelta con cuidado.",
            "Servir apilados con frutillas cortadas por encima."
        ]
    },
    "huevos_tostadas": {
        "ingredients": [
            "2–3 huevos",
            "2 rebanadas de pan",
            "1 cucharadita de manteca o aceite",
            "Sal y pimienta a gusto"
        ],
        "recipe": [
            "Tostar las rebanadas de pan en la tostadora o sartén hasta que estén doradas.",
            "Calentar la manteca o el aceite en una sartén a fuego medio-bajo.",
            "Cascar los huevos en un bowl, salpimentar y batir ligeramente con un tenedor.",
            "Verter en la sartén y revolver con una espátula de forma constante durante 2–3 minutos, hasta que cuajen pero queden cremosos.",
            "Servir los huevos sobre las tostadas."
        ]
    },
    "chia_pudding": {
        "ingredients": [
            "3 cucharadas de semillas de chía (30 g)",
            "1 taza de leche o yogur (250 ml)",
            "1 cucharadita de miel o endulzante (opcional)",
            "Fruta fresca para servir"
        ],
        "recipe": [
            "En un frasco o bowl, mezclar las semillas de chía con la leche o el yogur.",
            "Revolver bien para evitar que se formen grumos.",
            "Tapar y refrigerar durante al menos 2 horas (idealmente toda la noche).",
            "Al servir, revolver nuevamente. La mezcla debe tener consistencia de pudding.",
            "Agregar fruta fresca cortada y el endulzante a gusto."
        ]
    },
    "batido_verde": {
        "ingredients": [
            "1 taza de espinaca fresca (30 g)",
            "1 manzana verde, cortada en trozos",
            "Jugo de ½ limón",
            "1 taza de agua fría (250 ml)",
            "Hielo a gusto"
        ],
        "recipe": [
            "Lavar la espinaca y la manzana. Cortar la manzana en trozos (con o sin cáscara).",
            "Colocar la espinaca, la manzana, el jugo de limón, el agua y el hielo en la licuadora.",
            "Licuar durante 40–60 segundos hasta obtener una bebida homogénea.",
            "Servir de inmediato para conservar los nutrientes."
        ]
    },
    "tacos": {
        "ingredients": [
            "4 tortillas de trigo o maíz",
            "200 g de pechuga de pollo (o proteína elegida)",
            "1 tomate mediano, cortado en cubos",
            "½ cebolla morada, picada fina",
            "½ palta, cortada en láminas",
            "Jugo de ½ limón",
            "1 cucharada de aceite de oliva",
            "Sal, comino y paprika a gusto"
        ],
        "recipe": [
            "Cortar el pollo en tiras finas y salpimentar. Agregar comino y paprika.",
            "Calentar el aceite en una sartén a fuego fuerte y sellar el pollo 3–4 minutos por lado hasta que esté cocido y dorado.",
            "Calentar las tortillas en una sartén seca o microondas 15 segundos, para que queden flexibles.",
            "Armar los tacos: distribuir el pollo, el tomate, la cebolla y la palta.",
            "Exprimir el limón por encima y servir al momento."
        ]
    },
    "canastitos": {
        "ingredients": [
            "6 tapas de empanada (masa comprada)",
            "100 g de jamón cocido, picado",
            "100 g de queso, cortado en cubos pequeños",
            "2 huevos",
            "Sal y pimienta a gusto",
            "Aceite en spray para los moldes"
        ],
        "recipe": [
            "Precalentar el horno a 200 °C.",
            "Rociar un molde para muffins con aceite en spray.",
            "Cortar las tapas de empanada en círculos y acomodarlas dentro de cada hueco del molde, presionando suavemente para formar canastitos.",
            "Distribuir el jamón y el queso dentro de cada canastito.",
            "Batir los huevos con sal y pimienta y verter una cucharada en cada uno.",
            "Hornear 15–20 minutos hasta que la masa esté dorada y el huevo cuajado.",
            "Dejar enfriar 2 minutos antes de desmoldar."
        ]
    },
    "hotcakes": {
        "ingredients": [
            "1 banana madura",
            "1 huevo",
            "3 cucharadas de avena (25 g)",
            "Aceite en spray o ½ cucharadita de manteca",
            "Miel o fruta para servir (opcional)"
        ],
        "recipe": [
            "Pisar la banana con un tenedor hasta formar un puré.",
            "Agregar el huevo y la avena. Mezclar hasta integrar bien.",
            "Calentar una sartén antiadherente a fuego medio-bajo y engrasar ligeramente.",
            "Verter 2 cucharadas de masa por hotcake. Cocinar 2 minutos hasta que se formen burbujas en la superficie.",
            "Dar vuelta con cuidado y cocinar 1–2 minutos más.",
            "Servir con miel, fruta fresca o mantequilla de maní."
        ]
    },
    "brownie_fit": {
        "ingredients": [
            "2 bananas maduras",
            "3 cucharadas de cacao amargo en polvo (30 g)",
            "2 huevos",
            "½ taza de avena (40 g)",
            "1 cucharadita de esencia de vainilla",
            "Pizca de sal"
        ],
        "recipe": [
            "Precalentar el horno a 180 °C. Forrar un molde cuadrado pequeño con papel manteca.",
            "Pisar las bananas hasta hacer puré. Agregar los huevos y la vainilla, batir bien.",
            "Incorporar la avena, el cacao y la sal. Mezclar hasta obtener una masa homogénea.",
            "Verter la mezcla en el molde y emparejar la superficie con una espátula.",
            "Hornear 20–25 minutos. El centro debe estar firme al toque pero ligeramente húmedo.",
            "Dejar enfriar completamente antes de cortar en porciones (salen 6–8 cuadraditos)."
        ]
    },
    "tiramisu": {
        "ingredients": [
            "200 g de vainillas (bizcochos de soletilla)",
            "1 taza de café fuerte, frío (250 ml)",
            "250 g de queso mascarpone (o crema)",
            "3 cucharadas de azúcar",
            "Cacao amargo en polvo para espolvorear"
        ],
        "recipe": [
            "Preparar el café y dejarlo enfriar completamente.",
            "Mezclar el mascarpone (o la crema) con el azúcar hasta obtener una textura suave.",
            "Mojar las vainillas brevemente en el café (no dejarlas demasiado para que no se desarmen).",
            "Armar una primera capa de vainillas en el fondo de una fuente rectangular.",
            "Cubrir con la mitad de la crema de mascarpone. Repetir: otra capa de vainillas mojadas y el resto de la crema.",
            "Espolvorear cacao amargo generosamente por encima.",
            "Refrigerar al menos 4 horas (idealmente toda la noche) antes de servir."
        ]
    },
    "helado": {
        "ingredients": [
            "2 bananas maduras, previamente congeladas (mínimo 4 horas)",
            "2–3 cucharadas de leche (30 ml)",
            "1 cucharada de cacao en polvo (opcional, para versión chocolate)"
        ],
        "recipe": [
            "Cortar las bananas en rodajas antes de congelarlas (facilita el procesado).",
            "Colocar las rodajas congeladas en una procesadora o licuadora potente.",
            "Agregar la leche y procesar, raspando los bordes si es necesario.",
            "Procesar 2–3 minutos hasta obtener una textura cremosa tipo helado.",
            "Servir inmediatamente (textura de helado suave) o congelar 30 minutos para una textura más firme."
        ]
    },
    "ensalada_completa": {
        "ingredients": [
            "2 tazas de mix de lechugas",
            "1 tomate mediano, cortado en gajos",
            "½ pepino, en rodajas",
            "½ lata de atún (o 100 g de pollo cocido, o 1 huevo duro)",
            "1 cucharada de aceite de oliva",
            "Jugo de ½ limón",
            "Sal y pimienta a gusto"
        ],
        "recipe": [
            "Lavar y secar las hojas verdes. Disponerlas como base en un plato o bowl.",
            "Cortar el tomate en gajos y el pepino en rodajas. Distribuir sobre las hojas.",
            "Agregar la proteína elegida (atún escurrido, pollo desmenuzado o huevo en cuartos).",
            "Condimentar con aceite, limón, sal y pimienta.",
            "Mezclar suavemente y servir."
        ]
    },
    "bowl_arroz_verduras": {
        "ingredients": [
            "¾ taza de arroz (150 g crudo)",
            "1 pechuga de pollo o 150 g de tofu",
            "1 zanahoria, cortada en bastones",
            "½ zapallito o zucchini, en media lunas",
            "½ morrón, en tiras",
            "1 cucharada de salsa de soja",
            "1 cucharada de aceite",
            "Semillas de sésamo para decorar (opcional)"
        ],
        "recipe": [
            "Cocinar el arroz según las instrucciones del paquete. Reservar.",
            "Cortar la proteína en cubos o tiras y cocinar en una sartén con la mitad del aceite a fuego fuerte, 4–5 minutos. Reservar.",
            "En la misma sartén, agregar el resto del aceite y saltear las verduras 3–4 minutos a fuego fuerte, que queden cocidas pero firmes.",
            "Armar el bowl: colocar el arroz como base, la proteína a un lado y las verduras al otro.",
            "Rociar con salsa de soja y decorar con sésamo si se desea."
        ]
    },
    "pollo_plancha_ensalada": {
        "ingredients": [
            "1 pechuga de pollo (200 g)",
            "2 tazas de hojas verdes mixtas",
            "1 tomate, en gajos",
            "½ pepino, en rodajas",
            "1 cucharada de aceite de oliva",
            "Jugo de ½ limón",
            "Sal, pimienta y orégano a gusto"
        ],
        "recipe": [
            "Salpimentar la pechuga de pollo y espolvorear con orégano.",
            "Calentar una sartén o plancha a fuego medio-fuerte. Cocinar el pollo 5–6 minutos por lado, hasta que esté dorado y cocido por dentro.",
            "Dejar reposar 2 minutos y cortar en láminas.",
            "Armar la ensalada con las hojas, tomate y pepino.",
            "Colocar las láminas de pollo por encima. Condimentar con aceite y limón."
        ]
    },
    "tarta_verduras": {
        "ingredients": [
            "1 masa para tarta (comprada o casera)",
            "2 huevos",
            "½ taza de leche (125 ml)",
            "1 cebolla mediana, picada",
            "1 zapallito, en rodajas finas",
            "½ morrón, picado",
            "100 g de queso rallado",
            "Sal, pimienta y nuez moscada a gusto"
        ],
        "recipe": [
            "Precalentar el horno a 180 °C.",
            "Forrar un molde para tarta con la masa, pinchar la base con un tenedor.",
            "Saltear la cebolla en una sartén con un poco de aceite hasta que esté transparente (3 minutos).",
            "Agregar el zapallito y el morrón. Cocinar 5 minutos más, revolviendo. Salpimentar.",
            "En un bowl, batir los huevos con la leche, sal, pimienta y nuez moscada.",
            "Distribuir las verduras salteadas sobre la masa. Verter la mezcla de huevo por encima y cubrir con el queso rallado.",
            "Hornear 25–30 minutos hasta que la superficie esté dorada y firme."
        ]
    },
    "pasta_salsa_vegetales": {
        "ingredients": [
            "200 g de pasta (fideos spaghetti, penne o tirabuzón)",
            "1 lata de tomate triturado (400 g) o 3 tomates frescos",
            "1 diente de ajo, picado",
            "½ cebolla, picada fina",
            "½ zapallito, en cubos pequeños",
            "½ morrón, en cubos pequeños",
            "1 cucharada de aceite de oliva",
            "Sal, pimienta, orégano y albahaca a gusto"
        ],
        "recipe": [
            "Poner a hervir agua con sal en una olla grande. Cocinar la pasta según el tiempo del paquete. Escurrir.",
            "Mientras tanto, calentar el aceite en una sartén a fuego medio. Rehogar el ajo y la cebolla 2 minutos.",
            "Agregar el zapallito y el morrón. Cocinar 4–5 minutos.",
            "Incorporar el tomate triturado, sal, pimienta, orégano y albahaca. Dejar cocinar a fuego bajo 10 minutos.",
            "Mezclar la pasta con la salsa directamente en la sartén. Servir caliente."
        ]
    },
    "lentejas_guisadas": {
        "ingredients": [
            "1 taza de lentejas secas (200 g)",
            "1 zanahoria mediana, en cubos",
            "1 cebolla, picada",
            "1 diente de ajo, picado",
            "½ morrón, en cubos",
            "2 tazas de caldo de verduras (500 ml)",
            "1 cucharada de aceite de oliva",
            "Sal, comino y pimentón a gusto",
            "1 hoja de laurel (opcional)"
        ],
        "recipe": [
            "Enjuagar las lentejas bajo agua corriente.",
            "Calentar el aceite en una olla a fuego medio. Rehogar la cebolla y el ajo 2–3 minutos.",
            "Agregar la zanahoria y el morrón. Cocinar 3 minutos más.",
            "Incorporar las lentejas, el caldo, el laurel, el comino y el pimentón.",
            "Llevar a hervor, bajar el fuego y tapar. Cocinar 25–30 minutos hasta que las lentejas estén tiernas.",
            "Salpimentar al final. Retirar el laurel antes de servir."
        ]
    },
    "arroz_huevo_verduras": {
        "ingredients": [
            "1 taza de arroz cocido (puede ser del día anterior)",
            "2 huevos",
            "½ cebolla, picada",
            "1 zanahoria chica, en cubos pequeños",
            "½ taza de arvejas o choclo (opcionales)",
            "1 cucharada de aceite",
            "1 cucharada de salsa de soja (opcional)",
            "Sal y pimienta a gusto"
        ],
        "recipe": [
            "Calentar el aceite en una sartén grande o wok a fuego fuerte.",
            "Saltear la cebolla y la zanahoria durante 3 minutos.",
            "Agregar las arvejas o el choclo si se usan. Cocinar 2 minutos.",
            "Incorporar el arroz cocido y revolver bien para que se caliente parejo, 2–3 minutos.",
            "Hacer un espacio en el centro de la sartén, cascar los huevos y revolverlos rápidamente hasta que se cocinen.",
            "Mezclar todo junto, agregar la salsa de soja si se desea, y servir."
        ]
    },
    "wrap_pollo_verduras": {
        "ingredients": [
            "2 tortillas grandes de trigo",
            "150 g de pechuga de pollo (o garbanzos cocidos para versión veggie)",
            "1 tomate, en rodajas",
            "½ taza de lechuga o rúcula",
            "¼ palta, en láminas (opcional)",
            "1 cucharada de mayonesa liviana o hummus",
            "Sal y pimienta a gusto"
        ],
        "recipe": [
            "Cocinar la pechuga a la plancha con sal y pimienta, 5 minutos por lado. Dejar reposar y cortar en tiras.",
            "Calentar las tortillas en sartén seca o microondas 15 segundos.",
            "Untar cada tortilla con mayonesa o hummus.",
            "Colocar lechuga, tomate, pollo en tiras y palta.",
            "Enrollar firmemente plegando los extremos hacia adentro. Cortar al medio y servir."
        ]
    },
    "sopa_verduras_proteina": {
        "ingredients": [
            "1 papa mediana, en cubos",
            "1 zanahoria, en rodajas",
            "1 zapallito, en cubos",
            "½ cebolla, picada",
            "150 g de pollo o pescado (en trozos)",
            "3 tazas de caldo (750 ml)",
            "1 cucharada de aceite",
            "Sal, pimienta y perejil a gusto"
        ],
        "recipe": [
            "Calentar el aceite en una olla. Rehogar la cebolla 2 minutos.",
            "Agregar la papa, zanahoria y zapallito. Cocinar 3 minutos revolviendo.",
            "Verter el caldo y llevar a hervor.",
            "Agregar los trozos de pollo o pescado. Bajar el fuego y tapar.",
            "Cocinar 20–25 minutos hasta que las verduras estén tiernas y la proteína cocida.",
            "Condimentar con sal, pimienta y perejil antes de servir."
        ]
    },
    "carne_horno_papas": {
        "ingredients": [
            "400 g de carne magra (ej. cuadril o nalga)",
            "3 papas medianas, peladas y cortadas en cuartos",
            "2 cucharadas de aceite de oliva",
            "2 dientes de ajo, enteros",
            "Romero o tomillo fresco (opcional)",
            "Sal y pimienta a gusto"
        ],
        "recipe": [
            "Precalentar el horno a 200 °C.",
            "Salpimentar la carne por todos sus lados.",
            "Colocar las papas en una fuente para horno, rociar con 1 cucharada de aceite, sal y pimienta. Los ajos enteros y las hierbas también.",
            "Ubicar la carne en el centro de la fuente, rociar con el aceite restante.",
            "Hornear 40–50 minutos (dependiendo del grosor de la carne y el punto deseado), dando vuelta las papas a mitad de cocción.",
            "Dejar reposar la carne 5 minutos antes de cortar. Servir con las papas."
        ]
    },
    "ensalada_garbanzos": {
        "ingredients": [
            "1 lata de garbanzos escurridos (400 g) o 1½ taza de garbanzos cocidos",
            "1 tomate mediano, en cubos",
            "½ pepino, en cubos",
            "¼ cebolla morada, picada fina",
            "1 cucharada de aceite de oliva",
            "Jugo de ½ limón",
            "Sal, pimienta y comino a gusto",
            "Perejil fresco picado (opcional)"
        ],
        "recipe": [
            "Escurrir y enjuagar los garbanzos.",
            "Cortar el tomate, pepino y cebolla en cubos pequeños.",
            "Mezclar todo en un bowl amplio.",
            "Condimentar con aceite, limón, sal, pimienta y comino.",
            "Servir fresca. Se puede refrigerar 1 hora cubierta para intensificar los sabores."
        ]
    },
    "omelette_verduras": {
        "ingredients": [
            "2–3 huevos",
            "½ morrón, picado fino",
            "½ taza de espinaca fresca o champignones",
            "1 cucharadita de aceite o manteca",
            "Sal y pimienta a gusto"
        ],
        "recipe": [
            "Batir los huevos en un bowl con sal y pimienta.",
            "Calentar el aceite en una sartén antiadherente a fuego medio.",
            "Saltear las verduras picadas 2 minutos hasta que estén apenas tiernas.",
            "Verter los huevos batidos sobre las verduras de forma pareja.",
            "Cocinar sin revolver 2–3 minutos hasta que los bordes estén firmes.",
            "Plegar la omelette por la mitad con una espátula. Cocinar 1 minuto más y servir."
        ]
    },
    "milanesas_horno": {
        "ingredients": [
            "4 milanesas (de carne, pollo o berenjena)",
            "1 cucharada de aceite o aceite en spray",
            "Limón en cuartos para acompañar",
            "Ensalada o guarnición a elección"
        ],
        "recipe": [
            "Precalentar el horno a 200 °C.",
            "Cubrir una placa para horno con papel manteca o aluminio.",
            "Disponer las milanesas dejando espacio entre ellas. Rociar con aceite en spray o pincelar con aceite.",
            "Hornear 12–15 minutos del primer lado.",
            "Dar vuelta con cuidado y hornear 8–10 minutos más hasta que estén doradas y crocantes.",
            "Servir con limón y la guarnición elegida."
        ]
    },
    "licuado_banana_snack": {
        "ingredients": [
            "1 banana madura",
            "1 taza de leche (250 ml)",
            "Canela en polvo a gusto (opcional)"
        ],
        "recipe": [
            "Pelar y trozar la banana.",
            "Colocar en la licuadora junto con la leche.",
            "Licuar 30 segundos hasta obtener una consistencia cremosa.",
            "Servir en un vaso y espolvorear canela si se desea."
        ]
    },
    "barrita_avena_casera": {
        "ingredients": [
            "1 taza de avena (80 g)",
            "2 cucharadas de miel o pasta de dátiles",
            "2 cucharadas de mantequilla de maní",
            "¼ taza de frutos secos picados (nueces, almendras)",
            "2 cucharadas de semillas de girasol o zapallo",
            "Pizca de sal"
        ],
        "recipe": [
            "En un bowl, mezclar la avena, los frutos secos y las semillas.",
            "Calentar ligeramente la miel con la mantequilla de maní en microondas o a baño María (20 segundos), solo para que fluya mejor.",
            "Verter la mezcla líquida sobre los ingredientes secos y revolver bien hasta que todo esté integrado.",
            "Forrar un molde rectangular pequeño con papel film o manteca.",
            "Volcar la mezcla, presionar firmemente con el dorso de una cuchara para compactar (debe tener 1–2 cm de grosor).",
            "Refrigerar al menos 2 horas hasta que esté firme.",
            "Desmoldar y cortar en 6–8 barritas. Se conservan refrigeradas hasta 5 días."
        ]
    },
    "galletas_integrales_snack": {
        "ingredients": [
            "1 taza de harina integral (120 g)",
            "1 huevo",
            "2 cucharadas de aceite (30 ml)",
            "2 cucharadas de edulcorante o azúcar mascabo",
            "½ cucharadita de esencia de vainilla",
            "½ cucharadita de polvo de hornear",
            "Pizca de sal"
        ],
        "recipe": [
            "Precalentar el horno a 180 °C. Preparar una placa con papel manteca.",
            "En un bowl, mezclar el huevo con el aceite, el edulcorante y la vainilla.",
            "Incorporar la harina, el polvo de hornear y la sal. Mezclar hasta formar una masa suave (no amasar de más).",
            "Tomar porciones con una cuchara y formar bolitas. Disponerlas en la placa dejando espacio entre ellas. Aplanar ligeramente.",
            "Hornear 15–18 minutos hasta que los bordes estén dorados.",
            "Dejar enfriar sobre la placa antes de manipular (se endurecen al enfriarse). Salen aprox. 12 galletas."
        ]
    },
    "hummus_bastones_zanahoria": {
        "ingredients": [
            "1 lata de garbanzos escurridos (400 g)",
            "2 cucharadas de pasta de tahini (sésamo)",
            "Jugo de 1 limón",
            "1 diente de ajo pequeño",
            "2 cucharadas de aceite de oliva",
            "Sal y comino a gusto",
            "2–3 zanahorias frescas para los bastones"
        ],
        "recipe": [
            "Escurrir y enjuagar los garbanzos. Reservar un poco del líquido de la lata.",
            "Colocar en la procesadora: garbanzos, tahini, jugo de limón, ajo, aceite, sal y comino.",
            "Procesar 2–3 minutos hasta obtener una pasta suave. Si queda muy espesa, agregar cucharadas del líquido reservado.",
            "Pelar las zanahorias y cortarlas en bastones de aproximadamente 8 cm.",
            "Servir el hummus en un bowl y acompañar con los bastones de zanahoria para dippear.",
            "Tip: el hummus se conserva en la heladera hasta 4 días en un recipiente cerrado."
        ]
    },
    "ensalada_liviana_proteina": {
        "ingredients": [
            "2 tazas de hojas verdes (rúcula, lechuga o espinaca)",
            "100 g de pollo cocido desmenuzado, ½ lata de atún o 1 huevo duro",
            "½ tomate, en gajos",
            "Jugo de ½ limón",
            "1 cucharadita de aceite de oliva",
            "Sal y pimienta a gusto"
        ],
        "recipe": [
            "Lavar y secar las hojas verdes. Colocarlas como base.",
            "Agregar la proteína elegida sobre las hojas.",
            "Distribuir los gajos de tomate.",
            "Condimentar con limón, aceite, sal y pimienta.",
            "Mezclar suavemente y servir. Ideal como cena liviana."
        ]
    },
    "sopa_verduras_dinner": {
        "ingredients": [
            "1 papa mediana, en cubos",
            "1 zanahoria, en rodajas",
            "1 zapallito, en cubos",
            "½ cebolla, picada",
            "½ taza de zapallo, en cubos",
            "3 tazas de agua o caldo de verduras (750 ml)",
            "1 cucharada de aceite",
            "Sal, pimienta y perejil a gusto"
        ],
        "recipe": [
            "Calentar el aceite y rehogar la cebolla 2 minutos en una olla.",
            "Agregar todas las verduras cortadas. Cocinar 3 minutos revolviendo.",
            "Verter el agua o caldo y llevar a hervor.",
            "Bajar el fuego, tapar y cocinar 20–25 minutos hasta que las verduras estén bien tiernas.",
            "Salpimentar. Se puede licuar parcialmente si se prefiere una textura más cremosa.",
            "Servir caliente con perejil fresco picado por encima."
        ]
    },
    "tortilla_papa_verduras": {
        "ingredients": [
            "3 huevos",
            "2 papas medianas (o verduras equivalentes como calabaza, espinaca, cebolla)",
            "½ cebolla, en rodajas finas",
            "2 cucharadas de aceite",
            "Sal y pimienta a gusto"
        ],
        "recipe": [
            "Pelar y cortar las papas en rodajas finas (3 mm de espesor). La cebolla también.",
            "Calentar el aceite en una sartén y cocinar las papas y la cebolla a fuego medio-bajo durante 12–15 minutos, hasta que estén tiernas. Revolver ocasionalmente.",
            "Batir los huevos en un bowl con sal y pimienta.",
            "Agregar las papas cocidas a los huevos batidos y mezclar.",
            "Verter todo en la sartén caliente (con un hilo de aceite). Cocinar a fuego bajo 5–6 minutos hasta que el borde y la base estén firmes.",
            "Dar vuelta la tortilla ayudándose con un plato. Cocinar 3–4 minutos más del otro lado.",
            "Servir tibia o a temperatura ambiente."
        ]
    },
    "verduras_horno_huevopollo": {
        "ingredients": [
            "1 zapallito o zucchini, en rodajas",
            "1 morrón, en tiras",
            "1 cebolla, en cuartos",
            "1 papa chica, en cubos",
            "2 huevos o 1 pechuga de pollo (200 g)",
            "2 cucharadas de aceite de oliva",
            "Sal, pimienta, pimentón y orégano a gusto"
        ],
        "recipe": [
            "Precalentar el horno a 200 °C.",
            "Disponer todas las verduras en una fuente para horno. Rociar con aceite y condimentos. Mezclar bien.",
            "Si se usa pollo: salpimentar la pechuga y ubicarla en el centro entre las verduras.",
            "Hornear 30 minutos. A los 20 minutos, girar las verduras.",
            "Si se usa huevo: en los últimos 8 minutos, hacer dos huecos entre las verduras y cascar un huevo en cada uno.",
            "Continuar horneando hasta que el huevo esté cuajado o el pollo totalmente cocido. Servir directo de la fuente."
        ]
    },
    "salteado_verduras_arroz": {
        "ingredients": [
            "1 taza de arroz cocido o fideos cocidos",
            "1 zanahoria, en juliana",
            "½ morrón, en tiras",
            "½ zapallito, en media lunas",
            "½ cebolla, en plumas",
            "1 cucharada de aceite",
            "1 cucharada de salsa de soja (opcional)",
            "Semillas de sésamo (opcional)"
        ],
        "recipe": [
            "Tener el arroz o los fideos ya cocidos y listos.",
            "Calentar el aceite en un wok o sartén grande a fuego fuerte.",
            "Saltear la cebolla y la zanahoria 2 minutos. Agregar el morrón y el zapallito, 2 minutos más.",
            "Las verduras deben quedar cocidas pero crujientes (no blandas).",
            "Incorporar el arroz o los fideos y la salsa de soja. Revolver 2 minutos para integrar.",
            "Servir caliente con semillas de sésamo por encima."
        ]
    },
    "pescado_horno_ensalada": {
        "ingredients": [
            "1 filet de pescado blanco (merluza, lenguado, 200 g)",
            "1 cucharada de aceite de oliva",
            "Jugo de ½ limón",
            "2 tazas de mix de hojas verdes",
            "½ tomate, en gajos",
            "Sal, pimienta, ajo en polvo y perejil a gusto"
        ],
        "recipe": [
            "Precalentar el horno a 180 °C.",
            "Colocar el filet en una fuente con papel aluminio o manteca. Rociar con aceite, limón, sal, pimienta y ajo en polvo.",
            "Hornear 15–18 minutos hasta que el pescado esté opaco y se desmenuce fácilmente con un tenedor.",
            "Mientras tanto, armar la ensalada con las hojas y el tomate.",
            "Servir el pescado caliente junto a la ensalada. Exprimir un poco más de limón si se desea."
        ]
    },
    "revuelto_verduras_huevo": {
        "ingredients": [
            "2–3 huevos",
            "½ zapallito, en cubos pequeños",
            "1 taza de espinaca fresca",
            "½ cebolla, picada fina",
            "1 cucharadita de aceite",
            "Sal y pimienta a gusto"
        ],
        "recipe": [
            "Calentar el aceite en una sartén a fuego medio.",
            "Saltear la cebolla 2 minutos. Agregar el zapallito y cocinar 3 minutos.",
            "Incorporar la espinaca y cocinar 1 minuto hasta que se reduzca.",
            "Cascar los huevos directamente sobre las verduras.",
            "Revolver con una espátula rápidamente durante 2–3 minutos hasta que el huevo esté cocido pero cremoso.",
            "Salpimentar y servir de inmediato."
        ]
    },
    "limonada_menta_jengibre": {
        "ingredients": [
            "Jugo de 2 limones",
            "4–5 hojas de menta fresca",
            "1 rodaja fina de jengibre fresco (o ½ cucharadita rallado)",
            "2 tazas de agua fría (500 ml)",
            "Hielo a gusto",
            "Endulzante a gusto (opcional)"
        ],
        "recipe": [
            "Exprimir los limones y verter el jugo en una jarra.",
            "Agregar el agua fría, las hojas de menta y el jengibre.",
            "Revolver bien. Si se desea endulzar, agregar miel o edulcorante.",
            "Agregar hielo generosamente.",
            "Dejar reposar 5 minutos para que la menta y el jengibre liberen su sabor. Servir frío."
        ]
    },
    "smoothie_frutas_mixtas": {
        "ingredients": [
            "1 taza de frutas mixtas (frutillas, durazno, arándanos — frescas o congeladas)",
            "½ taza de agua o leche (125 ml)",
            "3–4 cubos de hielo",
            "Endulzante a gusto (opcional)"
        ],
        "recipe": [
            "Lavar las frutas (si son frescas) y trozarlas.",
            "Colocar las frutas, el líquido y el hielo en la licuadora.",
            "Licuar 40–60 segundos hasta obtener una mezcla cremosa y homogénea.",
            "Probar y ajustar dulzor. Servir de inmediato en un vaso alto."
        ]
    },
}

# ═══════════════════════════════════════════════════════════════
# APPLY CHANGES
# ═══════════════════════════════════════════════════════════════

changelog_simple = []
changelog_recipe = []
warnings = []

for item in meals:
    rid = item["id"]
    
    # Fix typo in chocolate_amargo_porcion
    if rid == "chocolate_amargo_porcion":
        item["name"] = "Porción de chocolate amargo"
    
    if rid in SIMPLE_IDS:
        item["type"] = "simple"
        if rid in simple_descriptions:
            item["recipe"] = [simple_descriptions[rid]]
        changelog_simple.append(rid)
        
    elif rid in RECIPE_IDS:
        item["type"] = "recipe"
        if rid in improved_recipes:
            item["ingredients"] = improved_recipes[rid]["ingredients"]
            item["recipe"] = improved_recipes[rid]["recipe"]
            changelog_recipe.append(rid)
        else:
            warnings.append(f"{rid}: marked as recipe but no improvement provided")
    else:
        warnings.append(f"{rid}: not classified (unknown ID)")

with open("assets/data/recetas.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("=== CHANGELOG ===")
print(f"\n--- Converted to SIMPLE ({len(changelog_simple)}) ---")
for s in changelog_simple:
    print(f"  ✓ {s}")

print(f"\n--- Improved RECIPES ({len(changelog_recipe)}) ---")
for r in changelog_recipe:
    print(f"  ✓ {r}")

print(f"\n--- WARNINGS ({len(warnings)}) ---")
for w in warnings:
    print(f"  ⚠ {w}")

print(f"\nTotal items: {len(meals)}")
print("Done!")

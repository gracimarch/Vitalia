import json

with open("assets/data/dietas.json", "r") as f:
    data = json.load(f)

# Define replacements for diets
diet_pools = {
    "aliviar-la-ansiedad-en-dias-estresantes": [
        "avena_fruta", "te_infusiones", "ensalada_completa",
        "pescado_horno_ensalada", "chocolate_amargo_porcion", "smoothie_banana"
    ],
    "dias-ocupados": [
        "huevos_tostadas", "cafe_tostadas", "wrap_pollo_verduras",
        "tacos", "frutas_variadas", "punado_frutos_secos",
        "licuado_banana_snack", "omelette_verduras"
    ],
    "energia-y-vitalidad": [
        "tostadas_palta_huevo", "yogur_granola", "ensalada_garbanzos",
        "lentejas_guisadas", "arroz_huevo_verduras", "pollo_plancha_ensalada",
        "smoothie_frutas_mixtas", "punado_frutos_secos", "sopa_verduras_proteina",
        "carne_horno_papas", "milanesas_horno", "hummus_bastones_zanahoria",
        "barrita_avena_casera", "jugo_natural_naranja", "cafe_solo", "batido_verde"
    ],
    "express-vegetariana": [
        "avena_fruta", "tostadas_palta_huevo", "smoothie_banana",
        "tarta_verduras", "ensalada_garbanzos", "omelette_verduras",
        "lentejas_guisadas", "pasta_salsa_vegetales", "salteado_verduras_arroz",
        "revuelto_verduras_huevo", "sopa_verduras_dinner", "tortilla_papa_verduras",
        "galletas_integrales_snack", "frutas_variadas", "fruta_secos"
    ],
    "fin-de-semana-sin-lacteos": [
        "tostadas_palta_huevo", "huevos_tostadas", "fruta_secos",
        "ensalada_completa", "pollo_plancha_ensalada", "wrap_pollo_verduras",
        "sopa_verduras_proteina", "pescado_horno_ensalada"
    ],
    "sin-lacteos": [
        "tostadas_palta_huevo", "huevos_tostadas", "batido_verde",
        "sopa_verduras_dinner", "tortilla_papa_verduras", "pescado_horno_ensalada",
        "arroz_huevo_verduras", "lentejas_guisadas", "ensalada_garbanzos",
        "jugo_natural_naranja", "te_infusiones", "ensalada_liviana_proteina",
        "pollo_plancha_ensalada", "carne_horno_papas", "milanesas_horno"
    ],
    "sueno-reparador": [
        "te_infusiones", "sopa_verduras_dinner", "pescado_horno_ensalada",
        "licuado_banana_snack", "yogur_con_semillas", "ensalada_liviana_proteina"
    ]
}

def replace_with_pool(recipe_ids, pool):
    import random
    random.seed(42) # Deterministic replacements for reproducibility
    new_ids = []
    pool_idx = 0
    for rid in recipe_ids:
        if rid.startswith("recipe") and rid[6:].isdigit():
            # Pick from pool sequentially or randomly
            new_ids.append(pool[pool_idx % len(pool)])
            pool_idx += 1
        else:
            new_ids.append(rid)
    return new_ids

for diet in data["dietas"]:
    slug = diet.get("slug")
    if slug in diet_pools:
        pool = diet_pools[slug]
        for day in diet.get("schedule", []):
            for m in day.get("meals", []):
                if "recipeIds" in m:
                    m["recipeIds"] = replace_with_pool(m["recipeIds"], pool)

with open("assets/data/dietas.json", "w", encoding='utf8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Updated dietas.json successfully")

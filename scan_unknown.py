import json

with open("assets/data/dietas.json", "r") as f:
    dietas = json.load(f)
    
with open("assets/data/recetas.json", "r") as f:
    recetas = json.load(f)["meals"]
    
valid_ids = {r["id"] for r in recetas}

missing_by_diet = {}

for d in dietas["dietas"]:
    missing = set()
    for day in d.get("schedule", []):
        for m in day.get("meals", []):
            for rid in m.get("recipeIds", []):
                if rid not in valid_ids:
                    missing.add(rid)
    if missing:
        missing_by_diet[d["slug"]] = missing

for slug, m in missing_by_diet.items():
    print(f"{slug}: {m}")

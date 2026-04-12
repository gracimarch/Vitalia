import json

with open("assets/data/recetas.json", "r") as f:
    meals = json.load(f)["meals"]

print(f"Total recipes: {len(meals)}")
if len(meals) > 0:
    print(f"Sample recipe keys: {list(meals[0].keys())}")

for m in meals:
    print(f"{m['id']} - {m['name']} - {m.get('time', m.get('prep_time', ''))} - {m.get('tags', [])}")

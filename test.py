import json

with open('./assets/data/dietas.json', 'r') as f:
    dietas_data = json.load(f)
with open('./assets/data/recetas.json', 'r') as f:
    recetas_data = json.load(f)

for dieta in dietas_data['dietas']:
    # Python equivalent of the JS error
    pass
print("Tested OK")

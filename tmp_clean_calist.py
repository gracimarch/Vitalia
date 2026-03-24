import json

ru_file = '/Users/jossmarsala/Documents/Vitalia-1/assets/data/rutinas.json'

with open(ru_file, 'r', encoding='utf-8') as f:
    ru_data = json.load(f)

for r in ru_data['rutinas']:
    if r['slug'] == 'calistenia-outdoor-fuerza':
        r['exercises'] = [
            { "exerciseId": "jumping_jacks", "duration": 60, "rest": 15, "sets": 1 },
            { "exerciseId": "shoulder_circles", "duration": 60, "rest": 15, "sets": 1 },
            { "exerciseId": "calf_raises", "duration": 45, "rest": 15, "sets": 2 },
            { "exerciseId": "plank", "duration": 40, "rest": 20, "sets": 2 },
            
            { "exerciseId": "pushups", "duration": 45, "rest": 45, "sets": 3 },
            { "exerciseId": "band_row", "title": "Remo (Banda o Barra Libre)", "duration": 45, "rest": 45, "sets": 3 },
            { "exerciseId": "lunges", "duration": 45, "rest": 45, "sets": 3 },
            { "exerciseId": "hollow_hold", "duration": 40, "rest": 20, "sets": 3 },
            
            { "exerciseId": "burpees", "duration": 30, "rest": 15, "sets": 3 },
            { "exerciseId": "mountain_climbers", "duration": 30, "rest": 15, "sets": 3 },
            { "exerciseId": "skater_jumps", "duration": 30, "rest": 15, "sets": 3 },
            { "exerciseId": "shoulder_taps", "duration": 30, "rest": 15, "sets": 3 },
            
            { "exerciseId": "downward_dog", "duration": 60, "rest": 15, "sets": 2 },
            { "exerciseId": "worlds_greatest_stretch", "title": "Estiramiento del Mundo", "duration": 60, "rest": 15, "sets": 2 },
            { "exerciseId": "square_breathing", "duration": 60, "rest": 0, "sets": 3 }
        ]
        break

with open(ru_file, 'w', encoding='utf-8') as f:
    json.dump(ru_data, f, indent=4, ensure_ascii=False)

print("Calisthenics routine cleaned successfully.")

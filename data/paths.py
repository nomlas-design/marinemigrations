import csv
import os

def read_csv(file_path):
    """Read CSV data from the given file."""
    with open(file_path, newline='', encoding='utf-8') as file:
        return list(csv.DictReader(file))

def process_data(data):
    """Process data to find unique paths and create dots."""
    paths = set()
    unique_paths = []
    dots = []

    path_id_map = {}

    for row in data:
        # Extract coordinates and age
        coordinates = [(float(row['Lat1']), float(row['Lon1'])), (float(row['Lat2']), float(row['Lon2']))]
        age = float(row['Age'])

        # Skip rows with identical start and end coordinates
        if coordinates[0] == coordinates[1]:
            continue

        coordinates_reversed = list(reversed(coordinates))

        # Check for unique paths
        path = tuple(coordinates)
        path_reversed = tuple(coordinates_reversed)
        reversed_flag = False

        if path not in paths and path_reversed not in paths:
            path_id = len(unique_paths) + 1
            paths.add(path)
            unique_paths.append({'id': path_id, 'coordinates': coordinates})
            path_id_map[path] = path_id
        elif path_reversed in paths:
            reversed_flag = True
            path_id = path_id_map[path_reversed]

        # Add dots
        dots.append({'pathId': path_id, 'startTime': age, 'reversed': reversed_flag})

    return unique_paths, dots

def write_js(paths, dots, file_path):
    """Write paths and dots data to a JS file."""
    # Ensure the directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, 'w', encoding='utf-8') as file:
        file.write('export const data = {\n  paths: [\n')
        for item in paths:
            file.write(f'    {{\n      id: {item["id"]},\n      coordinates: [\n')
            for coord in item['coordinates']:
                file.write(f'        [{coord[0]}, {coord[1]}],\n')
            file.write('      ],\n    },\n')
        file.write('  ],\n  dots: [\n')
        for dot in dots:
            file.write(f'    {{ pathId: {dot["pathId"]}, startTime: {dot["startTime"]}, reversed: {"true" if dot["reversed"] else "false"} }},\n')
        file.write('  ],\n};\n')

# Main script execution
csv_file_path = 'data.csv'
js_file_path = 'js/data.js'

csv_data = read_csv(csv_file_path)
unique_paths, dots = process_data(csv_data)
write_js(unique_paths, dots, js_file_path)

print(f"JS output written to {js_file_path}")

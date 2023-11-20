import csv
import os

def read_csv(file_path):
    """Read CSV data from the given file."""
    with open(file_path, newline='', encoding='utf-8') as file:
        return list(csv.DictReader(file))

def process_first_path_data(data):
    """Process data to get dots for the first unique path."""
    first_path = None
    dots = []

    for row in data:
        # Extract coordinates, age, and reversed flag
        coordinates = [(float(row['Lat1']), float(row['Lon1'])), (float(row['Lat2']), float(row['Lon2']))]
        age = float(row['Age'])
        reversed_flag = False

        # Skip rows with identical start and end coordinates
        if coordinates[0] == coordinates[1]:
            continue

        coordinates_reversed = list(reversed(coordinates))

        if not first_path:
            first_path = tuple(coordinates)
        elif first_path != tuple(coordinates) and first_path != tuple(coordinates_reversed):
            continue

        if first_path == tuple(coordinates_reversed):
            reversed_flag = True

        dots.append({'pathId': 1, 'startTime': age, 'reversed': reversed_flag})

    return [{'id': 1, 'coordinates': list(first_path)}], dots

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
csv_file_path = 'data.csv'  # Update this with the actual file name
js_file_path = 'js/first_path_data.js'  # JS file path

csv_data = read_csv(csv_file_path)
first_path, dots = process_first_path_data(csv_data)
write_js(first_path, dots, js_file_path)

print(f"JS output written to {js_file_path}")
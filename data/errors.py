import csv

def find_duplicate_coordinate_rows(file_path):
    """Find rows where start and end coordinates are the same."""
    duplicate_rows = []
    
    with open(file_path, newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row_number, row in enumerate(reader, start=1):
            if row['Lat1'] == row['Lat2'] and row['Lon1'] == row['Lon2']:
                duplicate_rows.append(row_number)
    
    return duplicate_rows

# Main script execution
csv_file_path = 'data.csv'  # Update this with the actual file name

duplicate_rows = find_duplicate_coordinate_rows(csv_file_path)

if duplicate_rows:
    print("Duplicate coordinate rows found at:", duplicate_rows)
else:
    print("No duplicate coordinate rows found.")
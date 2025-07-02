#!/usr/bin/env python3
import json
import sys
from pathlib import Path
from typing import Any

# Files to process
FILES_TO_PROCESS = [
    Path('static/events.json'),
    Path('static/periods.json')
]

def reorder_lang_keys(obj: dict[str, Any] | Any) -> dict[str, Any] | Any:
    """Reorder language keys to put 'en' before 'fr'"""
    if not isinstance(obj, dict):
        return obj
    
    if 'en' in obj and 'fr' in obj:
        return {
            'en': obj['en'],
            'fr': obj['fr']
        }
    return obj

def process_item(item: dict[str, Any]) -> dict[str, Any]:
    """Process a single item to reorder language keys"""
    new_item: dict[str, Any] = item.copy()
    
    if 'name' in item:
        new_item['name'] = reorder_lang_keys(item['name'])
    
    if 'description' in item:
        new_item['description'] = reorder_lang_keys(item['description'])
    
    return new_item

def process_file(input_file: Path, output_file: Path) -> None:
    """Process a JSON file to reorder language keys"""
    try:
        # Read the input file
        with open(input_file, 'r', encoding='utf-8') as f:
            data: list[dict[str, Any]] = json.load(f)
        
        print(f"Read {len(data)} items from {input_file}")
        
        # Process each item
        new_data: list[dict[str, Any]] = [process_item(item) for item in data]
        
        # Write back to the same file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent='\t', ensure_ascii=False)
            f.write('\n')  # Add newline at end
        
        print(f"Successfully wrote {len(new_data)} items to {output_file}")
        
    except FileNotFoundError:
        print(f"Error: File {input_file} not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {input_file}: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

def main() -> None:
    for file_path in FILES_TO_PROCESS:
        print(f"Processing {file_path}...")
        process_file(file_path, file_path)
    
    print("\nAll files processed successfully!")

if __name__ == "__main__":
    main() 
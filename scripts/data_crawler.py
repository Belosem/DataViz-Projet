import requests
import json

def query_api(id):
    url = f"https://geoconfirmed.org/api/placemark/Ukraine/{id}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to get data for id {id}")
        return None

def update_json_data(json_data):
    count = 0
    for item in json_data:
        if(count == 1):
            break
        else:
            api_data = query_api(item['id'])
            if api_data:
                if(api_data["dateCreated"]):
                    print(f"item [${item['id']}] already has dateCreated [${api_data['dateCreated']}], skipping")
                    pass
                else:
                    item.update(api_data)
                    count += 1
                pass

def main():
    json_file_path = 'Ukraine_conflict_event_points.json'

    # Read JSON data
    with open(json_file_path, 'r') as file:
        data = json.load(file)

    # Update JSON data with API responses
    update_json_data(data)

    # Write updated data back to JSON file
    with open(json_file_path, 'w') as file:
        json.dump(data, file, indent=4)

if __name__ == "__main__":
    main()

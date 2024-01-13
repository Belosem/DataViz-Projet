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

    # Get the list of unique icons
    list_icon_uniq = []
    for item in data:
        if item['icon'] not in list_icon_uniq:
            list_icon_uniq.append(item['icon'])

    # Download icons from the list to the icons folder
    for icon in list_icon_uniq:
        url = f"https://cdn.geoconfirmed.org/geoconfirmed/icons/Ukraine/{icon}"
        response = requests.get(url)
        if response.status_code == 200:
            with open(f"icons/{icon}", 'wb') as file:
                file.write(response.content)
        else:
            print(f"Failed to get icon {icon}")

if __name__ == "__main__":
    main()

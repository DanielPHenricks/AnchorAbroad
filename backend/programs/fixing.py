import json
try:
    with open('vanderbilt_all_programs.json', 'r') as file:
        main_dict = json.load(file)
        
    with open('vanderbilt_programs_latlong.json', 'r') as file:
        loc_dict = json.load(file)
    print(loc_dict)

    for program_id in main_dict:
        try:
            main_dict[f'{program_id}']['program_details']['latitude'] = loc_dict[f'{program_id}']['program_details']['latitude'] 
            main_dict[f'{program_id}']['program_details']['longitude'] = loc_dict[f'{program_id}']['program_details']['longitude'] 
        except KeyError as e:
            try:
                main_dict[f'{program_id}']['program_details']['latitude'] = loc_dict[f'{program_id}']['latitude']
                main_dict[f'{program_id}']['program_details']['longitude'] = loc_dict[f'{program_id}']['longitude']
            except KeyError as e:
                main_dict[f'{program_id}']['program_details']['latitude'] = 0
                main_dict[f'{program_id}']['program_details']['longitude'] = 0
    
    with open("data.json", "w") as file:
        json.dump(main_dict, file, indent=4)

except FileNotFoundError:
    print("Error: 'data.json' not found. Please create the file.")
except json.JSONDecodeError:
    print("Error: Invalid JSON format in 'data.json'.")
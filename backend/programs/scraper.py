import requests
from bs4 import BeautifulSoup
import re
import json
from urllib.parse import parse_qs, urlparse
import requests
import time


def scrape_all_program_ids():
    """
    Scrapes all program IDs from the Vanderbilt global education office search results page.
    
    Returns:
        list: List of program IDs found on the page
    """
    search_url = "https://www.vanderbilt.edu/study-abroad/program-search-results/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    program_ids = []
    
    try:
        print(f"Fetching program search results")
        response = requests.get(search_url, headers=headers)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        tbody = soup.find('tbody')
        
        if tbody:
            for row in tbody.find_all('tr'):
                for cell in row.find_all('td'):
                    for link in cell.find_all('a', href=True):
                        href = link['href']
                        # look for links with program_id
                        if 'program_id=' in href:
                            match = re.search(r'program_id=(\d+)', href)
                            if match:
                                program_ids.append(match.group(1))
        
        program_ids = sorted(list(set(program_ids)), key=int)
        
        print(f"Found {len(program_ids)} unique program IDs")
        return program_ids
        
    except requests.RequestException as e:
        print(f"Error fetching search results: {e}")
        return []
    except Exception as e:
        print(f"Error parsing search results: {e}")
        return []


def scrape_multiple_programs(program_ids):
    """
    Scrapes data for multiple programs.

    Args:
        program_ids (list): List of program IDs to scrape
        
    Returns:
        dict: Dictionary with program_id as key and program data as value
    """
    all_data = {}
    
    for program_id in program_ids:
        print(f"\nScraping program ID: {program_id}")
        data = scrape_vanderbilt_study_abroad(program_id)
        if data:
            all_data[program_id] = data
        else:
            print(f"Failed to scrape data for program ID: {program_id}")
    
    return all_data


def scrape_vanderbilt_study_abroad(program_id):
    """
    Scrapes study abroad program data from Vanderbilt's website.
    
    Args:
        program_id (str): The program ID to scrape data for
        
    Returns:
        dict: Dictionary containing all scraped data
    """
    
    program_url = f"https://www.vanderbilt.edu/study-abroad/programs/?program_id={program_id}"
    budget_url = f"https://www.vanderbilt.edu/study-abroad/budgets/?program_id={program_id}"
    
    # where results will be stored
    result = {
        "program_id": program_id,
        "program_details": {},
        "budget_info": {}
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # main page
        print(f"Fetching program details from: {program_url}")
        response = requests.get(program_url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        result['program_details']['name'] = soup.find(class_='topper-default__title').get_text(strip=True)
        result['main_page_url'] = program_url
        
        # program homepage
        homepage_link = soup.find("a", string=re.compile(r"Visit Program Homepage", re.I))
        if homepage_link and homepage_link.has_attr("href"):
            result["homepage_url"] = homepage_link["href"]
        else:
            result["homepage_url"] = None
        
        # get basic program details
        program_stats = soup.find(class_='program-stats')
        if program_stats:
            for ul in program_stats.find_all('ul'):
                for li in ul.find_all('li'):
                    text = li.get_text(strip=True)
                    print(text)
                    
                    if 'Academic Calendar' in text:
                        result["program_details"]["academic_calendar"] = text.replace('Academic Calendar', '').strip()
                    elif 'Program Type' in text:
                        result["program_details"]["program_type"] = text.replace('Program Type', '').strip()
                    elif 'Minimum GPA' in text:
                        result["program_details"]["minimum_gpa"] = text.replace('Minimum GPA', '').strip()
                    elif 'Language Prerequisite' in text:
                        result["program_details"]["language_prerequisite"] = text.replace('Language Prerequisite', '').strip()
                    elif 'Additional Prerequisites' in text:
                        result["program_details"]["additional_prerequisites"] = text.replace('Additional Prerequisites', '').strip()
                    elif 'Housing' in text and 'Housing' not in result["program_details"]:
                        result["program_details"]["housing"] = text.replace('Housing', '').strip()
                     
        # get all paragraph sections
        sections = []
        for h2 in soup.find_all("h2"):
            title = h2.get_text(strip=True)
            paragraphs = []

            for sibling in h2.find_next_siblings():
                if sibling.name == "h2":
                    break  # stop at next section
                if sibling.name == "p":
                    paragraphs.append(sibling.get_text(strip=True))
                elif sibling.name in ["ul", "ol"]:
                    items = [li.get_text(strip=True) for li in sibling.find_all("li")]
                    paragraphs.extend(items)
            sections.append({
                "title": title,
                "content": paragraphs
            })
            result['sections'] = sections
        
        print(f"Fetching budget information from {budget_url}")
        response = requests.get(budget_url, headers=headers)
        response.raise_for_status()
        
        result['budget_page_url'] = budget_url        
        
        soup = BeautifulSoup(response.text, 'html.parser')

        content = soup.get_text()
        
        # find all occurrences of total estimated cost
        pattern = r'(Spring|Academic Year)\s+(\d{4})\s*Total Estimated Cost to Study Abroad:\s*\$([0-9,]+)'
        matches = re.findall(pattern, content)
        
        for match in matches:
            term, year, cost = match
            term_key = f"{term.lower()}_{year}"
            result["budget_info"][term_key] = {
                "term": term,
                "year": year,
                "total_estimated_cost": f"${cost}"
            }
        
        if not result["budget_info"]:
            cost_pattern = r'Total Estimated Cost to Study Abroad:\s*\$([0-9,]+)'
            cost_match = re.search(cost_pattern, content)
            if cost_match:
                result["budget_info"]["total_estimated_cost"] = f"${cost_match.group(1)}"
        
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        return None
    except Exception as e:
        print(f"Error parsing data: {e}")
        return None
    
    return result


def main():
    ## SCRAPE SINGLE PROGRAM ##
    # print("=== SCRAPING SINGLE PROGRAM (ID: 2261) ===")
    # data = scrape_vanderbilt_study_abroad("2261")
    
    # if data:
    #     print("\n=== VANDERBILT STUDY ABROAD PROGRAM DATA ===\n")
        
    #     print("PROGRAM DETAILS:")
    #     print("-" * 40)
    #     for key, value in data["program_details"].items():
    #         print(f"{key.replace('_', ' ').title()}: {value}")
        
    #     print("\nBUDGET INFORMATION:")
    #     print("-" * 40)
    #     if data["budget_info"]:
    #         for term_info in data["budget_info"].values():
    #             if isinstance(term_info, dict):
    #                 print(f"{term_info['term']} {term_info['year']}: {term_info['total_estimated_cost']}")
    #             else:
    #                 print(f"Total Estimated Cost: {term_info}")
        
        # with open(f"vanderbilt_program_{data['program_id']}.json", 'w') as f:
        #     json.dump(data, f, indent=2)
        # print(f"\nData saved to: vanderbilt_program_{data['program_id']}.json")
    
    ## SCRAPE ALL DATA ##
    print("\n\n=== SCRAPING ALL PROGRAM IDs ===")
    program_ids = scrape_all_program_ids()
    
    if program_ids:
        print(f"\nProgram IDs found: {program_ids}")
        
        print("\n=== SCRAPING DATA FOR ALL PROGRAMS ===")
        all_data = scrape_multiple_programs(program_ids)
        
        with open("vanderbilt_all_programs.json", 'w') as f:
            json.dump(all_data, f, indent=2)
        print(f"\nAll program data saved to: vanderbilt_all_programs.json")
    else:
        print("No program IDs found.")


if __name__ == "__main__":
    main()
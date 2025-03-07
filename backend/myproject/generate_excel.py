import pandas as pd
from openpyxl import Workbook

# Extract prime ministers data
prime_ministers_text = "The top Pakistani prime ministers in the last 40 years include: 1. **Benazir Bhutto** - She served two non-consecutive terms from 1988 to 1990 and 1993 to 1996, becoming the first woman to lead a Muslim-majority country. 2. **Nawaz Sharif** - He served three non-consecutive terms, with his most notable term from 2013 to 2017, during which he was disqualified from office. 3. **Imran Khan** - He was the prime minister from 2018 to 2022, known for his popularity and the no-confidence vote that led to his ousting. 4. **Shehbaz Sharif** - He took office in April 2022 following Imran Khan's removal and served until August 2023. These leaders have played significant roles in shaping Pakistan's political landscape over the past four decades."

# Extract football teams data
football_teams_text = "The best football teams in the world according to the scraped content are: 1. Liverpool FC (England) 2. Paris Saint-Germain (France) 3. Arsenal (England) 4. Real Madrid (Spain) 5. Bayer Leverkusen (Germany) 6. Inter Milan (Italy) 7. Bayern München (Germany) 8. Barcelona (Spain) 9. Atlético Madrid (Spain) 10. Manchester City (England)."

# Parse prime ministers data
prime_ministers = [
    {"Name": "Benazir Bhutto", "Terms": "1988-1990, 1993-1996"},
    {"Name": "Nawaz Sharif", "Terms": "2013-2017"},
    {"Name": "Imran Khan", "Terms": "2018-2022"},
    {"Name": "Shehbaz Sharif", "Terms": "2022-2023"},
]

# Parse football teams data
football_teams = [
    {"Team": "Liverpool FC", "Country": "England"},
    {"Team": "Paris Saint-Germain", "Country": "France"},
    {"Team": "Arsenal", "Country": "England"},
    {"Team": "Real Madrid", "Country": "Spain"},
    {"Team": "Bayer Leverkusen", "Country": "Germany"},
    {"Team": "Inter Milan", "Country": "Italy"},
    {"Team": "Bayern München", "Country": "Germany"},
    {"Team": "Barcelona", "Country": "Spain"},
    {"Team": "Atlético Madrid", "Country": "Spain"},
    {"Team": "Manchester City", "Country": "England"},
]

# Create DataFrames
df_prime_ministers = pd.DataFrame(prime_ministers)
df_football_teams = pd.DataFrame(football_teams)

# Write to Excel file
with pd.ExcelWriter('abc.xlsx', engine='openpyxl') as writer:
    df_prime_ministers.to_excel(writer, sheet_name='Pakistani PMs', index=False)
    df_football_teams.to_excel(writer, sheet_name='Football Teams', index=False)
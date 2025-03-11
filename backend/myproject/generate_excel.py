import pandas as pd

# Data for football players and their goals
football_data = [
    {"Rank": 1, "Player": "Lionel Messi", "Team": "Barcelona", "Season": "2011/12", "Goals": 73},
    {"Rank": 2, "Player": "Ferenc Deak", "Team": "Szentlorinci", "Season": "1945/46", "Goals": 66},
    {"Rank": 2, "Player": "Gerd Muller", "Team": "Bayern Munich", "Season": "1972/73", "Goals": 66},
    {"Rank": 4, "Player": "Dixie Dean", "Team": "Everton", "Season": "1927/28", "Goals": 63},
    {"Rank": 5, "Player": "Cristiano Ronaldo", "Team": "Real Madrid", "Season": "2014/15", "Goals": 61},
    {"Rank": 6, "Player": "Cristiano Ronaldo", "Team": "Real Madrid", "Season": "2011/12", "Goals": 60},
    {"Rank": 6, "Player": "Lionel Messi", "Team": "Barcelona", "Season": "2012/13", "Goals": 60},
    {"Rank": 8, "Player": "Ferenc Deak", "Team": "Ferencvaros", "Season": "1948/49", "Goals": 59},
    {"Rank": 8, "Player": "Luis Suarez", "Team": "Barcelona", "Season": "2015/16", "Goals": 59},
    {"Rank": 10, "Player": "Lionel Messi", "Team": "Barcelona", "Season": "2014/15", "Goals": 58}
]

# Data for cricket players and their runs
cricket_data = [
    {"Rank": 1, "Player": "KC Sangakkara", "Country": "SL", "Runs": 2868, "Year": 2013},
    {"Rank": 2, "Player": "RT Ponting", "Country": "AUS/ICC", "Runs": 2833, "Year": 2005},
    {"Rank": 3, "Player": "V Kohli", "Country": "IND", "Runs": 2818, "Year": 2017},
    {"Rank": 4, "Player": "V Kohli", "Country": "IND", "Runs": 2735, "Year": 2018},
    {"Rank": 5, "Player": "KS Williamson", "Country": "NZ", "Runs": 2692, "Year": 2015}
]

# Create dataframes
football_df = pd.DataFrame(football_data)
cricket_df = pd.DataFrame(cricket_data)

# Write dataframes to separate sheets in an Excel file
with pd.ExcelWriter('abc.xlsx') as writer:
    football_df.to_excel(writer, sheet_name='Football Goals', index=False)
    cricket_df.to_excel(writer, sheet_name='Cricket Runs', index=False)
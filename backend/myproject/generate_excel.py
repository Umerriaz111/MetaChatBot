import pandas as pd

# Data parsing
football_data = [
    "1. Lionel Messi (Barcelona) – 2011/12 – 73 Goals",
    "2. Ferenc Deak (Szentlorinci) – 1945/46 – 66 Goals",
    "2. Gerd Muller (Bayern Munich) – 1972/73 – 66 Goals",
    "4. Dixie Dean (Everton) – 1927/28 – 63 Goals",
    "5. Cristiano Ronaldo (Real Madrid) – 2014/15 – 61 Goals",
    "6. Cristiano Ronaldo (Real Madrid) – 2011/12 – 60 Goals",
    "6. Lionel Messi (Barcelona) – 2012/13 – 60 Goals",
    "8. Ferenc Deak (Ferencvaros) – 1948/49 – 59 Goals",
    "8. Luis Suarez (Barcelona) – 2015/16 – 59 Goals",
    "10. Lionel Messi (Barcelona) – 2014/15 – 58 Goals"
]

cricket_data = [
    "1. KC Sangakkara (SL) - 2868 runs in 2013",
    "2. RT Ponting (AUS/ICC) - 2833 runs in 2005",
    "3. V Kohli (IND) - 2818 runs in 2017",
    "4. V Kohli (IND) - 2735 runs in 2018",
    "5. KS Williamson (NZ) - 2692 runs in 2015"
]

# Structuring football data
football_records = []
for item in football_data:
    parts = item.split(" – ")
    rank_name_team = parts[0].split(". ")
    goals = parts[2].replace(" Goals", "")
    name_team = rank_name_team[1].rsplit(" (", 1)
    name = name_team[0]
    team = name_team[1][:-1]
    season = parts[1]
    football_records.append({"Rank": rank_name_team[0], "Name": name, "Team": team, "Season": season, "Goals": goals})

football_df = pd.DataFrame(football_records)

# Structuring cricket data
cricket_records = []
for item in cricket_data:
    parts = item.split(" - ")
    rank_name_team = parts[0].split(". ")
    runs_year = parts[1].split(" runs in ")
    name_team = rank_name_team[1].rsplit(" (", 1)
    name = name_team[0]
    team = name_team[1][:-1]
    runs = runs_year[0]
    year = runs_year[1]
    cricket_records.append({"Rank": rank_name_team[0], "Name": name, "Team": team, "Runs": runs, "Year": year})

cricket_df = pd.DataFrame(cricket_records)

# Writing to Excel
with pd.ExcelWriter('abc.xlsx') as writer:
    football_df.to_excel(writer, sheet_name='Football', index=False)
    cricket_df.to_excel(writer, sheet_name='Cricket', index=False)
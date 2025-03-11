import pandas as pd

# Structuring the data into separate lists
professions = [
    {"Profession": "Physician", "Average Salary Range": "$171,285 to $282,496"},
    {"Profession": "Solar Sales Representative", "Average Salary Range": "$90,510 to $121,504"},
    {"Profession": "Medical Director", "Average Salary Range": "$302,490 to $363,214"},
    {"Profession": "Dentist", "Average Salary Range": "$175,292 to $220,861"},
    {"Profession": "Psychiatrist", "Average Salary Range": "$242,206 to $296,048"},
    {"Profession": "Principal Software Engineer", "Average Salary Range": "$119,335 to $142,721"},
    {"Profession": "Outside Sales Representative", "Average Salary Range": "$90,833 to $122,099"},
    {"Profession": "Chief Financial Officer (CFO)", "Average Salary Range": "$338,470 to $579,175"},
    {"Profession": "Veterinarian Radiologist", "Average Salary Range": "$160,000 to $287,000"},
    {"Profession": "Endodontist", "Average Salary Range": "$177,156 to $223,078"}
]

football = [
    {"Player": "Lionel Messi", "Goals": 73, "Season": "2011-12"}
]

# Creating DataFrames
df_professions = pd.DataFrame(professions)
df_football = pd.DataFrame(football)

# Writing to Excel with separate sheets
with pd.ExcelWriter('abc.xlsx') as writer:
    df_professions.to_excel(writer, sheet_name='Professions', index=False)
    df_football.to_excel(writer, sheet_name='Football', index=False)
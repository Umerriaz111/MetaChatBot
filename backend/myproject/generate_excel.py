import pandas as pd

# Data
data = [
    'The country with the most rivers in the world is Russia, which has over 36 major rivers. Other countries with significant numbers of rivers include Brazil with around 24 major rivers and Canada with approximately 12 major rivers.',
    'Brazil has the most rivers in the world by a significant margin, primarily due to its Amazon River system, which has over 1,100 tributaries. Other countries with extensive river networks include Russia, Canada, China, and the United States.',
    'The country with the most rivers in the world is Russia, which has over 36 major rivers. Other countries with significant numbers of rivers include Brazil with around 24 major rivers and Canada with approximately 12 major rivers.',
    'Brazil has the most rivers in the world by a significant margin, primarily due to its Amazon River system, which has over 1,100 tributaries. Other countries with extensive river networks include Russia, Canada, China, and the United States.',
    "The top 5 players with the most Ballon d'Or wins as of 2024 are: 1. Lionel Messi - 8 awards, 2. Cristiano Ronaldo - 5 awards, 3. Michel Platini - 3 awards, 4. Johann Cruyff - 3 awards, 5. Marco van Basten - 3 awards.",
    "The top 5 players with the most Ballon d'Or awards are: 1. Lionel Messi - 8 times, 2. Cristiano Ronaldo - 5 times, 3. Michel Platini - 3 times, 4. Johan Cruyff - 3 times.",
    "The top 5 players with the most Ballon d'Or awards as of 2024 are: 1. Lionel Messi - 8 awards, 2. Cristiano Ronaldo - 5 awards, 3. Michel Platini - 3 awards, 4. Johann Cruyff - 3 awards, 5. Marco van Basten - 3 awards.",
    "The top 5 players with the most Ballon d'Or awards are: 1. Lionel Messi - 8 wins (2009, 2010, 2011, 2012, 2015, 2019, 2021, 2023) 2. Cristiano Ronaldo - 5 wins (2008, 2013, 2014, 2016, 2017) 3. Michel Platini - 3 wins (1983, 1984, 1985) 4. Johan Cruyff - 3 wins (1971, 1973, 1974) 5. Marco van Basten - 3 wins (1988, 1989, 1992)"
]

# Extract river data
river_data = {
    'Country': ['Russia', 'Brazil', 'Canada', 'China', 'United States'],
    'Major Rivers': [36, 24, 12, 'Extensive', 'Extensive']
}

# Extract Ballon d'Or data
ballon_dor_data = {
    'Player': ['Lionel Messi', 'Cristiano Ronaldo', 'Michel Platini', 'Johann Cruyff', 'Marco van Basten'],
    'Awards': [8, 5, 3, 3, 3],
    'Years': [
        '2009, 2010, 2011, 2012, 2015, 2019, 2021, 2023',
        '2008, 2013, 2014, 2016, 2017',
        '1983, 1984, 1985',
        '1971, 1973, 1974',
        '1988, 1989, 1992'
    ]
}

# Create DataFrames
river_df = pd.DataFrame(river_data)
ballon_dor_df = pd.DataFrame(ballon_dor_data)

# Write data to Excel
with pd.ExcelWriter('abc.xlsx') as writer:
    river_df.to_excel(writer, sheet_name='Rivers', index=False)
    ballon_dor_df.to_excel(writer, sheet_name='Ballon dOr', index=False)
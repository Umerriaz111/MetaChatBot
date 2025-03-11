import pandas as pd
from io import StringIO

# Data
data_rivers = [
    {'Country': 'Russia', 'Major Rivers': 36},
    {'Country': 'Brazil', 'Major Rivers': 24},
    {'Country': 'Canada', 'Major Rivers': 12},
    {'Country': 'China', 'Major Rivers': 'Extensive network'},
    {'Country': 'United States', 'Major Rivers': 'Extensive network'}
]

data_ballon_dor = [
    {'Player': 'Lionel Messi', 'Awards': 8, 'Years': '2009, 2010, 2011, 2012, 2015, 2019, 2021, 2023'},
    {'Player': 'Cristiano Ronaldo', 'Awards': 5, 'Years': '2008, 2013, 2014, 2016, 2017'},
    {'Player': 'Michel Platini', 'Awards': 3, 'Years': '1983, 1984, 1985'},
    {'Player': 'Johan Cruyff', 'Awards': 3, 'Years': '1971, 1973, 1974'},
    {'Player': 'Marco van Basten', 'Awards': 3, 'Years': '1988, 1989, 1992'}
]

data_shoes = [
    {'Product': 'Vsufim Quick-Dry Water Sports Barefoot Shoes Aqua Socks for Swim Beach Pool Surf Yoga for Women Men',
     'Price': 5.94, 'Image URL': 'https://m.media-amazon.com/images/I/51FCX+Z8X8L._AC_UL320_.jpg'},
    {'Product': 'Limberun Water Shoes for Women Men Swim Beach Shoes',
     'Price': 9.98, 'Image URL': 'https://m.media-amazon.com/images/I/617fZ5q3arL._AC_UL320_.jpg'},
    {'Product': 'ATHMILE Quick-Dry Aqua Socks Swim Beach Barefoot Yoga Exercise Wear Sport Accessories Pool Camping Must Haves Adult Youth Size',
     'Price': 6.99, 'Image URL': 'https://m.media-amazon.com/images/I/61GzQfBa+lL._AC_UL320_.jpg'},
    {'Product': 'Laura Ashley Soft Terry Knot Scuff Slippers for Women',
     'Price': 6.99, 'Image URL': 'https://m.media-amazon.com/images/I/71PzOIxOwcL._AC_UL320_.jpg'},
    {'Product': 'Cosyone1997 Cute Animal Slippers for Kids Girls Women',
     'Price': 9.99, 'Image URL': 'https://m.media-amazon.com/images/I/71qqzJ5O4IL._AC_UL320_.jpg'},
    {'Product': 'WateLves Womens and Mens Kids Water Shoes Barefoot Quick-Dry Aqua Socks for Beach Swim Surf Yoga Exercise',
     'Price': 7.96, 'Image URL': 'https://m.media-amazon.com/images/I/51LONA7bXKL._AC_UL320_.jpg'}
]

# Create DataFrames
df_rivers = pd.DataFrame(data_rivers)
df_ballon_dor = pd.DataFrame(data_ballon_dor)
df_shoes = pd.DataFrame(data_shoes)

# Write to Excel
with pd.ExcelWriter('abc.xlsx') as writer:
    df_rivers.to_excel(writer, sheet_name='Major Rivers', index=False)
    df_ballon_dor.to_excel(writer, sheet_name="Ballon d'Or Awards", index=False)
    df_shoes.to_excel(writer, sheet_name='Shoes Under $10', index=False)
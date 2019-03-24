import json

f1 = open("data/laura-short-term-top-artists.json", "r")
f2 = open("data/laura-long-term-top-artists.json", "r")
short_term = json.load(f1)
long_term = json.load(f2)

out_file = open("data/laura-short-long-term.json", "w")
new_dict = {"short_term":short_term, "long_term":long_term}
json.dump(new_dict, out_file)


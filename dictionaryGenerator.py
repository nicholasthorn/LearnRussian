f = open('dictionary.txt', 'r', encoding='utf-8')
dict = open('dictionary.js', 'w', encoding='utf-8')
dict.write('var DICTIONARY = [')

for line in f:
	words = line.split(',')
	dict.write('[\"' + words[0] + '\",\"' + words[1].rstrip() + '\"],\n')
	
dict.write('];')
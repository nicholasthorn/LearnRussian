f = open('dictionary.txt', 'r', encoding='utf-8')
dict = open('dictionary.js', 'w', encoding='utf-8')
dict.write('var DICTIONARY = [')

f = sorted(f, key=lambda x: len(x.split(',')[1]))

for line in f:
	words = line.split(',')
	dict.write('[\"' + words[0].rstrip() + '\",\"' + words[1].rstrip() + '\",\"' + words[2].rstrip() + '\"],\n')
	
dict.write('];')
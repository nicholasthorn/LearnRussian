f = open('dictionaryRaw.txt', 'r', encoding='utf-8')
dict = open('dictionary.txt', 'w', encoding='utf-8')

for line in f:
	words = line.split('\t')
	english = words[2].split(',')
	for homonym in english:
		if len(homonym) > 1:
			dict.write(homonym.lstrip() + ',' + words[1].rstrip() + ',' + words[3])

dict.close()
f.close()

with open("x.txt", "r") as file:
    content = file.read()

lines = content.splitlines()

keys = []

for (l1, l2) in zip(lines, lines[1:]):
    if l1.startswith("POLYMPIADS"):
        for j in range(int(l2.split()[0])):
            keys.append(l1)

import random
print(random.choice(keys))

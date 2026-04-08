import urllib.request
import re

for letter in ['A', 'B', 'C']:
    url = f'https://giphy.com/search/sign-with-robert-letter-{letter}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        links = re.findall(r'https://media[A-Za-z0-9\.]*giphy\.com/media/[A-Za-z0-9]+/giphy\.mp4', html)
        if links:
            print(f"{letter}: {links[0]}")
    except Exception as e:
        print(f"Error {letter}: {e}")

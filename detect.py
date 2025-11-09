import asyncio
import json
import sys

from shazamio import Shazam


async def main():
    arg = sys.argv[1]
    shazam = Shazam()
    out = await shazam.recognize_song(arg)
    print(json.dumps(out))


loop = asyncio.get_event_loop()
loop.run_until_complete(main())


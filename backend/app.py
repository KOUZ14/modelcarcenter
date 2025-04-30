from flask import Flask, request, jsonify
from scraper import scrape_stmdiecast, scrape_livecarmodel
from flask_cors import CORS
from markupsafe import escape
import logging
import asyncio

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# 🚨 Enable full CORS for development
CORS(app)  # ← remove any previous `CORS(app, ...)` lines

@app.route('/search', methods=['GET'])
async def search():
    query = f"{escape(request.args.get('q'))}"
    if not query:
        return jsonify({'error': 'Missing query'}), 400

    # 🔧 Wrap coroutines in tasks
    stm_task = asyncio.create_task(scrape_stmdiecast(query))
    lcm_task = asyncio.create_task(scrape_livecarmodel(query))

    # Return partial results as they complete
    done, pending = await asyncio.wait([stm_task, lcm_task], return_when=asyncio.FIRST_COMPLETED)

    results = []
    for task in done:
        results.extend(await task)

    for task in pending:
        results.extend(await task)

    logging.debug("Results: %s", results)
    if not results:
        return jsonify({'error': 'No results found'}), 404

    return jsonify(results)


if __name__ == '__main__':
    app.run(debug=True, port=5000)  # 🔁 Make sure you're on port 5000

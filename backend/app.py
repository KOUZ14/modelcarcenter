from flask import Flask, request, jsonify
from scraper import scrape_stmdiecast, scrape_livecarmodel
from flask_cors import CORS




app = Flask(__name__)
CORS(app)

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q')
    if not query:
        return jsonify({'error': 'Missing query'}), 400

    stm_results = scrape_stmdiecast(query)
    lcm_results = scrape_livecarmodel(query)
    all_results =  lcm_results + stm_results
    return jsonify(all_results)

if __name__ == '__main__':
    app.run(debug=True)

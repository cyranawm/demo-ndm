import sys

from flask import Flask, render_template, request, redirect, Response
import random, json

from flask_cors import CORS, cross_origin
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
def output():
    # serve index template
    return render_template('index.html')


@app.route('/receiver', methods=['POST'])
def worker():
    # read json + reply
    data = request.get_json()

    print(data)


    return "200 OK"


if __name__ == "__main__":
    app.run()

from bottle import post, request, run, response
from threading import Thread

from control import Control


@post('/control')
def control():
    if request.json is None:  
        print("Error: Invalid JSON", 400)
        response.status = 400
        return None

    token = request.headers.get('Open-Shock-Token')
    shock = request.json.get('shocks')[0]   # Assuming 1 shock/request

    # Prevent blocking in Beam by waiting for whole round trip
    Thread(target=reqShock, args=(token, shock), daemon=True).start()

    return None


def reqShock(token, shock):
    id = shock['id']
    type_ = shock['type']
    intensity = shock['intensity']
    duration = shock['duration']
    
    c = Control(token, 'BeamShock/0.0.1')
    req = c.get_prepared_req(id, type_, intensity, duration)
    return c.send(req)
    

if __name__ == '__main__':
    run(host='localhost',port=5858, debug=False)
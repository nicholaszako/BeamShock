from bottle import post, request, run, response
from threading import Thread
import json
import serial

from control import Control


@post('/send')
def send():
    if request.json is None:  
        print("Error: Invalid JSON", 400)
        response.status = 400
        return None

    token = request.headers.get('Open-Shock-Token')
    shock = request.json.get('shocks')[0]   # Assuming 1 shock/request
    serial = request.json.get('serial')
    com = request.json.get('com')

    # Prevent blocking in Beam while waiting for whole round trip
    if com == 'api':
        Thread(target=sendWebMessage, args=(token, shock), daemon=True).start()
    elif com == 'ser':
        Thread(target=sendSerialMessage, args=(serial, shock), daemon=True).start()
    else:
        print('Unrecognized communication mode: ', com)
        

    return None

def sendWebMessage(token, shock):
    id = shock['id']
    type_ = shock['type']
    intensity = shock['intensity']
    duration = shock['duration']

    c = Control(token, 'BeamShock/0.0.1')
    req = c.get_prepared_req(id, type_, intensity, duration)
    return c.send(req)
    
def sendSerialMessage(serialDict, shockDict):
    messageDict = {
        'model': serialDict['model'],
        'id': serialDict['rfId'],
        'type': shockDict['type'],
        'intensity': shockDict['intensity'],
        'durationMs': shockDict['duration']
    }
    # Hub expects json message sent as bytes
    # Firmware ref: src/serial/command_handlers/rftransmit.cpp
    messageJson = json.dumps(messageDict)
    message_str = f'rftransmit {messageJson}\n'
    message_bytes = message_str.encode('utf-8')
    port = serialDict['port']
    baudrate = 115200
    
    print(message_str)
    with serial.Serial(port, baudrate, timeout=1) as ser:
        ser.write(message_bytes)
    
    return True

if __name__ == '__main__':
    run(host='localhost',port=5858, debug=False)
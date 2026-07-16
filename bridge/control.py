# This module is for v2 "Shockers" Control API
# https://api.openshock.app/scalar/viewer/#version-2/tag/shockers/POST/2/shockers/control
from requests import Request, PreparedRequest, Session


class Control():

    def __init__(self, token: str, user_agent: str):
        self.token = token
        self.user_agent = user_agent

    # Prepare a request that can be sent repeatedly
    def get_prepared_req(self, id: str, type_: str, intensity: int, 
                 duration: int) -> PreparedRequest:
        VALID_TYPES = ['Stop', 'Shock', 'Vibrate', 'Sound']
        MIN_INTENSITY = 0
        MAX_INTENSITY = 100
        MIN_DURATION = 300
        MAX_DURATION = 65535 

        # Validating parameters
        if(not type_ in VALID_TYPES):
            raise Exception(f'Invalid control type: {type_}')
        if(intensity < MIN_INTENSITY or intensity > MAX_INTENSITY):
            raise Exception(f'Intensity {intensity} out of range')
        if(duration < MIN_DURATION or duration > MAX_DURATION):
            raise Exception(f'Duration {duration} out of range')
        
        # Prep request
        url = 'https://api.openshock.app/2/shockers/control'
        json = {
            'shocks': [
                {
                    'id': id,
                    'type': type_,
                    'intensity': intensity,
                    'duration': duration
                }
            ],
        }
        headers = {
                'User-Agent': self.user_agent,
                'Content-Type': 'application/json',
                'Open-Shock-Token': self.token
        }
        req = Request('POST', url, json=json, headers=headers)
        prepped = req.prepare()
        return prepped

    def send(self, prepped_req):
        s = Session()
        res = s.send(prepped_req)

        # Handle response
        if res.ok:
            print(f'Control message sent!')
            return True
        else:
            print(f'[{res.status_code}] Error sending control message.')
            print(f'OpenShock responded with [{res.status_code}] {res.reason}')
            return False



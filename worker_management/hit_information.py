import boto3
from .mturk_core import client

def get_hit_information(hitid):
    try:
        return client.get_hit(HITId=hitid)
    except client.exceptions.ServiceFault:
        return None
    except client.exceptions.RequestError:
        return None

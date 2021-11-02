import os
import boto3

def _setup_mturk_client():
    # boto3.client(
    #     service,
    #     aws_access_key_id=ACCESS_KEY,
    #     aws_secret_access_key=SECRET_KEY,)

    aws_id = os.environ['AWS_ID']
    aws_key = os.environ['AWS_KEY']

    region = 'us-east-1'
    endpoint_url = 'https://mturk-requester.us-east-1.amazonaws.com'

    return boto3.client('mturk', endpoint_url=endpoint_url,
            region_name=region,
            aws_access_key_id=aws_id,
            aws_secret_access_key=aws_key)

client = _setup_mturk_client()

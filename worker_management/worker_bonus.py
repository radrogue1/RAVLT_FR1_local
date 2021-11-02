import boto3
import sqlalchemy as sql
from sqlalchemy.ext.declarative import declarative_base
from .mturk_core import client


def updated_bonus_table():
    pass

def bonus_workers(client, subjectdb):
    #     WorkerId='string',
    #     BonusAmount='string',
    #     AssignmentId='string',
    #     Reason='string',
    #     UniqueRequestToken='string'
    # )

    for w in workers:
        try:
            pass
        except client.meta.client.exceptions.ServiceFault:
            pass
        except client.meta.client.exceptions.RequestError:
            pass

import boto3
import os
from .mturk_core import client


def get_qualifications(client):
    # response = client.list_qualification_types(
    #     Query='string',
    #     MustBeRequestable=True|False,
    #     MustBeOwnedByCaller=True|False,
    #     NextToken='string',
    #     MaxResults=123
    # )

    # filter down to name: ID
    qual_dict = client.list_qualification_types(MustBeRequestable=False, MustBeOwnedByCaller=True)

    ret_dict = {}
    for qual in qual_dict["QualificationTypes"]:
        ret_dict[qual["Name"]] = qual["QualificationTypeId"]

    return ret_dict



def get_workers_with_qualification(client, qualification_type):
    #     client.list_workers_with_qualification_type(
    #     QualificationTypeId='string',
    #     Status='Granted'|'Revoked',
    #     NextToken='string',
    #     MaxResults=123
    # )

    workers = client.list_workers_with_qualification_type(
            QualificationTypeId = qualification_type,
            Status='Granted'
            )

    return [w['WorkerId'] for w in workers['Qualifications']]


def add_qualification_to_workers(client, workers, qualification_type):
    # client.associate_qualification_with_worker(
    #     QualificationTypeId='string',
    #     WorkerId='string',
    #     IntegerValue=123,
    #     SendNotification=True|False
    # )

    already_assigned = get_workers_with_qualification(client, qualification_type)

    workers = [w for w in workers if w not in already_assigned]

    for w in workers:
        # check if already associated
        try:
            client.associate_qualification_with_worker(
                QualificationTypeId = qualification_type,
                WorkerId=w,
                SendNotification=False,
            )
        except Exception as e:
            print(e)
            print("error with worker {}.".format(w))

def create_qualification(client, **kwargs):
    # client.create_qualification_type(
    #     Name='string',
    #     Keywords='string',
    #     Description='string',
    #     QualificationTypeStatus='Active'|'Inactive',
    #     RetryDelayInSeconds=123,
    #     Test='string',
    #     AnswerKey='string',
    #     TestDurationInSeconds=123,
    #     AutoGranted=True|False,
    #     AutoGrantedValue=123
    # ) 

    return client.create_qualification_type(
        **kwargs
        )

if __name__ == "__main__":
    qualifications = get_qualifications(client)

    print("Please select a qualification to add to workers")
    for i, q in enumerate(sorted(qualifications.keys())):
        print("{}: {}".format(i, q))

    print("{}: new qualification".format(len(qualifications.keys())))
    print()

    selection = int(input())
    qual_id = None

    if selection < 0 or selection > len(qualifications.keys()):
        raise Exception("Invalid selection")
    elif selection < len(qualifications.keys()):
        name = sorted(qualifications.keys())[selection]
        qual_id = qualifications[name]
    else:
        print("Please enter (unique) qualification name")
        name = input()

        print("Please enter description")
        description = input()

        info = {"Name": name, 
                "Description": description, 
                "AutoGranted": False, 
                "QualificationTypeStatus": "Active"}

        qual = create_qualification(client, **info)
        qual_id = qual["QualificationType"]["QualificationTypeId"]

    print("Please enter the path to the worker file.")
    worker_file = os.path.abspath(os.path.expanduser(input()))

    with open(worker_file, 'r') as f:
        workers = [worker.strip() for worker in f.readlines()]

    add_qualification_to_workers(client, workers, qual_id)

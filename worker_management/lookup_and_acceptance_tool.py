import os
import json
from worker_management import get_hit_information, DBManager
from argparse import ArgumentParser

codes = {0: "NOT_ACCEPTED",
         1: "ALLOCATED",
         2: "STARTED",
         3: "COMPLETED",
         4: "SUBMITTED",
         5: "CREDITED",
         6: "QUITEARLY",
         7: "BONUSED" }

def lookup_and_acceptance_tool(id_db):
    """
    Load worker ID/subject ID map JSON file and enter ID numbers when prompted to print the subject/worker ID that
    corresponds to them. As a shortcut, you can enter just the integer of a participant's number, e.g. 42 to look up
    MTK0042. Also checks whether that participant's submission was accepted or rejected, and asks whether you wish to
    accept or reject any new participant's submission.

    Requires administrator privileges to access IDs.
    """

    ##########
    #
    # UI Loop
    #
    ##########
    while True:
        inp = input('Please enter a worker or leave blank to exit: ').strip()
        if inp == '':
            break
        if inp.isnumeric() and len(inp) <= 4:
            inp = f'MTK{inp:4d}'

        # Determine the subject ID (should be of the form "MTK####"). We only use subject IDs in the acceptance record.
        if workid := id_db.get_worker_id(inp[3:]):
            subjid = inp

        elif subjid := id_db.get_anonymous_id(inp):
            workid = inp

        else:
            print("Worker or assignment not found\n")
            continue

        print(f"Reviewing assignment for {workid}:{subjid}") 
        print()

        assignment = choose_assignment(id_db, workid)

        if not assignment:
            continue 
        else:
            review_assignment(id_db, assignment)

def choose_assignment(id_db, workid):
    print("Experiments completed:")
    assignments = id_db.get_assignments_for_worker(workid) 

    for i,a in enumerate(assignments):
        print(f"{i}: {a.experiment}")
    print()

    while True:
        choice = input("Choose an experiment to review, enter an assignment id, or leave blank to skip: ").strip()
        ids = [a.assignmentid for a in assignments]

        try:
            index = int(choice) if len(choice) <= len(ids) // 10 + 1 else -1
        except ValueError:
            index = -1

        if choice == '':
            return None
        elif choice in ids:
            return assignments[ids.index(choice)]
        elif index < len(assignments) and index >= 0:
            return assignments[index]
        else:
            print(f"Please enter an assignment ID or integer corresponding to the task above")

def review_assignment(id_db, assignment):
    
    uniqueid = assignment.uniqueid
    data = id_db.get_assignment_record(uniqueid)

    print()
    print("Assignment Data")
    print("---------------")
    print(f"status: {codes[data.status]}\n"
          f"mode: {data.mode}\n"
          f"assignment id: {data.assignmentid}\n"
          f"HIT id: {data.hitid}\n"
          f"accepted: {assignment.accepted}\n"
          f"paid: {assignment.paid}\n"
          f"excluded: {assignment.excluded}\n"
          f"value: {get_hit_information(assignment.hitid)['HIT']['Reward']}")
    print()

    while True:
        accept = input('Enter 1 to ACCEPT, 0 to REJECT, or leave blank to leave unchanged: ').strip()
        print()
        if accept == '0':
            id_db.update_acceptance_status(uniqueid, False)
            break
        elif accept == '1':
            id_db.update_acceptance_status(uniqueid, True)
            break
        elif accept == '':
            break
        else:
            print('Invalid input!')


    while True:
        paid = input('Enter 1 if PAID, 0 if UNPAID, or leave blank to leave unchanged: ').strip()
        print()
        if paid == '0':
            id_db.update_payment_status(uniqueid, False)
            break
        elif paid == '1':
            id_db.update_payment_status(uniqueid, True)
            break
        elif accept == '':
            break
        else:
            print('Invalid input!')



if __name__ == "__main__":
    ##########
    #
    # Load ID map and acceptance record
    #
    ##########
    parser = ArgumentParser(description="Tool for reviewing kahanalab mturk subjects")
    parser.add_argument("--database", help="path to subject tracker db", required=True)
    parser.add_argument("--experiments", nargs='*', help="experiments to update records, should be all running experiments", default=None, required=False)

    args = parser.parse_args()

    try:
        id_db = DBManager(args.database)
    except IOError:
        raise Exception('Unable to load ID map. You may not have permission to access it.')

    if args.experiments:
        for exp in args.experiments:
            id_db.add_workers_from_experiment(exp)
            id_db.update_acceptance_tracker(exp)

    lookup_and_acceptance_tool(id_db)

from worker_management import DBManager
import os
from argparse import ArgumentParser
from shutil import copyfile
import time

if __name__ == "__main__":
    args = ArgumentParser()
    args.add_argument("--source_db", nargs=1)
    args.add_argument("--dest_db", nargs=1)
    args.add_argument("--backup_dir", nargs=1)
    args.add_argument("--experiments", nargs="*")
    args.add_argument("--server", nargs=1)
    args.add_argument("--user", nargs=1)
    args = args.parse_args()
    
    # make backup
    copyfile(args.dest_db, os.path.join(os.path.basename(args.dest_db), f"{time.strftime('%Y%m%d-%H%M%S')}.db"))

    # create database managers
    source = DBManager(args.source_db)
    dest = DBManager(args.dest_db)
    
    # merge databases
    for exp in args.experiments:
        source.upsert_from_dbmanager(dest, exp)

    # TODO pay bonuses if due

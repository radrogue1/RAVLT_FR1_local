import sqlalchemy as sql
from sqlalchemy.ext.declarative import declarative_base, declared_attr
from sqlalchemy.orm import relationship


Base = declarative_base()

# class BonusTracker(Base):
#     __tablename__ = "bonus_tracker"
#     uniqueid = sql.Column(sql.String(50), primary_key=True, nullable=False)
#     assignmentid = sql.Column(sql.String(50), nullable=False) 
#     workerid = sql.Column(sql.String(50), sql.ForeignKey("master_list.workerid"), nullable=False)
#     bonus = sql.Column(sql.Float, default=0)
#     date_to_send = sql.Column(sql.Date)
#     date_sent = sql.Column(sql.Date)
#     sent = sql.Column(sql.Boolean, default=False)
#     requestid = sql.Column(sql.Integer)

class SubjectTracker(Base):
    __abstract__ = True
    assignmentid = sql.Column(sql.String(50), nullable=False) 
    workerid = sql.Column(sql.String(50), nullable=False)
    hitid = sql.Column(sql.String(50), nullable=False)
    ipaddress = sql.Column(sql.String(50), nullable=False)
    browser = sql.Column(sql.String(50), nullable=False)
    platform = sql.Column(sql.String(50), nullable=False)
    language = sql.Column(sql.String(50), nullable=False)
    cond = sql.Column(sql.Integer, nullable=False)
    counterbalance = sql.Column(sql.Integer, nullable=False)
    codeversion = sql.Column(sql.String(50))
    beginhit = sql.Column(sql.Date)
    beginexp = sql.Column(sql.Date)
    endhit = sql.Column(sql.Date)
    bonus = sql.Column(sql.Float)
    status = sql.Column(sql.Integer)
    mode = sql.Column(sql.String(50))
    datastring = sql.Column(sql.Text(4294967295))

    @declared_attr
    def uniqueid(cls):
        return sql.Column(sql.String(50), sql.ForeignKey("acceptance.uniqueid"), primary_key=True, nullable=False)

    @declared_attr
    def parent(cls):
        return relationship("AcceptanceTracker")
    
    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}

class CodeMapping(Base):
    __tablename__ = "master_list"
    anonymousid = sql.Column(sql.Integer, primary_key=True) 
    workerid = sql.Column(sql.String(50), nullable=False)

class AcceptanceTracker(Base):
    __tablename__ = "acceptance"
    uniqueid = sql.Column(sql.String(50), primary_key=True, nullable=False) 
    assignmentid = sql.Column(sql.String(50), nullable=False) 
    workerid = sql.Column(sql.String(50), nullable=False)
    hitid = sql.Column(sql.String(50), nullable=False)
    accepted = sql.Column(sql.Boolean, nullable=False, default=False)
    paid = sql.Column(sql.Boolean, nullable=False, default=False)
    excluded = sql.Column(sql.Boolean, nullable=False, default=False)
    experiment = sql.Column(sql.String(50))
    # TODO: add experiment name? or run query against multiple tables?

def get_class_by_tablename(tablename):
    """Return class reference mapped to table.

    :param tablename: String with name of table.
    :return: Class reference or None.
    """
    for c in Base._decl_class_registry.values():
        if hasattr(c, '__tablename__') and c.__tablename__ == tablename:
            return c
    
    return type(tablename, (SubjectTracker,), {'__tablename__': tablename})


class DBManager(object):

    '''
    NOT_ACCEPTED = 0
    ALLOCATED = 1
    STARTED = 2
    COMPLETED = 3
    SUBMITTED = 4
    CREDITED = 5
    QUITEARLY = 6
    BONUSED = 7
    '''

    def __init__(self, db_url):
        # TODO: handle permission error

        self.engine = sql.create_engine(db_url)
        self.Session = sql.orm.sessionmaker(bind=self.engine)
        Base.metadata.create_all(self.engine)


    def get_complete_subjects(self, experiment):
        session = self.Session()

        complete_statuses = [3, 4, 5, 7]
        TableClass = get_class_by_tablename(experiment)
        rows = session.query(TableClass).filter(sql.and_(TableClass.status.in_(complete_statuses),\
                                                         TableClass.mode.in_(["prolific", "live"]))).all()

        session.close()
        return rows


    def get_worker_id(self, anonymousid):
        session = self.Session()

        workerid = session.query(CodeMapping.workerid).filter_by(anonymousid=anonymousid).first()

        session.close()

        # row is None if not existing
        return workerid[0] if workerid else workerid


    def get_anonymous_id(self, workerid):
        session = self.Session()

        anonymousid = session.query(CodeMapping.anonymousid).filter_by(workerid=workerid).first()

        session.close()

        # row is None if not existing
        return f"MTK{anonymousid[0]:05d}" if anonymousid else anonymousid


    def get_assignment_record(self, uniqueid):
        session = self.Session()
        assignment = session.query(AcceptanceTracker).get(uniqueid) 
        TableClass = get_class_by_tablename(assignment.experiment)
        record = session.query(TableClass).get(uniqueid)

        session.close()
        return record 


    def get_assignments_for_worker(self, workerid):
        session = self.Session()
        assignments = session.query(AcceptanceTracker).filter(AcceptanceTracker.workerid == workerid).all()

        session.close()
        return assignments


    def add_workers_from_experiment(self, experiment):
        session = self.Session()

        TableClass = get_class_by_tablename(experiment)
        master_list = Base.metadata.tables['master_list']
        acceptance = Base.metadata.tables['acceptance']


        new_subjects = session.query(TableClass.workerid) \
                              .filter(sql.and_(~sql.sql.exists() \
                                                   .where(CodeMapping.workerid == TableClass.workerid),\
                                               TableClass.mode.in_(["live", "prolific"])))
        
        session.execute(master_list.insert() \
                                   .from_select(names=['workerid'], \
                                                select=new_subjects))

        new_subjects = session.query(TableClass.workerid,
                                     TableClass.uniqueid, 
                                     TableClass.assignmentid, 
                                     TableClass.hitid, 
                                     sql.literal(experiment)) \
                              .filter(sql.and_(~sql.sql.exists() \
                                                   .where(AcceptanceTracker.uniqueid == TableClass.uniqueid),
                                               TableClass.mode.in_(["live", "prolific"])))


        session.execute(acceptance.insert() \
                                  .from_select(names=['workerid', 'uniqueid', 'assignmentid', 'hitid', 'experiment'], \
                                               select=new_subjects, include_defaults=True))


        session.commit()
        session.close()

    def get_records_for_task(self, experiment):
        session = self.Session()
        TableClass = get_class_by_tablename(experiment)

        records = TableClass.query.all()

        session.close()
        return records 


    def get_assignments_for_task(self, experiment):
        session = self.Session()
        TableClass = get_class_by_tablename(experiment)

        assignments = session.query(AcceptanceTracker).filter(TableClass.workerid == AcceptanceTracker.workerid).all()
        
        session.close()

        return assignments


    def update_acceptance_tracker(self, experiment):
        session = self.Session()
        TableClass = get_class_by_tablename(experiment)

        # update paid and accepted columns
        pre_accepted = session.query(TableClass.uniqueid).filter(TableClass.status.in_([5,7])).subquery()

        acceptance = Base.metadata.tables['acceptance']
        session.query(AcceptanceTracker) \
               .filter(AcceptanceTracker.uniqueid.in_(pre_accepted)) \
               .update({"paid": True, "accepted": True}, synchronize_session="fetch")

        session.commit()
        session.close()


    def update_payment_status(self, uniqueid, paid):
        '''
        payment recflects payment status set by mturk or manual payment
        '''
        session = self.Session()

        if session.query(AcceptanceTracker.uniqueid).filter(AcceptanceTracker.uniqueid == uniqueid).scalar() is not None:
            session.query(AcceptanceTracker).filter(AcceptanceTracker.uniqueid == uniqueid).update({"paid": paid})

        session.commit()
        session.close()


    def update_acceptance_status(self, uniqueid, accept):
        '''
        acceptance reflects the payment status set by psiturk
        '''

        session = self.Session()

        if session.query(AcceptanceTracker.uniqueid).filter(AcceptanceTracker.uniqueid == uniqueid).scalar() is not None:
            session.query(AcceptanceTracker).filter(AcceptanceTracker.uniqueid == uniqueid).update({"accepted": accept})

        session.commit()
        session.close()


    def update_excluded_status(self, uniqueid, exclude):

        session = self.Session()

        if session.query(AcceptanceTracker.uniqueid).filter(AcceptanceTracker.uniqueid == uniqueid).scalar() is not None:
            session.query(AcceptanceTracker).filter(AcceptanceTracker.uniqueid == uniqueid).update({"excluded": exclude})

        session.commit()
        session.close()


import json
import sqlite3
import sys
import time

from modules.data import variables


def DatabaseManagerProcess(qDatabaseIn,qDatabaseOut,qDebug1,dbfile):
    stop_flag=0
    variables.log2(self.__class__.__name__, "running")
    while True:
        time.sleep(0.1)
        if stop_flag:
            break
        if not qDatabaseIn.empty():
            try:
                data = qDatabaseIn.get(False)

                requestId = data[0]
                if requestId == -1:
                    stop_flag=1
                    break

                sqlstr = data[1]
                params = data[2]

                variables.log2(self.__class__.__name__, requestId + " - " + str(sqlstr) + ' - ' + str(params))

                # conn = sqlite3.connect(configuration.database_path, timeout=10.0)
                conn = sqlite3.connect(dbfile, timeout=variables.db_timeout)

                conn.row_factory = sqlite3.Row # This enables column access by name: row['column_name']
                curs = conn.cursor()
                curs.execute(sqlstr,params)
                # commit the changes

                data = curs.fetchall()

                if len(data) == 0:
                    data = False
                else:
                    data = json.dumps([dict(ix) for ix in data]) #CREATE JSON

                qDatabaseOut.put((requestId,data))

                variables.log2(self.__class__.__name__, "commit")

                conn.commit()
                conn.close()

            except:
                variables.log2(self.__class__.__name__, traceback.format_exc())
                continue
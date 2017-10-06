import copy
import datetime
import json
import sys
import time
from threading import Thread

from modules.data import variables


class DataBucketThread(Thread):
    def run(self):
        t0=time.time()
        Ts=0.1
        Ts= variables.app_config['ts']
        Tlog= variables.app_config['t_log']
        msg = "[DataBucketThread] " + "running"
        if not variables.qDebug1.full():
            variables.qDebug1.put(msg)
        # this thread gathers data from other modules and dispatches to control threads
        tstart=time.time()
        t0_slow = tstart
        t0_data = tstart

        db_logging = variables.app_config['db_logging']
        # appVariables.clientListFcn[i]['t0_polling'] = tstart
        while True:
            try:
                time.sleep(0.01)
                t1 = time.time()

                # request data from generic nodes, discover nodes
                if (t1 - t0_slow) >= 0.5:
                    t0_slow = t1
                    for i in range(len(variables.clientList)):
                        if not variables.clientListFcn[i]['q_out'].full():
                            if variables.clientList[i]['type'] == 11:
                                variables.clientListFcn[i]['q_out'].put("1")
                            elif variables.clientList[i]['type'] == -1:

                                msg = "[DataBucketThread] " + 'discover client ' + variables.clientList[i]['ip']
                                if not variables.qDebug1.full():
                                    variables.qDebug1.put(msg)

                                variables.clientListFcn[i]['q_out'].put("1")

                # request data from nodes (polling), each with own sampling rate
                for i in range(len(variables.clientList)):
                    # print appVariables.clientList[i]['ip']

                    if (t1 - variables.clientListFcn[i]['t0_polling']) >= Ts:
                        variables.clientListFcn[i]['t0_polling'] = t1
                        if not variables.clientListFcn[i]['q_out'].full():
                            # print appVariables.clientList[i]['type']
                            # print appVariables.clientList[i]['type']
                            if variables.clientList[i]['type'] == 1:
                                # request data type
                                # 1: total flow
                                # 2: flow rate
                                # 3: flow rate filtered
                                variables.clientListFcn[i]['q_out'].put("3")



                # basic i/o client operations

                # write data
                if variables.app_aux_flags['set_pump']:
                    variables.app_aux_flags['set_pump']=False
                    variables.app_flags['pump_cmd_time'] = time.time()
                    for i in range(len(variables.clientList)):
                        if not variables.clientListFcn[i]['q_out'].full():
                            if variables.clientList[i]['type'] == 11:
                                variables.clientListFcn[i]['q_out'].put("2," + str(variables.app_flags['pump']))

                # read data
                for i in range(len(variables.clientList)):
                    # retrieve and process data from clients of type flow sensor!!
                    if variables.clientList[i]['type'] == 1:
                        if not variables.clientListFcn[i]['q_in'].empty():
                            cdata = variables.clientListFcn[i]['q_in'].get(block=False)
                            # print(cdata['data'])
                            variables.getBoardData(cdata['data'], array=True)
                            variables.app_flags['ts_sensor'] = int(1000 * (t1 - t0_data))

                            variables.app_flags['ts_sensor_avg'] = int(
                                variables.app_flags['ts_sensor_avg'] * 0.9 + variables.app_flags['ts_sensor'] * 0.1)
                            t0_data = t1
                            if variables.app_flags['log']==True:
                                variables.log_sensor_data()

                # database log
                # logging is done synchronously with latest data
                # even if data from sensors are slightly delayed
                # if a sensor is disconnected, the last value will not be
                # written in the database (if the timeout expires)
                if ((t1 - t0) > Tlog) and db_logging:
                    t0 = t1
                    msg = "[DataBucketThread] " + "log"
                    if not variables.qDebug1.full():
                        variables.qDebug1.put(msg)

                    for s in variables.sensor_data:
                        # only save new data
                        # do not save the same data multiple times in the database
                        if 'recent' in s:
                            if s['recent']:
                                if variables.cnxn is not None:
                                    cursor = variables.cnxn.cursor()
                                    tm = datetime.datetime.now()
                                    cursor.execute(
                                        "insert into SensorData_Flow(Timestamp, Value, Pipe_ID) values (?, ?, ?)", tm, s['value2'],
                                        s['id'])
                                    variables.cnxn.commit()
                        s['recent'] = False
            except:
                variables.print_exception("[DataBucketThread] ")
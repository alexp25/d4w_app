# python modules
import copy
import csv
import datetime
import gevent
import gevent.monkey
import json
import os
import random
import string
import subprocess
import sys
import threading
import time
from dateutil.parser import parse
from flask import Flask
from flask import jsonify
from flask import render_template, send_file, session, Response, request, make_response, send_from_directory
from gevent.pywsgi import WSGIServer
from multiprocessing import Process, Queue

gevent.monkey.patch_time()
# gevent.monkey.patch_all(socket=True, dns=True, time=True, select=True, thread=False, os=False, ssl=True, httplib=False, subprocess=False, sys=False, aggressive=True, Event=False, builtins=True, signal=False)
# from flask_sockets import Sockets
from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler
from flask_socketio import SocketIO
from flask_socketio import send, emit, disconnect

import pyodbc

# app modules
from modules.data import variables

# only the main modules calls init
# the other modules using the global variables just import "appVariables"
variables.init()

# from AppModules.deprecated.DebugPrintThread import DebugPrintThread
# from AppModules.deprecated.DataBucketThread import DataBucketThread
# from AppModules.deprecated.TCPServerAsync import simple_tcp_server
from modules.core.manager import TestRunnerManager
from modules.control_thread import ControlSystemsThread
# from modules.database_process import DatabaseManagerProcess
from modules.data.log import Log

from modules.test.TCPServer import TCPServer


# app config
tmpl_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')
static_folder = "dist"
app = Flask(__name__,static_folder=static_folder, template_folder=tmpl_dir)
# app.debug = appVariables.appConfig['debug']
app.debug = False


def default_json(obj):
    """Default JSON serializer."""
    import calendar, datetime

    if isinstance(obj, datetime.datetime):
        if obj.utcoffset() is not None:
            obj = obj - obj.utcoffset()
        millis = int(
            calendar.timegm(obj.timetuple()) * 1000 +
            obj.microsecond / 1000
        )
        return millis
    raise TypeError('Not sure how to serialize %s' % (obj,))

socketio = SocketIO(app)

@socketio.on('my_event')
def handle_my_event(jsondata):
    emit('my_response', jsondata)

@socketio.on('get_data')
def handle_get_data(jsondata):
    time.sleep(variables.appConfig['ts_disp'])
    if jsondata['reqtype']=='sensors':
        jsondata['value']=None
        if jsondata['type'] in [1,2]:
            p = next((x for x in variables.sensorData if ((x['id'] == jsondata['sensorId']) and (x['type'] == jsondata['type']))), None)
            if p is not None:
                jsondata['value'] = p['value']
                jsondata['value1'] = p['value1']
                jsondata['value2'] = p['value2']
        elif jsondata['type']==100:
            jsondata={
                'sensors': variables.sensorData,
                'devices': variables.device_data
            }
    elif jsondata['reqtype']=='control':
        # jsondata={
        #     'pump':appVariables.appFlags['pump'],
        #     'log':appVariables.appFlags['log'],
        #     'log_time':appVariables.appFlags['log_time']
        # }
        jsondata = {
            "info": variables.appFlags,
            "controllers": variables.appConfig['controllers'],
            "controller_names": variables.appConfig['controller_names']
        }
    # print jsondata['value']
    emit('get_data', jsondata)

@socketio.on('post_data')
def handle_post_data(jsondata):
    variables.log2("socketio - post data", json.dumps(jsondata))

    if jsondata['reqtype'] == 'sensors':
        pass
    elif jsondata['reqtype'] == 'control':
        if 'log' in jsondata:
            if not variables.appFlags['log'] and jsondata['log']:
                variables.new_log()
            variables.appFlags['log'] = jsondata['log']

        if 'mode' in jsondata:
            variables.appFlags['mode'] = jsondata['mode']
            variables.appFlagsAux['spab_index'] = 0
            if variables.appFlags['mode'] not in [1, 5]:
                variables.appFlags['integral'] = 0
        if 'pump' in jsondata:
            variables.appFlags['pump'] = jsondata['pump']
            variables.appFlagsAux['set_pump'] = True
        if 'ref' in jsondata:
            variables.appFlags['ref'] = jsondata['ref']
        if 'controller' in jsondata:
            variables.appFlags['controller_id'] = jsondata['controller']
    elif jsondata['reqtype'] == 'control_setup':
        if 'multi' in jsondata:
            variables.appFlags['multi'] = jsondata['multi']

    # emit('data', jsondata)

@socketio.on('disconnect_request')
def handle_disconnect_request(jsondata):
    disconnect()


@app.route('/')
def mypisite():
    return render_template('index.html')

@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"

    r.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r

@app.route('/api/database/sensors')
def apiDatabaseSensors():
    msg = "[routes][/api/database/sensors]"
    variables.log2("routes", '/api/database/sensors')
    try:
        param = request.args.get('param')

        variables.log2("routes", '/api/database/sensors/delete ' + param)

        param = json.loads(param)
        # param['sid']
        # params['n']
        # print(param)
        if param['id'] != 0:
            cursor = variables.cnxn.cursor()
            cursor.execute("SELECT * FROM (SELECT TOP " + str(param['n']) + " * FROM SensorData_Flow WHERE Pipe_ID = ? ORDER BY Timestamp DESC) a ORDER BY Timestamp ASC",param['id'])
            # cursor.execute("SELECT TOP 100 * FROM SensorData_Flow WHERE Pipe_ID = ? ORDER BY Timestamp DESC",param['id'])
            rows = cursor.fetchall()

            columns = [column[0] for column in cursor.description]
            results = []
            for row in rows:
                results.append(dict(zip(columns, row)))

            return json.dumps(results, default=default_json)
        else:
            result = variables.const1["RESULT_FAIL"]
            return json.dumps({"result": result})
    except:
        variables.print_exception("[routes][/api/database/sensors]")
        result = variables.const1["RESULT_FAIL"]
        return json.dumps({"result": result})

@app.route('/api/download/log', methods=['GET'])
def apiDownloadLog():
    filename = "log.csv"
    return send_file(filename,
                     mimetype='text/plain',
                     attachment_filename=filename,
                     as_attachment=True)

@app.route('/api/reload', methods=['GET'])
def apiReload():
    variables.load_app_config()
    result = variables.const1["RESULT_OK"]
    return json.dumps({"result": result})

@app.route('/api/download/log-dbg', methods=['GET'])
def apiDownloadLogDbg():
    filename = variables.appConfig["log_file_stdout"]
    return send_file(filename,
                     mimetype='text/plain',
                     attachment_filename="log_file_stdout",
                     as_attachment=True)

# set the secret key.  keep this really secret:
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

if __name__ == '__main__':
    q_read_tcp = Queue(maxsize=10)
    q_write_tcp = Queue(maxsize=10)
    time.sleep(1)
    print(variables.appConfig["db_selection"])
    db_info = variables.appConfig[variables.appConfig["db_selection"]]
    try:
        variables.cnxn = pyodbc.connect(
            'DRIVER=' + db_info["driver"] + ';SERVER=' + db_info["server"] + ';DATABASE=' +
            db_info["database"] + ';UID=' + db_info["username"] + ';PWD=' + db_info[
                "password"])
    except:
        variables.print_exception("[server]")

    t = TestRunnerManager()
    t.start()
    # thread2 = DataBucketThread()
    # thread2.start()

    # t = threading.Thread(target=simple_tcp_server)
    # t.daemon = True
    # t.start()

    # thread5 = DebugPrintThread()
    # thread5.start()

    tlog = Log()
    tlog.start()

    thread8 = ControlSystemsThread()
    thread8.start()

    variables.log2("main", " server started")

    server = pywsgi.WSGIServer(('0.0.0.0', 8086), app, handler_class=WebSocketHandler)
    server.serve_forever()



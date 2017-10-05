import json
from multiprocessing import Queue
import sys
import time
import datetime
import copy

def print_exception(msg):
    exc_type, exc_value = sys.exc_info()[:2]
    exceptionMessage = str(exc_type.__name__) + ': ' + str(exc_value)
    em1 = 'Error on line {}'.format(sys.exc_info()[-1].tb_lineno)
    msg1 = msg + ' ' + em1 + ', ' + exceptionMessage
    log2("exception", msg1)

def addToQueue(queue, element):
    # print("add to queue: ", queue)
    if not queue.full():
        queue.put(element)

def getFromQueue(queue):
    # print("get from queue: ", queue)
    if not queue.empty():
        return queue.get(block=False)
    else:
        return None

def writeFile(filename, string):
    with open(filename, "w") as f:
        f.write(string + "\n")

def addToFile(filename, string):
    with open(filename, "a") as f:
        f.write(string + "\n")

def log(message):
    msg = str(datetime.datetime.now()) + "\t" + message
    addToQueue(qLog, ("mLog", msg))

def log2(source, message):
    msg = str(datetime.datetime.now()) + "\t" + source + "\t" + message
    addToQueue(qLog, ("mLog", msg))

    if len(results["smallLog"]) < 10:
        results["smallLog"].append(message)
    else:
        del results["smallLog"][0]
        results["smallLog"].append(message)

def log_sensor_data():
    line=''
    for s in sensorData:
        if s['type']==1:
            line+=str(s['id'])+','+str(s['tim'])+','+str(s['value2'])+','
    line += '100' + ',' + str(appFlags['pump_cmd_time']) + ',' + str(appFlags['pump']) + ','
    line += '101' + ',' + str(appFlags['control_time']) + ',' + str(appFlags['ref']) + ','
    line += '102' + ',' + str(appFlags['control_time']) + ',' + str(appFlags['yk']) + ','
    line += '\n'
    with open('log.csv','a') as f:
        f.write(line)

def new_log():
    with open('log.csv','w') as f:
        f.write("")

def load_app_data():
    global spab_data
    with open('config/prbs_sequence.txt') as f:
        file_contents = f.read()
    try:
        spab_data = [int(s) for s in file_contents.split(",")]
        # print(spab_data)
    except:
        exc_type, exc_value = sys.exc_info()[:2]
        exceptionMessage = str(exc_type.__name__) + ': ' + str(exc_value)
        msg = "spab file exception " + exceptionMessage
        print(msg)

def load_app_config():
    global appConfig, sensorModel, model_data, controller_data, appFlags
    with open('config/config.json') as f:
        file_contents = f.read()
    try:
        appConfig = json.loads(file_contents)

        sensorModel = appConfig["sensor_model"]

        appFlags['models'] = []
        appFlags['controllers'] = []
        for i in range(len(appConfig['models'])):
            appFlags['models'].append(copy.deepcopy(model_data))
            appFlags['controllers'].append(copy.deepcopy(controller_data))
        print(json.dumps(appConfig, indent=2))
    except:
        exc_type, exc_value = sys.exc_info()[:2]
        exceptionMessage = str(exc_type.__name__) + ': ' + str(exc_value)
        em1 = 'Error on line {}'.format(sys.exc_info()[-1].tb_lineno)
        msg1 = 'load_app_config' + ' ' + em1 + ', ' + exceptionMessage
        print(msg1)

def init():
    global myList
    myList = []
    global flags,server_commands_default,server_commands,server_params,server_status
    global deviceCmdCodes,clientModelFcn,clientModel,clientList,clientListFcn,clientModelDB
    global appConfig
    global qDebug1,qDebug2,queue_ws_app_data,queue_ws_control,wsOutQueue,queueServerStat,qAudioData,qAudioData2,qDatabaseIn,qDatabaseOut
    global qLog
    global const1
    global sensorModel
    global sensorData

    global device_data




    global appFlags,appFlagsAux

    global cnxn

    global spab_data
    global model_data
    global controller_data

    global LOOP_DELAY

    global results


    device_data = []
    results = {
        "testRunning": 0,
        "inProgress": 0,
        "devicesRunning": 0,
        "currentIpScan": "",
        "availableList": [],
        "receivedMsg": "",
        "sentMsg": "",
        "opCounter": 0,
        "selectedIp": "192.168.7.2",
        "smallLog": []
        # "selectedIp": "127.0.0.1"
    }

    LOOP_DELAY = 0.001


    appFlags={
        "log":False,
        "pump":0,
        "log_time":0,
        "mode":0,
        "ref":0,
        "ek":0,
        "yk":0,
        "ts_sensor":0,
        "ts_sensor_avg":0,
        "multi":False,
        "integral":0,
        "spab_index": 0,
        "pump_cmd_time":time.time(),
        "control_time":time.time(),
        "controller_id": 0,
        "Kp":0,
        "Ki":0,
        "Kd":0,
        "Tf":0,
        "models":[],
        "controllers":[]
    }

    model_data = {
        "yk":0,
        "ek":0,
        "ek_norm":0
    }

    controller_data = {
        "ek":0,
        "yk":0,
        "uk":0,
        "a":0,
        "integral":0
    }

    appFlagsAux={
        "set_pump": False,
        "dir_pump": 1

    }

    const1 = {
        "RESULT_OK":0,
        "RESULT_FAIL":1
    }

    sensorData = [
        {'id': 1, 'type': 1, 'value': 10},
        {'id': 2, 'type': 1, 'value': 20},
        {'id': 3, 'type': 1, 'value': 30},
        {'id': 5, 'type': 1, 'value': 50},
        {'id': 6, 'type': 1, 'value': 60},
        {'id': 7, 'type': 1, 'value': 70},
        {'id': 8, 'type': 1, 'value': 80},
        {'id': 9, 'type': 1, 'value': 90},
        {'id': 10, 'type': 1, 'value': 100},
        {'id': 11, 'type': 1, 'value': 110},

        {'id': 1, 'type': 2, 'value': 10},
        {'id': 2, 'type': 2, 'value': 20}
    ]

    appConfig = None
    # print('loading app config'

    sensorModel = {}
    load_app_config()
    load_app_data()

    # debug queue (print, tcp debugging)
    qLog = Queue(maxsize=10)
    qDebug1 = Queue(maxsize=50)
    qDebug2 = Queue(maxsize=50)
    QSIZE = 5
    QSIZE2 = 1
    # websocket data
    queue_ws_app_data = Queue(maxsize=QSIZE)
    # thread data
    queue_ws_control = Queue(maxsize=QSIZE)
    # watering system out queue
    wsOutQueue = Queue(maxsize=QSIZE)

    # server status queue
    queueServerStat = Queue(maxsize=2)
    # audio data
    qAudioData = Queue(maxsize=5)
    qAudioData2 = Queue(maxsize=1)
    # database
    qDatabaseIn = Queue(maxsize=10)
    qDatabaseOut = Queue()


    flags = {
        "new_client_data": False,
        "new_server_data": False
    }

    clientModelFcn = {
        'discovered': False,
        'connection': None,
        'prev_id': -1,
        'q_in': None,
        'q_out': None,
        't0': None,
        't0_polling': None,
        't0_log': None
    }
    clientModel = {
        'id': -1,
        'ip': '',
        'data': [],
        'type': -1,
        'counter_rx': 0,
        'counter_tx': 0
    }
    clientList = []
    clientListFcn = []
    clientModelDB = []

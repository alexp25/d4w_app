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


def add_checksum(msg):
    msg1 = msg.split(",")
    msgdata = [0] * len(msg1)
    chksum=0
    for i in range(len(msg1)):
        msgdata[i] = int(msg1[i])
        chksum += msgdata[i]
    msg2 = str(msg) + ',' + str(chksum)

    if(msgdata[0] not in [1,2,3,100,211]):
        msginfo = "[add_checksum] " + msg2
        if not qDebug1.full():
            qDebug1.put(msginfo)

    return msg2

def getBoardData(bdata, array=False):
    if not array:
        bdata1 = bdata.split(",")
        bdata2 = [int(val) for val in bdata1]
    else:
        bdata2 = bdata
    # print('board data: ' + str(bdata2)
    if len(bdata2)>1:
        stype = bdata2[2]
        # print(sensorData
        for sensor_def in sensorModel:
            # print(sensor_def['id']
            if sensor_def['id'] == stype:
                for e in sensor_def['data']:
                    update_sensor_data(e['id'],bdata2[e['pos']])
                break

def update_sensor_data(id,value):
    # print('update ' + str(id) + ' - ' + str(value)
    tm = datetime.datetime.now()
    tim = time.time()
    for s in sensorData:
        if s['id'] == id:
            s['value'] = value
            s['value1'] = value
            s['value2'] = value
            # if value==0:
            #     s['value1'] = 0
            #     s['value2'] = 0
            # else:
            #     # set a threshold for valid data (max 130 Hz ~ 1000 L/h)
            #     if value >= 1750:
            #         frequency=250000/value
            #         s['value1'] = frequency
            #         s['value2'] = int(7.77*frequency-14.8605)
            #     else:
            #         s['value1'] = 0
            #         s['value2'] = 0
            # print(value

            if 'tim' in s:
                if (tim - s['tim']) < 3:
                    s['recent'] = True
                else:
                    s['recent'] = False
            else:
                s['recent'] = False

            s['tim'] = tim
            s['ts'] = tm.strftime("%H:%M:%S.%f")
            break

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

def load_app_config():
    global appConfig, model_data, controller_data, appFlags
    with open('config/config.json') as f:
        file_contents = f.read()
    try:
        appConfig = json.loads(file_contents)
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


    global appFlags,appFlagsAux

    global cnxn

    global spab_data
    global model_data
    global controller_data

    global LOOP_DELAY

    global results

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
    load_app_config()

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

    sensorModel = {}
    with open('config/sensor_model.json') as f:
        file_contents = f.read()
    try:
        sensorModel = json.loads(file_contents)
    except:
        exc_type, exc_value = sys.exc_info()[:2]
        exceptionMessage = str(exc_type.__name__) + ': ' + str(exc_value)
        msg = "sensor model file exception " + exceptionMessage
        print(msg)

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

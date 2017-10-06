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

def log_sensor_data():
    line=''
    for s in sensor_data:
        if s['type'] == 1:
            line+=str(s['id'])+','+str(s['tim'])+','+str(s['value2'])+','
    line += '100' + ',' + str(app_flags['pump_cmd_time']) + ',' + str(app_flags['pump']) + ','
    line += '101' + ',' + str(app_flags['control_time']) + ',' + str(app_flags['ref']) + ','
    line += '102' + ',' + str(app_flags['control_time']) + ',' + str(app_flags['yk']) + ','
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
    global app_config, sensor_model, model_data, controller_data, app_flags
    with open('config/config.json') as f:
        file_contents = f.read()
    try:
        app_config = json.loads(file_contents)
        sensor_model = app_config["sensor_model"]
        app_flags['models'] = []
        app_flags['controllers'] = []
        for i in range(len(app_config['models'])):
            app_flags['models'].append(copy.deepcopy(model_data))
            app_flags['controllers'].append(copy.deepcopy(controller_data))
        # print(json.dumps(app_config, indent=2))
    except:
        exc_type, exc_value = sys.exc_info()[:2]
        exceptionMessage = str(exc_type.__name__) + ': ' + str(exc_value)
        em1 = 'Error on line {}'.format(sys.exc_info()[-1].tb_lineno)
        msg1 = 'load_app_config' + ' ' + em1 + ', ' + exceptionMessage
        print(msg1)

app_config = None
test_manager = None
LOOP_DELAY = 0.001
app_flags = {
    "log": False,
    "pump": 0,
    "log_time": 0,
    "mode": 0,
    "ref": 0,
    "ek": 0,
    "yk": 0,
    "ts_sensor": 0,
    "ts_sensor_avg": 0,
    "multi": False,
    "integral": 0,
    "spab_index": 0,
    "pump_cmd_time": 0,
    "control_time": 0,
    "controller_id": 0,
    "Kp": 0,
    "Ki": 0,
    "Kd": 0,
    "Tf": 0,
    "models": [],
    "controllers": []
}

model_data = {
    "yk": 0,
    "ek": 0,
    "ek_norm": 0
}

controller_data = {
    "ek": 0,
    "yk": 0,
    "uk": 0,
    "a": 0,
    "integral": 0
}

app_aux_flags = {
    "set_pump": False,
    "dir_pump": 1
}

return_values_def = {
    "RESULT_OK": 0,
    "RESULT_FAIL": 1
}

sensor_data = [
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

qLog = Queue(maxsize=10)

device_data = []
sensor_model = {}

cnxn = None

def init():
    load_app_config()
    load_app_data()


import copy
import time
import traceback
import datetime
from threading import Thread

from modules.api.HIL_socket_API import HIL_socket
from modules.core.runner import TestRunner
from modules.data import variables
from modules.data.constants import Constants


class TestRunnerManager(Thread):
    """
    class used for managing test runners
    It can run the tests for each device in 2 modes:
    1. async - single thread, loops through all devices and runs the actions asynchronously
    2. multi - multi thread, uses the dedicated loop for every device and the test actions
    are run in that loop (also asynchronously)
    For scalability (high number of devices), the async mode is recommended
    For performance (low latency), the multi mode is recommended
    For both, a mix of async and multi would be a solution
    *For general purpose, either mode can be used
    """

    def __init__(self):
        # constructor
        Thread.__init__(self)
        # self.mode = 'async'
        self.mode = 'multi'
        self.t0 = time.time()
        self.t = self.t0
        self.TS = variables.app_config["ts"]
        self.TS_DB = variables.app_config["t_log"]
        self.t0_db = self.t0


        self.tr = []
        self.hil_object_array = []
        self.hil_device_index = 0
        for dev in variables.app_config["devices"]:
            self.add_new_hil_device(dev["ip"], dev["port"], dev)

    def add_new_hil_device(self, ip, port=9001, dev = None):
        """
        add new hil device and test runner thread
        :param ip: ip
        """

        variables.log2("[add_new_hil_device]", ip + ":" + str(port))
        self.hil = HIL_socket(ip, port)

        new_device_data = copy.deepcopy(Constants.hil_object_data_model)

        new_hil_object = {
            "function": {
                "socket": self.hil,
            },
            "data": new_device_data
        }
        new_hil_object["data"]["ip"] = ip
        new_hil_object["data"]["port"] = port
        new_hil_object["data"]["index"] = self.hil_device_index
        if dev is not None:
            if "info" in dev:
                new_hil_object["data"]["info"] = dev["info"]


        self.hil_object_array.append(new_hil_object)
        variables.device_data.append(new_device_data)

        self.tr.append(TestRunner(new_hil_object))
        if self.mode == 'multi':
            self.tr[self.hil_device_index].start()
        self.hil_device_index += 1


    def clear_hil_devices(self):
        """
        clear hil devices and close test runner threads
        """
        for i in range(len(self.hil_object_array)):
            try:
                self.tr[i].stop()
                self.tr[i].join()
            except:
                pass
        self.tr = []
        print('hil device clear: stopped threads')
        self.hil_object_array = []
        variables.deviceList = []
        self.hil_device_index = 0

    def set_pump(self, value):
        for (i, dev) in enumerate(variables.app_config["devices"]):
            if dev["info"]["type"] == Constants.NODE_PUMP:
                self.tr[i].send_data("1," + str(value))

    def run(self):
        """
        check for user input
        check status of test runners
        """
        variables.log2(self.__class__.__name__, "started")

        while True:
            time.sleep(variables.LOOP_DELAY)
            self.t = time.time()
            try:
                if self.t - self.t0 >= self.TS:
                    self.t0 = self.t
                    if variables.app_flags['log'] == True:
                        variables.log_sensor_data()

                if variables.app_config['db_logging']:
                    # database log
                    # logging is done synchronously with latest data
                    # even if data from sensors are slightly delayed
                    # if a sensor is disconnected, the last value will not be
                    # written in the database (if the timeout expires)
                    if ((self.t - self.t0_db) > self.TS_DB):
                        self.t0_db = self.t
                        variables.log2(self.__class__.__name__, "save to db")

                        for s in variables.sensor_data:
                            # only save new data
                            # do not save the same data multiple times in the database
                            if 'recent' in s:
                                if s['recent']:
                                    s['recent'] = False
                                    if variables.cnxn is not None:
                                        cursor = variables.cnxn.cursor()
                                        tm = datetime.datetime.now()
                                        cursor.execute(
                                            "insert into SensorData_Flow(Timestamp, Value, Pipe_ID) values (?, ?, ?)",
                                            tm, s['value2'],
                                            s['id'])
                                        variables.cnxn.commit()
                            s['recent'] = False

                # manage runners
                for (i, hil_def) in enumerate(self.hil_object_array):
                    if self.mode == 'async':
                        self.tr[i].run_async()

            except:
                variables.log2(self.__class__.__name__, traceback.format_exc())
                continue




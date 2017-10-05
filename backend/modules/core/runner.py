import json
import threading
import time
import traceback
from threading import Thread
import datetime
from modules.api.HIL_socket_API import HIL_socket
from modules.data import variables
from modules.data.constants import Constants


class TestRunner(Thread):
    """
    class used for calling the API for device
    In multi mode (manager) it calls the API inside a thread, which allows for non-blocking
    functionality for the application
    In async mode (manager) it runs the API within the calling thread, also non-blocking except the API I/O methods
    """

    def __init__(self, hil_def):
        # constructor
        Thread.__init__(self)
        self.hil_def = hil_def
        self.hil_socket = hil_def["function"]["socket"]

        self.hil = HIL_socket(self.hil_def["data"]["ip"], self.hil_def["data"]["port"])

        self.t0 = time.time()
        self.t = self.t0
        self.t_start = self.t0
        self.t_string = ""
        self.TS = 0.1

        self.log = True

        # print(variables.sensorModel)

        self._stop_flag = threading.Event()


    def stop(self):
        """
        stop request, end thread, close device thread (in the multi mode)
        """
        self._stop_flag.set()

    def stop_request(self):
        """
        check if there is a stop request, that would end the thread (in the multi mode)
        :return: boolean
        """
        return self._stop_flag.is_set()

    def update_test_timer(self):
        """
        update test timer for the current device
        :param hil_def: the hil device object
        """

        self.t_string = "%.4f" % (time.time() - self.t_start)

    def format_request(self):
        reqmsg = "100"
        if self.hil_def["data"]["info"] is not None:
            if self.hil_def["data"]["info"]["type"] == 1:
                # flow measurement node
                reqmsg = "100,3"
        return reqmsg

    def update_sensor_data(self, id, value):
        tm = datetime.datetime.now()
        tim = time.time()
        # print("update ", id)
        for s in variables.sensorData:
            if s['id'] == id:
                s['value'] = value
                s['value1'] = value
                s['value2'] = value

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

    def get_response_data(self, resp):
        device_data = variables.device_data[self.hil_def["data"]["index"]]
        device_data["in"] = str(resp)
        device_data["rx_counter"] += 1

        for sensor_def in variables.sensorModel:
            if self.hil_def["data"]["info"] is not None:
                if self.hil_def["data"]["info"]["type"] == 1:
                    for e in sensor_def['data']:
                        try:
                            self.update_sensor_data(e["id"], resp[e['pos']])
                        except:
                            pass

    def run_async(self):
        self.t = time.time()
        self.update_test_timer()
        if not self.hil_socket.is_connected():
            self.hil_socket.newSocket()
            self.hil_socket.connect()

        if self.t - self.t0 >= self.TS:
            self.t0 = self.t
            reqmsg = self.format_request()
            t_req = time.time()
            # variables.log2(self.__class__.__name__, 'sending to "%s" "%s"' % (self.hil_def["data"]["ip"], reqmsg))
            res = self.hil_socket.request(reqmsg)
            t_req = time.time() - t_req


            if self.log:
                variables.log2(self.__class__.__name__, 'recv from "%s" "%s", time ms "%d"' % (self.hil_def["data"]["ip"], res[1], t_req*1000))
            if res[0] == -1:
                self.hil_socket.reset_connection()
            else:
                self.get_response_data(res[1])



    def run(self):
        variables.log2("[TestRunner]", "started")
        while True:
            time.sleep(variables.LOOP_DELAY)
            if self.stop_request():
                break
        variables.log2("[TestRunner]", "stopped")

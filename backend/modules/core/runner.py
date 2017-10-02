import json
import threading
import time
import traceback
from threading import Thread

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

        self.hil = HIL_socket(self.hil_def["data"]["ip"], 9001)

        self.t0 = time.time()
        self.t = self.t0
        self.t_start = self.t0
        self.t_string = ""
        self.TS = 0.5

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

    def run_async(self):
        self.t = time.time()
        self.update_test_timer()
        if not self.hil_socket.is_connected():
            self.hil_socket.newSocket()
            self.hil_socket.connect()

        if self.t - self.t0 >= self.TS:
            self.t0 = self.t
            res = self.hil_socket.request('100')
            print(res)
            if res[0] == -1:
                self.hil_socket.reset_connection()



    def run(self):
        variables.log2("[TestRunner]", "started")
        while True:
            time.sleep(variables.LOOP_DELAY)
            if self.stop_request():
                break
        variables.log2("[TestRunner]", "stopped")

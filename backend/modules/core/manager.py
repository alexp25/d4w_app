import copy
import time
import traceback
from threading import Thread

from modules.api.HIL_socket_API import HIL_socket
from modules.core.runner import TestRunner
from modules.data import variables
from modules.data.constants import Constants
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
        self.gateway = "127.0.0.1"
        self.port = 9001

        self.mode = 'async'

        self.flag_run_ip_scan = False

        self.tr = []
        self.hil_object_array = []
        self.hil_device_index = 0
        for dev in variables.appConfig["devices"]:
            self.add_new_hil_device(dev["ip"], dev["port"])

    def add_new_hil_device(self, ip, port=9001):
        """
        add new hil device and test runner thread
        :param ip: ip
        """

        variables.log2("[add_new_hil_device]", ip + ":" + str(port))
        self.hil = HIL_socket(ip, port)

        new_hil_object = {
            "function": {
                "socket": self.hil,
            },
            "data": copy.deepcopy(Constants.hil_object_data_model)
        }
        new_hil_object["data"]["ip"] = ip
        new_hil_object["data"]["port"] = port
        new_hil_object["data"]["index"] = self.hil_device_index

        self.hil_object_array.append(new_hil_object)

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
        variables.results["availableList"] = []
        variables.deviceList = []
        self.hil_device_index = 0

    def get_device_by_ip(self, ip):
        for dev in self.hil_object_array:
            if dev["data"]["def"]["ip"] == ip:
                return dev
        return None

    def get_device_ip_from_index(self, id):
        return self.hil_object_array[id]["data"]["def"]["ip"]

    def get_first_device(self):
        return self.hil_object_array[0]

    def get_first_device_1(self):
        return self.hil_object_array[0]


    def run_ip_scan_exec(self, gateway, port):
        """
        Start network scan in the test runner thread
        :param gateway: the gateway for the network that is to be scanned
        :param port: the port of the tcp server running on each hil device
        """
        self.gateway = gateway
        self.port = port
        self.flag_run_ip_scan = True

    def scan_network_for_devices(self, gateway, port):
        """
        Scan network for hil devices and adds them to the list of available devices
        :param gateway: the gateway for the network that is to be scanned
        :param port: the port of the tcp server running on each hil device
        :return: the list of available devices
        """
        self.clear_hil_devices()
        variables.appConfig["devices"] = []
        time.sleep(1)

        for dev in Constants.special_devices:
            self.add_new_hil_device(dev)
        # one hil device is added by default
        variables.appConfig["devices"].append({"ip": "127.0.0.1"})
        self.get_first_device()["function"]["socket"].close()
        for i in range(2, 255):
            self.get_first_device()["function"]["socket"].newSocket(timeout=0.1)
            ip_split = gateway.split('.')
            ip = ip_split[0] + '.' + \
                 ip_split[1] + '.' + \
                 ip_split[2] + '.' + \
                 str(i)
            variables.results['currentIpScan'] = ip
            if self.get_first_device()["function"]["socket"].connect(ip, port) == 0:
                # add device to api list
                self.add_new_hil_device(ip)
                variables.appConfig["devices"].append({"ip": ip})
            self.get_first_device()["function"]["socket"].close()
            if self.flag_stop_test_aux:
                break
        self.flag_stop_test_aux = False
        self.flag_operation_in_progress = 0
        variables.save_config()
        return variables.results["availableList"]

    def run(self):
        """
        check for user input
        check status of test runners
        """
        variables.log2(self.__class__.__name__, "started")

        while True:
            time.sleep(variables.LOOP_DELAY)
            try:
                # check user input
                if self.flag_run_ip_scan and self.flag_operation_in_progress == 0:
                    # blocking
                    self.flag_run_ip_scan = False
                    variables.log2('', "detected cmd: run ip scan")
                    self.flag_operation_in_progress = 2
                    variables.results["inProgress"] = self.flag_operation_in_progress
                    self.scan_network_for_devices(self.gateway, self.port)
                    self.flag_operation_in_progress = 0

                for (i, hil_def) in enumerate(self.hil_object_array):
                    if self.mode == 'async':
                        self.tr[i].run_async()

                # variables.results["inProgress"] = self.flag_operation_in_progress
            except:
                variables.log2(self.__class__.__name__, traceback.format_exc())
                continue




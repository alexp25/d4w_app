import copy
import time
import traceback
from modules.testing.runner import TestRunner
from modules.testing.utils import TestUtils
from threading import Thread

from modules.api.HIL_socket_API import HIL_socket
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
            self.add_new_hil_device(dev["ip"])

    def add_new_hil_device(self, ip):
        """
        add new hil device and test runner thread
        :param ip: ip
        """

        variables.log2("[add_new_hil_device]", ip)
        self.hil = HIL_socket()

        new_hil_object = {
            "function": {
                "socket": self.hil,
            },
            "data": copy.deepcopy(Constants.hil_object_data_model)
        }
        new_hil_object["data"]["def"]["ip"] = ip
        new_hil_object["data"]["def"]["index"] = self.hil_device_index

        self.hil_object_array.append(new_hil_object)
        variables.results["availableList"].append(ip)
        variables.deviceList.append(new_hil_object["data"])

        self.tr.append(TestRunner(self.hil_object_array[self.hil_device_index], self.hil_object_array))
        if self.mode == 'multi':
            self.tr[self.hil_device_index].start()
        self.load_test_spec(None, self.hil_device_index)

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


    def run_test_action_manual(self, action, device, params):
        """
        signal run test action manual to the manager thread
        :param action: action name
        :param device: device id
        :param params: action parameters
        """
        self.flag_run_test_action_manual = True
        self.test_action_name_manual = action

        self.test_device_manual = device
        self.test_params_manual = params


    def run_test_file_on_dev_id(self, id):
        """
        Start the test (signal for test runner thread) for selected hil device by id
        :param id: the ID of the selected hil device, None for starting all tests
        """
        variables.log2(self.run_test_file_on_dev_id.__name__, '')
        variables.initResultList()
        variables.logModule.init()
        if id is None:
            # run on all devices
            for i in range(len(self.hil_object_array)):
                if i == 0:
                    self.stop_test_exec_on_dev_id(i)
                else:
                    self.tr[i].start_test()
        else:
            self.tr[id].start_test()

        self.flag_operation_in_progress = 1

    def get_api(self, id):
        """
        get api for selected device id
        :param id: id of hil device
        :return: api
        """
        return self.tr[id].get_api()

    def set_status(self, id, mode):
        """
        set status for selected device id
        :param id:
        :return: status (manual, auto, idle)
        """
        return self.tr[id].set_status(mode)

    def stop_test_exec_on_dev_id(self, id):
        """
        Stop the test (signal for test runner thread) for selected hil device by ID
        :param id: the ID of the selected hil device, None for stopping all tests
        """
        self.flag_stop_test_aux = True
        if id is None:
            for i in range(len(self.hil_object_array)):
                self.tr[i].stop_test()
        else:
            self.tr[id].stop_test()

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
                if self.flag_operation_in_progress == 0:
                    if self.flag_run_ip_scan:
                        # blocking
                        self.flag_run_ip_scan = False
                        variables.log2('', "detected cmd: run ip scan")
                        self.flag_operation_in_progress = 2
                        variables.results["inProgress"] = self.flag_operation_in_progress
                        self.scan_network_for_devices(self.gateway, self.port)
                        self.flag_operation_in_progress = 0

                    if self.flag_run_test_action_manual:
                        self.flag_run_test_action_manual = False
                        variables.log2('', "detected cmd: run test action manual")
                        self.tr[self.test_device_manual].run_test_action(self.test_action_name_manual,
                                                                         exec_flag=True, manual=True,
                                                                         params_def=self.test_params_manual)

                # check task status
                devices_running = 0
                for (i, hil_def) in enumerate(self.hil_object_array):
                    if self.mode == 'async':
                        self.tr[i].run_async()
                    if hil_def["data"]["status"]["runTestActionsInProgress"]:
                        devices_running += 1

                if (devices_running == 0) and not self.flag_run_ip_scan:
                    self.flag_operation_in_progress = 0

                if self.flag_stop_test_aux:
                    self.flag_stop_test_aux = False

                variables.results["inProgress"] = self.flag_operation_in_progress
                variables.results["devicesRunning"] = devices_running
            except:
                traceback.print_exc()
                continue




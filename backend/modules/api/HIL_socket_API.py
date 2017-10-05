import codecs
import socket
import traceback
from struct import *

from modules.api import definitions
from modules.data import variables

buffSize = 128

''
class HIL_socket:
    def __init__(self, ip, port):
        """

        :param family:
        :param type:
        """
        self.family = socket.AF_INET
        self.type = socket.SOCK_STREAM

        self.isconn = False

        self.Socket = socket.socket(self.family, self.type)
        self.Socket.settimeout(0.5)

        self.servicesDict = definitions.servicesDict
        self.errorsDict = definitions.errorsDict
        self.txMsgStructuresDict = definitions.txMsgStructures
        self.rxMsgStructureDict = definitions.rxMsgStructures

        self.debug_log = True

        self.ip = ip
        self.port = port

    def newSocket(self, timeout=0.5):
        self.Socket = socket.socket(self.family, self.type)
        self.Socket.settimeout(timeout)

    def is_connected(self):
        return self.isconn

    def reset_connection(self):
        self.isconn = False

    def connect(self):
        """

        :param IP:
        :param port:
        :return:
        """
        server_address = (self.ip, self.port)

        # if self.debug_log:
        variables.log2(self.__class__.__name__,'starting up on %s port %s' % server_address)
        
        try:
            self.Socket.connect(server_address)
            self.isconn = True
            return 0
        except:
            if self.debug_log:
                variables.log2(self.__class__.__name__,'Error starting connection on %s port %s' % server_address)
                variables.log2(self.__class__.__name__, traceback.format_exc())
            self.isconn = False
            return 1

    def send(self, message):
        """

        :param message:
        :return:
        """
        if self.debug_log:
            # variables.log2(self.__class__.__name__, 'sending to "%s" "%s"' % (self.ip, message))
            # variables.log2(self.__class__.__name__, 'sending (parsed) to "%s" "%s"' % (self.ip, "".join("%s " % ("0x%0.2X" % tup) for tup in message)))
            pass
        try:
            self.Socket.sendall(message)
            return 0
        except:
            if self.debug_log:
                variables.log2(self.__class__.__name__,'Error sending "%s"' % message)
                variables.log2(self.__class__.__name__, traceback.format_exc())
            return 1

    def receive (self, bufsize):
        """

        :param bufsize:
        :return:
        """
        data = None
        try:
            data = self.Socket.recv(bufsize)
            if self.debug_log:
                # variables.log2(self.__class__.__name__, 'received from "%s" "%s"' % (self.ip, data))
                # variables.log2(self.__class__.__name__, 'received from "%s" "%s"' % (self.ip, "".join("%s " % ("0x%0.2X" % tup) for tup in data)))
                pass
        except:
                if self.debug_log:
                    variables.log2(self.__class__.__name__, traceback.format_exc())
        return data

    def close(self):
        """

        :return:
        """
        if self.debug_log:
            variables.log2(self.__class__.__name__, "closing socket")
        try:
            self.Socket.shutdown(socket.SHUT_RDWR)
            self.Socket.close()
            return 0
        except:
            if self.debug_log:
                variables.log2(self.__class__.__name__, traceback.format_exc())
            return 1

    def request(self, tx_message):
        # if self.debug_log:
        #     variables.log2(self.__class__.__name__, "get data")

        self.send((tx_message+"\n").encode())
        rx_message = self.receive(buffSize)
        try:
            rx_message = rx_message.decode()
            rx_data = [int(rm) for rm in rx_message.split(",")]
            # get error code and data
            return (0, rx_data)
        except:
            if self.debug_log:
                variables.log2(self.__class__.__name__, traceback.format_exc())
            return (-1, None)

    def request_hex(self, service_def):
        if self.debug_log:
            variables.log2(self.__class__.__name__, "get data")

        format = "!BB"
        tx_length = calcsize(format) - 1

        try:
            tx_message = pack(format, tx_length, self.servicesDict[service_def])
            # tx_message = pack(self.txMsgStructuresDict['DATA'], tx_length, self.servicesDict['SERVICE_DATA'])
        except:
            if self.debug_log:
                variables.log2(self.__class__.__name__, traceback.format_exc())
            return (-1, None)

        self.send(tx_message)
        rx_message = self.receive(buffSize)
        try:
            rx_data = [rm for rm in rx_message]
            # get error code and data
            return (rx_data[2], rx_data)
        except:
            if self.debug_log:
                variables.log2(self.__class__.__name__, traceback.format_exc())
            return (-1, None)


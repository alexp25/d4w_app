# Socket server in python using select function
# http://www.binarytides.com/python-socket-server-code-example/

import socket, select
import threading
from threading import Thread
import time
import traceback


class TCPServer(Thread):
    def __init__(self, host, port):
        Thread.__init__(self)
        self.host = host
        self.port = port
        self._stopEvent = threading.Event()

        self.debug_log = True

    def stop(self):
        print("stop event")
        self._stopEvent.set()

    def stopped(self):
        return self._stopEvent.is_set()

    def run(self):
        CONNECTION_LIST = []  # list of socket clients
        RECV_BUFFER = 1024  # Advisable to keep it as an exponent of 2

        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        server_socket.setblocking(0)
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((self.host, self.port))

        server_socket.listen(10)
        # server_socket.settimeout(1)


        # Add server socket to the list of readable connections
        CONNECTION_LIST.append(server_socket)

        print("TCP server started on port " + str(self.port))

        while 1:
            time.sleep(0.001)
            # print("running")
            if self.stopped():
                print ("stop event detected")
                break
            # Get the list sockets which are ready to be read through select
            read_sockets, write_sockets, error_sockets = select.select(CONNECTION_LIST, CONNECTION_LIST, CONNECTION_LIST, 1)

            # print("running2")
            for sock in read_sockets:
                # New connection
                if sock == server_socket:
                    # Handle the case in which there is a new connection recieved through server_socket
                    sockfd, addr = server_socket.accept()
                    sockfd.setblocking(0)
                    CONNECTION_LIST.append(sockfd)
                    print("Client " + str(addr) + " connected")

                # Some incoming message from a client
                else:
                    # Data recieved from client, process it
                    try:
                        # In Windows, sometimes when a TCP program closes abruptly,
                        # a "Connection reset by peer" exception will be thrown
                        data = sock.recv(RECV_BUFFER)
                        if self.debug_log:
                            print("TCPServer received: ", data, "decoded: ", "".join("%s " % ("0x%0.2X" % tup) for tup in data))

                        # print(data[4])
                        if len(data) == 0:
                            raise Exception("empty message")

                        # print("string: " + data_string)

                        # time.sleep(1.5)
                        send_data = data
                        # if data[1] == 0x05:
                        #     send_data = b'\x06\x05\x00\x01\x02\x03\x04'
                        # elif data[1] == 0x01:
                        #     send_data = b'\x03\x01\x00\x20'
                        # else:
                        #     send_data = b'\x01\x01'

                        if self.debug_log:
                            print("TCPServer sent: ", send_data)
                        sock.send(send_data)

                    # client disconnected, so remove from socket list
                    except:
                        # broadcast_data(sock, "Client (%s, %s) is offline" % addr)
                        traceback.print_exc()
                        print("Client (%s, %s) is offline" % addr)
                        sock.close()
                        CONNECTION_LIST.remove(sock)
                        continue


        server_socket.close()
        print("server socket closed")
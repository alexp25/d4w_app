import SocketServer
import copy
import datetime
import time
from multiprocessing import Queue

from modules.data import variables


class TCPRequestHandler(SocketServer.StreamRequestHandler):
    def handle(self):
        try:
            # print "Connection from: %s" % str(self.client_address)
            # request_msg = self.rfile.readline(1024)
            # msg = "[simple_tcp_server] "+str(request_msg)
            # if not appVariables.qDebug1.full():
            #     appVariables.qDebug1.put(msg)
            # self.wfile.write('211,\n')
            # self.wfile.flush()
            self.request.setblocking(0)
            t0=time.time()
            self.data=''
            self.index=0

            msg = "[TCPRequestHandler] new connection at " + str(self.client_address[0])
            if not variables.qDebug1.full():
                variables.qDebug1.put(msg)

            # update client list with connected client
            clientInList = False
            for i in range(len(variables.clientList)):
                if variables.clientList[i]['ip'] == self.client_address[0]:
                    msg = "[TCPRequestHandler] already in list"
                    if not variables.qDebug1.full():
                        variables.qDebug1.put(msg)
                    clientInList = True
                    variables.clientList[i]['id'] = -1
                    variables.clientList[i]['type'] = -1
                    variables.clientListFcn[i]['t0'] = t0
                    variables.clientListFcn[i]['t0_polling'] = t0
                    variables.clientListFcn[i]['t0_log'] = t0
                    break

            if not clientInList:
                msg = "[TCPRequestHandler] add client "
                if not variables.qDebug1.full():
                    variables.qDebug1.put(msg)

                newClientFcn = copy.deepcopy(variables.clientModelFcn)
                newClientFcn['q_in'] = Queue(maxsize=20)
                newClientFcn['q_out'] = Queue(maxsize=20)
                newClientFcn['t0'] = t0
                newClientFcn['t0_polling'] = t0
                newClientFcn['t0_log'] = t0
                variables.clientListFcn.append(newClientFcn)
                newClient = copy.deepcopy(variables.clientModel)
                newClient['ip'] = self.client_address[0]
                newClient['counter_rx'] = 0
                newClient['counter_tx'] = 0
                variables.clientList.append(newClient)
            else:
                msg = "[TCPRequestHandler] update client "
                if not variables.qDebug1.full():
                    variables.qDebug1.put(msg)

            while 1:
                time.sleep(0.0001)
                t1=time.time()
                # self.data = self.request.recv(1024)
                # self.c = self.request.recv(1)
                # handle sending data
                for i in range(len(variables.clientList)):
                    if variables.clientList[i]['ip'] == self.client_address[0]:
                        # handle external data
                        if not variables.clientListFcn[i]['q_out'].empty():
                            new_data = variables.clientListFcn[i]['q_out'].get(block=False)
                            variables.clientList[i]['counter_tx'] = variables.clientList[i]['counter_tx'] + 1
                            new_data = variables.add_checksum(new_data)
                            new_data += '\n'

                            # print 'send to ' + self.client_address[0] + ': ' + new_data
                            self.request.send(new_data)
                            try:
                                if (not variables.qTCPOut.full()) and (variables.clientList[i]['data'][0] != 211):
                                    variables.qTCPOut.put(
                                        '[' + str(variables.clientList[i]['id']) + '] ' + new_data)
                            except:
                                pass
                # handle receiving data
                while 1:
                    time.sleep(0.00001)
                    try:
                        self.c = self.rfile.read(1)
                    except:
                        break

                    if self.c != '\n':
                        self.data += self.c
                    self.index += 1
                    # try:
                    #     self.data = self.rfile.readline()
                    # except:
                    #     break

                    if ((self.c == '\n') or (self.index >= 1024)):
                    # if True:
                        self.index = 0
                        clientNumStr = self.data.split(",")
                        # print clientNumStr
                        clientData = [0] * len(clientNumStr)
                        i = 0
                        for i in range(len(clientNumStr)):
                            try:
                                clientData[i] = int(clientNumStr[i])
                            except:
                                clientData[i] = 0

                        # update client list
                        # print 'received from ' + self.client_address[0] + ': '+ self.data
                        for i in range(len(variables.clientList)):
                            if variables.clientList[i]['ip'] == self.client_address[0]:
                                variables.clientList[i]['in'] = self.data
                                if len(clientData)>=3:
                                    variables.clientList[i]['id'] = clientData[1]
                                    variables.clientList[i]['type'] = clientData[2]
                                variables.clientList[i]['data'] = clientData

                                if not variables.clientListFcn[i]['q_in'].full():
                                    variables.clientListFcn[i]['q_in'].put(
                                        {'str': self.data, 'data': clientData})

                                variables.clientListFcn[i]['t0'] = t1
                                variables.clientList[i]['counter_rx'] = variables.clientList[i][
                                                                               'counter_rx'] + 1
                        self.data=''
                        break
                # end while


                # handle timeouts (received data)
                expired=False
                for i in range(len(variables.clientList)):
                    if variables.clientList[i]['ip'] == self.client_address[0]:
                        if (t1 - variables.clientListFcn[i]['t0']) > 5:
                            variables.clientListFcn[i]['t0'] = t1
                            msg = "[TCPRequestHandler] " + ' no data ' + ' at  ' + str(self.client_address[0]) + '. socket closed'
                            if not variables.qDebug1.full():
                                variables.qDebug1.put(msg)

                            del variables.clientListFcn[i]
                            del variables.clientList[i]
                            expired = True
                        break

                if expired:
                    break

        except:
            variables.print_exception("[TCPRequestHandler] exception. closing socket at " + self.client_address[0])


def simple_tcp_server():
    msg = "[simple_tcp_server] start"
    if not variables.qDebug1.full():
        variables.qDebug1.put(msg)

    tcp_server = SocketServer.ThreadingTCPServer(
        ("0.0.0.0", 8087),
        RequestHandlerClass=TCPRequestHandler,
        bind_and_activate=False)

    tcp_server.allow_reuse_address = True
    tcp_server.server_bind()
    tcp_server.server_activate()

    tcp_server.serve_forever()

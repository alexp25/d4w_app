import time
import traceback
from datetime import datetime
from threading import Thread

from modules.data import variables


class Log(Thread):

    def __init__(self):
        # constructor
        Thread.__init__(self)
        # 0: no debug log
        # 1: only print
        # 2: only file
        # 3: print and file
        self.debug_log = 1


    def init(self):
        pass
        # variables.writeFile("files/log.txt", "log " + str(datetime.now()))
        # variables.writeFile("files/recv.txt", "log " + str(datetime.now()))
        # variables.writeFile("files/send.txt", "log " + str(datetime.now()))
        # variables.writeFile("files/parsed_recv.txt", "log " + str(datetime.now()))

    def run(self):
        """
        running the tests in a separate thread for non blocking behaviour in the server
        """
        print(self.__class__.__name__ + " started")
        self.init()
        while True:
            time.sleep(variables.LOOP_DELAY)
            data = variables.getFromQueue(variables.qLog)
            if data is not None:
                # put data into the destination queue
                if data[0] is not None:
                    # save data in log file

                    try:
                        if data[0][0] == 'q':
                            variables.addToQueue(getattr(variables, data[0]), data[1])
                    except:
                        pass

                else:
                    # variables.addToFile("files/log.txt", data[1])
                    pass

                # if data[0] == 'qRecv':
                #     variables.addToFile("files/recv.txt", data[1])
                # elif data[0] == 'qSend':
                #     variables.addToFile("files/send.txt", data[1])
                # elif data[0] == 'mParsedRecv':
                #     variables.addToFile("files/parsed_recv.txt", data[1])
                if data[0] == 'mLog':
                    # print("log")
                    if self.debug_log == 1:
                        print(data[1])
                    elif self.debug_log == 2:
                        variables.addToFile("files/log.txt", data[1])
                    elif self.debug_log == 3:
                        print(data[1])
                        variables.addToFile("files/log.txt", data[1])




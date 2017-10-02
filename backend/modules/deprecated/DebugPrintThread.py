import datetime
import sys
import time
from threading import Thread

from modules.data import variables


class DebugPrintThread(Thread):
    def run(self):
        buffer_log=[]
        n_max_log=50
        dt_log=60
        cnt_log=0
        t0_log=time.time()
        first_log=True

        def array2str(a):
            str1=''
            for s in a:
                str1+=s+'\n'
            return str1

        msg = "[DebugPrintThread] " + "running"
        if not variables.qDebug1.full():
            variables.qDebug1.put(msg)

        while True:
            time.sleep(0.01)
            if variables.qDebug1.empty()==False:
                variables.flags["new_server_data"]=True
                try:
                    crt_time = datetime.datetime.now().strftime("%H:%M:%S.%f")
                    p=crt_time + ': ' + variables.qDebug1.get(block=False)
                    print(p)

                    buffer_log.append(p)
                    cnt_log += 1

                    if variables.qDebug2.full()==False:
                        variables.qDebug2.put(p)
                except:
                    exc_type, exc_value = sys.exc_info()[:2]
                    exceptionMessage = str(exc_type.__name__) + ': ' + str(exc_value)
                    crt_time = datetime.datetime.now().strftime("%H:%M:%S.%f")
                    msg = "[debugPrintThread] " + exceptionMessage
                    p = crt_time + ': ' + msg
                    print(p)

                    if variables.qDebug2.full()==False:
                        variables.qDebug2.put(msg)

            # write buffer log to file every dt (if new elements), or every n elements
            # t1_log = time.time()
            # if (cnt_log >= n_max_log) or (((t1_log - t0_log) >= dt_log) and (cnt_log > 0)):
            #     t0_log = t1_log
            #
            #     open_style="a"
            #     if first_log:
            #         open_style="w"
            #         first_log=False
            #
            #     with open(appVariables.appConfig['log_file_stdout'], open_style) as myfile:
            #         for e in buffer_log:
            #             myfile.write(e + '\r\n')
            #     buffer_log = []
            #     cnt_log = 0
import pyodbc
import sys
import datetime
##server = 'yourserver.database.windows.net'
##database = 'yourdatabase'
##username = 'yourusername'
##password = 'yourpassword'
##driver= '{ODBC Driver 13 for SQL Server}'
server = 'DESKTOP-OBL3M97\SQLEXPRESS'
# server = '(local)'
database = 'WaterNetworkTest'
username = 'DESKTOP-OBL3M97\Alex'
username = 'alex'
password = 'alexupb'
##driver= '{SQL Server}'
driver= '{ODBC Driver 13 for SQL Server}'
##cnxn = pyodbc.connect('DRIVER='+driver+';PORT=1433;SERVER='+server+';PORT=1443;DATABASE='+database+';UID='+username+';PWD='+ password)

def print_exception(msg):
    exc_type, exc_value = sys.exc_info()[:2]
    exceptionMessage = str(exc_type.__name__) + ': ' + str(exc_value)
    em1 = 'Error on line {}'.format(sys.exc_info()[-1].tb_lineno)
    msg1 = msg + ' ' + em1 + ', ' + exceptionMessage
    print msg1

        
try:
    cnxn = pyodbc.connect('DRIVER='+driver+';SERVER='+server+';DATABASE='+database+';UID='+username+';PWD='+ password)
except:
    print_exception("")

##cnxn = pyodbc.connect(
##    r'DRIVER={ODBC Driver 13 for SQL Server};'
##    r'SERVER=DESKTOP-OBL3M97\SQLEXPRESS;'
##    r'DATABASE=WaterNetworkTest;'
##    r'UID=DESKTOP-OBL3M97\Alex;'
##    r'PWD=alexupb'
##    )



cursor = cnxn.cursor()
tm=datetime.datetime.now()
cursor.execute("insert into SensorData_Flow(Timestamp, Value, Pipe_ID) values (?, ?, ?)", tm, 100, 2)
cnxn.commit()

cursor.execute("SELECT * FROM SensorData_Flow")
data = cursor.fetchall()


print(data)

for row in cursor.columns(table='SensorData_Flow'):
    print row.column_name
    # for field in row:
    #     print field




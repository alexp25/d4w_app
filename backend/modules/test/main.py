from TCPServer import TCPServer

if __name__ == '__main__':
    t = TCPServer("127.0.0.1", 9001)
    t.start()

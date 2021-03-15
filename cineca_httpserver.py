import os
import sys
import json
import tarfile
from ftplib import FTP
import http.client
from http.server import BaseHTTPRequestHandler, HTTPServer

class GP(BaseHTTPRequestHandler):
    def _set_headers(self,statusCode, content_type):
        self.send_response(statusCode)
        #self.send_header('Content-type', 'application/json')
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_HEAD(self):
        self._set_headers(200)

    def buildErrorResponseObject(self, query, msg):
        response={}
        response['query']=query
        response['success']=False
        error={}
        error['message']=msg
        response['error']=error
        return response

    def buildSuccessResponseObject(self, query, data):
        response={}
        response['query']=query
        response['success']=True
        response['data']=data
        return response

    def sendStringAsJsonResponse(self, str, statusCode):
        self._set_headers(statusCode, 'application/json')
        self.wfile.write(bytes(str,'utf-8'))

    def sendJsonResponse(self, obj, statusCode):
        str = json.dumps(obj, sort_keys=True, indent=2)
        self._set_headers(statusCode, 'application/json')
        self.wfile.write(bytes(str,'utf-8'))

    def sendXmlResponse(self, somexml, statusCode):
        self._set_headers(statusCode, 'application/xml; charset=utf-8')
        self.wfile.write(bytes(somexml,'utf-8'))

    def do_GET(self):

        error_msg='ERROR, invalid URL: ' + self.path

        try:
            if self.path[0:19]=='/bitem/cineca/fake/':
                fname = self.path[19:]
                fullname = base_dir + fname
                print('serving fake file: ' + fullname)

                data=None
                nf = open(fullname, 'r')
                data = nf.read()
                nf.close()
                if data is not None:
                    obj = json.loads(data)
                    result = obj['response']['result']
                    response = self.buildSuccessResponseObject(self.path, result)
                    self.sendJsonResponse(response, 200)
                    return
                else:
                    err_msg = 'Could not read content from file: ' + fullname

            elif self.path[0:18]=='/bitem/cineca/toto':
                response = self.buildSuccessResponseObject(self.path, {'toto': 'happy'})
                self.sendJsonResponse(response, 200)
                return

        except:
            error_msg = str(sys.exc_info()[1])

        print(error_msg)
        obj = self.buildErrorResponseObject(self.path, error_msg)
        self.sendJsonResponse(obj,400)


def run(server_class=HTTPServer, handler_class=GP, port=8088):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print('Cineca Server running at localhost:8088...')
    httpd.serve_forever()

# - - - - - - - - - - - - - - - - - - - - - - - - - -
# Main
# - - - - - - - - - - - - - - - - - - - - - - - - - -
base_dir="./data/"
run()

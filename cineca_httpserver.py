import os
import sys
import json
import tarfile
import argparse
from ftplib import FTP
import http.client
from http.server import BaseHTTPRequestHandler, HTTPServer
import datetime
import traceback
import random


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

    def get_remote_connection(self, service):
        protocol = properties[service + '.protocol']
        server = properties[service + '.server']
        if (protocol == 'https'):
            return http.client.HTTPSConnection(server)
        else:
            return http.client.HTTPConnection(server)

    def get_remote_baseurl(self, service):
        return properties[service + '.baseurl']

    def get_param(self, name):
        params = self.path.split("?")
        if len(params)==1: return ""
        kv_list = params[1].split("&")
        for kv in kv_list:
            arr = kv.split("=")
            if arr[0]==name and len(arr)>1: return arr[1]
        return ""

    def do_GET(self):

        error_msg='ERROR, invalid URL: ' + self.path

        try:

            log_it('GET request', self.path)
            log_it('env: ' + env)

            if self.path[0:32]=='/bitem/cineca/proxy/ega_studies/':
                # - - - During DEV it was useful
                #connection = http.client.HTTPSConnection("denver.text-analytics.ch")
                #url = '/bitem/ega_studies/' + self.path[32:]
                # - - - When this service is on PROD on denver server
                # connection = http.client.HTTPConnection("localhost:9200") # localhost = denver
                connection = self.get_remote_connection('EGA_STUDIES')
                url = self.get_remote_baseurl('EGA_STUDIES') + self.path[32:]
                log_it('PROXY', url)
                connection.request("GET", url)
                response = connection.getresponse()
                if response.status != 200:
                    error_msg = "Remote server returned an error: " + response.reason
                    obj = self.buildErrorResponseObject(self.path, error_msg)
                    self.sendJsonResponse(obj,400)
                    return

                data = response.read().decode("utf-8")
                obj = json.loads(data)
                studies = list()
                for hit in obj["hits"]["hits"]:
                    study = hit["_source"]
                    studies.append(study)

                response = self.buildSuccessResponseObject(self.path, studies)
                self.sendJsonResponse(response, 200)
                return

            elif self.path[0:60]=='/bitem/cineca/proxy/synvar/generate/litterature/fromMutation':
                # '/synvar/generate/litterature/fromMutation'
                connection = self.get_remote_connection('EXPANSION_VARIANTS')
                url = self.get_remote_baseurl('EXPANSION_VARIANTS')
                # replace %gene and %variants with query values
                log_it('PROXY', url)
                connection.request("GET", url)
                response = connection.getresponse()
                data = response.read().decode("utf-8")
                obj = json.loads(data)
                response = self.buildSuccessResponseObject(self.path, obj)
                self.sendJsonResponse(response, 200)
                return

			elif self.path[0:69]=='/bitem/cineca/proxy/catalogue_explorer/DatadrivenExpansion/?keywords=':
                # '/catalogue_explorer/DatadrivenExpansion/'
                keywords = self.path[69:]
                print("keywords: ", keywords)
                connection = self.get_remote_connection('EXPANSION_DATADRIVEN')
                url = self.get_remote_baseurl('EXPANSION_DATADRIVEN') + keywords
                log_it('PROXY', url)
                connection.request("GET", url)
                response = connection.getresponse()
                print("Status {} and reason {}".format(response.status, response.reason))
                data = response.read().decode("utf-8")
                obj = json.loads(data)
                response = self.buildSuccessResponseObject(self.path, obj)
                self.sendJsonResponse(response, 200)
                return

            elif self.path[0:71]=='/bitem/cineca/proxy/catalogue_explorer/VerticalExpansionMesh/?keywords=':
                # '/catalogue_explorer/VerticalExpansionMesh/'
                keywords = self.path[71:]
                print("keywords: ", keywords)
                connection = self.get_remote_connection('EXPANSION_VERTICAL_MESH')
                url = self.get_remote_baseurl('EXPANSION_VERTICAL_MESH') + keywords
                log_it('PROXY', url)
                connection.request("GET", url)
                response = connection.getresponse()
                print("Status {} and reason {}".format(response.status, response.reason))
                data = response.read().decode("utf-8")
                obj = json.loads(data)
                response = self.buildSuccessResponseObject(self.path, obj)
                self.sendJsonResponse(response, 200)
                return

            elif self.path[0:41]=='/bitem/cineca/proxy/ega_datasets?studies=':
                # we get local copy of Studies
                # for each study we get its list of datasets from ega
                studies = list()
                std_list = self.path[41:].split(",")
                for std_id in std_list:
                    print("std_id: ", std_id);
                    connection = self.get_remote_connection('EGA_STUDIES')
                    url = self.get_remote_baseurl('EGA_STUDIES') + '_search?size=1&q=' + std_id
                    log_it('PROXY', url)
                    connection.request("GET", url)
                    response = connection.getresponse()
                    data = response.read().decode("utf-8")
                    obj = json.loads(data)
                    if obj["hits"] and obj["hits"]["hits"] and obj["hits"]["hits"][0]:
                        hit = obj["hits"]["hits"][0]
                        study = hit["_source"]
                        study["id"] = std_id

                        connection = self.get_remote_connection('EGA_STUDY_DATASETS')
                        url = self.get_remote_baseurl('EGA_STUDY_DATASETS') + std_id
                        log_it('PROXY', url)
                        connection.request("GET", url)
                        response = connection.getresponse()
                        data = response.read().decode("utf-8")
                        obj = json.loads(data)
                        if obj["response"] and obj["response"]["result"]:
                            study["datasets"] = obj["response"]["result"]
                        else:
                            study["datasets"] = []
                            study["error"] = "datasets not found"
                    else:
                        study = {"id": std_id, "error": "study not found"}
                    studies.append(study)

                response = self.buildSuccessResponseObject(self.path, studies)
                self.sendJsonResponse(response, 200)
                return

            elif self.path[0:21]=='/bitem/cineca/detail/':
                tail = self.path[21:]
                data = list()
                for ch in tail: data.append({"ch": ch, "ord": ord(ch)})
                response = self.buildSuccessResponseObject(self.path, data)
                self.sendJsonResponse(response, 200)
                return


            elif self.path[0:28]=='/bitem/cineca/proxy/cohorts/':
                connection = self.get_remote_connection('COHORT_SEARCH')
                url = self.get_remote_baseurl('COHORT_SEARCH') + '_search?size=10000q='
                params = list()
                p = self.get_param('disease')
                if p != '': params.append(p)
                p = self.get_param('variants')
                if p != '': params.append(p)
                p = self.get_param('other')
                if p != '': params.append(p)
                url += "%20AND%20".join(params)
                connection.request("GET", url)
                response = connection.getresponse()
                log_it('PROXY', url)
                data = response.read().decode("utf-8")
                obj = json.loads(data)
                hits = list()
                if obj.get("hits") and obj["hits"].get("hits"):
                    for hit in obj["hits"]["hits"]: hits.append(hit)
                modify_hits(hits)
                response = self.buildSuccessResponseObject(self.path, hits)
                self.sendJsonResponse(response, 200)
                return

            elif self.path[0:41]=='/bitem/cineca/proxy/fake_bq_global_result':
                nf = open("data/fake_bq_global_result.json", 'r')
                data = nf.read()
                nf.close()
                obj = json.loads(data)
                response = self.buildSuccessResponseObject(self.path, obj["data"])
                self.sendJsonResponse(response, 200)
                return

            elif self.path[0:52]=='/bitem/cineca/proxy/fake_bq_detailed_result?sources=':
                nf = open("data/fake_bq_detailed_result.json", 'r')
                data = nf.read()
                nf.close()
                obj = json.loads(data)
                sources = self.path[52:]
                all_data = obj["data"];
                data = []
                for el in all_data:
                    if el["source"] in sources:
                        data.append(el)
                response = self.buildSuccessResponseObject(self.path, data);
                self.sendJsonResponse(response, 200)
                return


            elif self.path[0:25]=='/bitem/cineca/proxy/fake/':
                fname = self.path[25:]
                fullname = base_dir + fname
                log_it('serving fake file', fullname)

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


            elif self.path[0:24]=='/bitem/cineca/proxy/toto':
                response = self.buildSuccessResponseObject(self.path, {'toto': 'happy'})
                self.sendJsonResponse(response, 200)
                return

        except:
            traceback.print_exc()
            error_msg = str(sys.exc_info()[1])

        log_it(error_msg)
        obj = self.buildErrorResponseObject(self.path, error_msg)
        self.sendJsonResponse(obj,400)

# temp function to simulate multi-cohort data
def modify_hits(hits):
    datasets = ["COLAUS", "UK", "Child", "Africa"]
    for hit in hits:
        hit["dataset"] = datasets[random.randrange(0,4)]


def log_it(*things):
    now = datetime.datetime.now().isoformat().replace('T',' ')[:19]
    print(now, *things, flush=True)

def get_properties():
    props = dict()
    prop_file='cineca_httpserver.config.' + env
    f_in = open(prop_file, 'r')
    while True:
        line = f_in.readline()
        if line == '': break
        if line[0:1] == '#' : continue
        if '=' in line:
            nv = line.split('=')
            name = nv[0].strip()
            # the value may contain "=" as well
            value = '='.join(nv[1:])
            value = value.strip()
            props[name]=value
    f_in.close()
    return props

def run(host, port, env):
    server_address = (host, port)
    httpd = HTTPServer(server_address, GP)
    log_it('Cineca Server ' + env + ' running at ' + host + ':' + str(port) + '...')
    httpd.serve_forever()

# - - - - - - - - - - - - - - - - - - - - - - - - - -
# Main
# - - - - - - - - - - - - - - - - - - - - - - - - - -

if __name__ == '__main__':

    parser = argparse.ArgumentParser(description="Run a simple HTTP proxy for cineca services")
    parser.add_argument("-s", "--server", default="localhost", help="IP address on which the server listens")
    parser.add_argument("-p", "--port", type=int, default=8088, help="port on which the server listens")
    parser.add_argument("-e", "--env", default="PROD", help="Environment of the server: DEV or PROD")
    args = parser.parse_args()

    env = args.env
    log_it('env', env)
    base_dir="./data/"
    log_it('base_dir', base_dir)
    properties = get_properties()
    for k in properties: log_it('property', k, '=', properties[k])
    if env == "PROD":
        sys.stdout = open('cineca_python_proxy.log', 'w')
        sys.stderr = open('cineca_python_proxy.err', 'w')
    run(host=args.server, port=args.port, env=args.env)

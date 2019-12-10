import xlrd
from datetime import datetime
from collections import OrderedDict
import json
from elasticsearch import Elasticsearch
from elasticsearch import helpers
import logging

# import Bill

es = Elasticsearch([{'host': 'localhost', 'port': 9200}])
# es = Elasticsearch([{'host': '10.0.30.115', 'port': 9200}])


#_basePath = "/SDS/ELK_Jai/docs/xlsx/"
_basePath = "/root/elastic/xlsx/"
_listFiles = []
_listBody = []
_listHeader = []
flag = 0
invoiceIndex = 0

logging.basicConfig(filename='xlxs_log.txt', filemode='a+',
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


def fnStrDateTime():
    now = datetime.now()
    dt_string = now.strftime("%Y%m%d_%H%M%S")
    return dt_string


def fnCreateFileName(fileName):
    return str(fileName) + "_" + fnStrDateTime() + ".log"


def fnPath():
    _listFiles.append("DetailedSalesReport_FINAL")
    return _listFiles


def fnGetWorksheet(j):
    wb = xlrd.open_workbook(_basePath + fnPath()[j] + ".xlsx")
    sheet = wb.sheet_by_index(0)
    tmpHeader = sheet.row_values(0)
    for i in range(0, len(sheet.row_values(0))):
        _listHeader.append(str(tmpHeader[i]).strip().replace(" ", "_"))

    print(_listHeader)
    mArr = []
    for i in range(1, sheet.nrows):
        row = sheet.row_values(i)
        if len(row[2]) > 0:
            if i > 1:
                fnInsert(mArr)
                del mArr[:]

            tmpArr = [int(row[0]), str(row[1]), str(row[2]), str(row[3]),
                      datetime(*xlrd.xldate_as_tuple(row[4], wb.datemode)),
                      datetime(*xlrd.xldate_as_tuple(row[5], wb.datemode)), float(row[6]), float(row[7]), float(row[8]),
                      float(row[9]), float(row[10]), float(row[11]), float(row[12]), float(row[13]), float(row[14]),
                      float(row[15]), float(row[16]), float(row[17])]

            mArr.append(tmpArr)
        else:
            mArr.append([row[0]])
            if i == sheet.nrows - 1:
                # print('insert')
                # print(mArr)
                fnInsert(mArr)
                del mArr[:]



def fnRun():
    fnGetWorksheet(0)
    print('success')


def fnInsert(arr):
    lst = []
    y = 0
    dic = {}
    lst_item = []
    a = 0
    for x in arr:
        if y == 0:
            # print(x)
            dic[_listHeader[0]] = x[0]
            dic[_listHeader[1]] = x[1]
            dic[_listHeader[2]] = x[2]
            dic[_listHeader[3]] = x[3]
            dic[_listHeader[4]] = x[4]
            dic[_listHeader[5]] = x[5]
            dic[_listHeader[6]] = x[6]
            dic[_listHeader[7]] = x[7]
            dic[_listHeader[8]] = x[8]
            dic[_listHeader[9]] = x[9]
            dic[_listHeader[10]] = x[10]
            dic[_listHeader[11]] = x[11]
            dic[_listHeader[12]] = x[12]
            dic[_listHeader[13]] = x[13]
            dic[_listHeader[14]] = x[14]
            dic[_listHeader[15]] = x[15]
            dic[_listHeader[16]] = x[16]
            dic[_listHeader[17]] = x[17]
        else:
            # print('sub:', x)
            dic_item = {'item': x[0]}
            lst_item.append(dic_item)
        y += 1

    dic['description'] = lst_item
    # dic['timestamp'] = datetime.now()
    actions = []
    actions.append({
        "_index": "detailed-sales-report-final",
        "_type": "test",
        # "_id": a,
        "_source": {
            "data": dic,
            "timestamp": datetime.now()
        }
    })
    try:
        helpers.bulk(es, actions)
        res = es.index(index="detailed-sales-report-final", doc_type="_doc", body=dic)
        # print(res)
    except Exception as e:
        logging.error("{0} start bulk error: {1}".format(datetime.now(), e))


fnRun()


import xlrd
from datetime import datetime
from collections import OrderedDict
import json
from elasticsearch import Elasticsearch
from elasticsearch import helpers
import logging

# import Bill

# es = Elasticsearch([{'host': 'localhost', 'port': 9200}])
es = Elasticsearch([{'host': '10.0.30.115', 'port': 9200}])


# _basePath = "/SDS/ELK_Jai/docs/xlsx/"
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

    # print(_listHeader)
    mArr = []
    mArr_1 = []
    for i in range(1, sheet.nrows):
        row = sheet.row_values(i)
        if len(row[2]) > 0:
            if i > 1:
                # mArr_1 = list(dict.fromkeys(mArr_1))
                # print(len(mArr_1))
                mArr.append(mArr_1)
                #print(mArr)
                # print(mArr)
                fnInsert(mArr)
                del mArr[:]
                del mArr_1[:]

            # print(row)
            tmpArr = [int(row[0]), str(row[1]), str(row[2]), str(row[3]),
                      datetime(*xlrd.xldate_as_tuple(row[4], wb.datemode)),
                      datetime(*xlrd.xldate_as_tuple(row[5], wb.datemode)), float(row[6]), float(row[7]), float(row[8]),
                      float(row[9]), float(row[10]), float(row[11]), float(row[12]), float(row[13]), float(row[14]),
                      float(row[15]), float(row[16]), float(row[17])]
            mArr.append(tmpArr)
        else:
            # print(row)
            mArr.append([row[0]])
            # print(row[0].rindex('-'))
            last = row[0].rindex('-')
            first = row[0][0:last].rindex('-')
            #print(row[0][first:last].replace("-", "").replace("()", "").strip())
            category = row[0][first:last].replace("-", "").replace("()", "").strip()
            # print(category)
            mArr_1.append(category)
            if i == sheet.nrows - 1:
                # print('insert')
                # print(mArr)
                mArr.append(mArr_1)
                fnInsert(mArr)
                del mArr[:]
                del mArr_1[:]
        



def fnRun():
    fnGetWorksheet(0)
    print('success')


def fnInsert(arr):
    lst = []
    y = 0
    dic = {}
    lst_item = []
    a = 0
    
    for x in range(0, len(arr)):
        
        if x == 0:
            dic[_listHeader[0]] = arr[x][0]
            dic[_listHeader[1]] = arr[x][1]
            dic[_listHeader[2]] = arr[x][2]
            dic[_listHeader[3]] = arr[x][3]
            dic[_listHeader[4]] = arr[x][4]
            dic[_listHeader[5]] = arr[x][5]
            dic[_listHeader[6]] = arr[x][6]
            dic[_listHeader[7]] = arr[x][7]
            dic[_listHeader[8]] = arr[x][8]
            dic[_listHeader[9]] = arr[x][9]
            dic[_listHeader[10]] = arr[x][10]
            dic[_listHeader[11]] = arr[x][11]
            dic[_listHeader[12]] = arr[x][12]
            dic[_listHeader[13]] = arr[x][13]
            dic[_listHeader[14]] = arr[x][14]
            dic[_listHeader[15]] = arr[x][15]
            dic[_listHeader[16]] = arr[x][16]
            dic[_listHeader[17]] = arr[x][17]
        elif x == len(arr) - 1:
            # print(len(arr[x]))
            dic['units'] = len(arr[x])
        else:
            dic_item = {'item':arr[x][0]}
            lst_item.append(dic_item)

    # print(lst_item)
    # return
    # for x in arr:
    #     if y == 0:
    #         # print(x)
    #         dic[_listHeader[0]] = x[0]
    #         dic[_listHeader[1]] = x[1]
    #         dic[_listHeader[2]] = x[2]
    #         dic[_listHeader[3]] = x[3]
    #         dic[_listHeader[4]] = x[4]
    #         dic[_listHeader[5]] = x[5]
    #         dic[_listHeader[6]] = x[6]
    #         dic[_listHeader[7]] = x[7]
    #         dic[_listHeader[8]] = x[8]
    #         dic[_listHeader[9]] = x[9]
    #         dic[_listHeader[10]] = x[10]
    #         dic[_listHeader[11]] = x[11]
    #         dic[_listHeader[12]] = x[12]
    #         dic[_listHeader[13]] = x[13]
    #         dic[_listHeader[14]] = x[14]
    #         dic[_listHeader[15]] = x[15]
    #         dic[_listHeader[16]] = x[16]
    #         dic[_listHeader[17]] = x[17]
    #     elif y == 1:
    #         # print('sub:', x)
    #         dic_item = {'item': x[0]}
    #         lst_item.append(dic_item)
            
    #     y += 1

    dic['description'] = lst_item
    # dic['timestamp'] = datetime.now()

    # print(dic)

    actions = []
    actions.append({
        "_index": "detailed-sales-report-final-with-units",
        "_type": "_doc",
        # "_id": a,
        "_source": {
            "data": dic,
            "timestamp": datetime.now()
        }
    })
    try:
        helpers.bulk(es, actions)
        #res = es.index(index="detailed-sales-report-final", doc_type="_doc", body=dic)
        # print(res)
    except Exception as e:
        logging.error("{0} start bulk error: {1}".format(datetime.now(), e))


fnRun()


import xlrd
from datetime import datetime
from collections import OrderedDict
import json
from elasticsearch import Elasticsearch
from elasticsearch import helpers
import logging

es = Elasticsearch([{'host': 'localhost', 'port': 9200}])
# es = Elasticsearch([{'host': '10.0.30.115', 'port': 9200}])

# _basePath = "/SDS/ELK_Jai/docs/xlsx/"
_basePath = "/root/elastic/xlsx/"
_listFiles = []
_listBody = []
_listHeader = []

logging.basicConfig(filename='xlxs_log.txt', filemode='a+',
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


def fnStrDateTime():
    now = datetime.now()
    dt_string = now.strftime("%Y%m%d_%H%M%S")
    return dt_string


def fnCreateFileName(fileName):
    return str(fileName) + "_" + fnStrDateTime() + ".log"


def fnPath():
    _listFiles.append("99hightide-customers")
    _listFiles.append("birthdates")
    _listFiles.append("checkins")
    _listFiles.append("Current Activty Report")
    _listFiles.append("detailedsalesreport")
    _listFiles.append("Inventory Purchases")
    _listFiles.append("Patient data")
    _listFiles.append("Proteus-Inventory-2019-11-19")
    _listFiles.append("Proteus420 - Monthly Grams Report_USELESS")
    _listFiles.append("Sales by Zipcode")
    _listFiles.append("Total Patient Sales")
    return _listFiles


def fnGetWorksheet(j):
    wb = xlrd.open_workbook(_basePath + fnPath()[j] + ".xlsx")
    sheet = wb.sheet_by_index(0)
    tmpHeader = sheet.row_values(0)
    for i in range(0, len(sheet.row_values(0))):
        _listHeader.append(str(tmpHeader[i]).strip().replace(" ", "_"))

    # print(_listHeader)
    print('start')

    for i in range(1, sheet.nrows):
        print('#{}. {}'.format(str(i), fnPath()[j]))

        obj = OrderedDict()
        row = sheet.row_values(i)
        for k in range(0, len(row)):
            if j == 0:
                if _listHeader[k] == 'ID':
                    id1 = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            id1 = int(row[k])
                        except:
                            id1 = 0
                    obj[_listHeader[k]] = id1
#                    obj['@timestamp'] = datetime.now()
                elif _listHeader[k] == 'ship_postal':
                    ship_postal = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            ship_postal = int(row[k])
                        except:
                            ship_postal = 0
                    obj[_listHeader[k]] = ship_postal
                elif _listHeader[k] == 'phone':
                    phone = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            phone = int(row[k])
                        except:
                            phone = 0
                    obj[_listHeader[k]] = phone
                elif _listHeader[k] == 'phone2':
                    phone2 = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            phone2 = int(row[k])
                        except:
                            phone2 = 0
                    obj[_listHeader[k]] = phone2
                elif _listHeader[k] == 'postal':
                    postal = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            postal = int(row[k])
                        except:
                            postal = 0.0
                    obj[_listHeader[k]] = postal
                elif _listHeader[k] == 'acc_no':
                    acc_no = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            acc_no = int(row[k])
                        except:
                            acc_no = 0
                    obj[_listHeader[k]] = acc_no
                elif _listHeader[k] == 'points':
                    points = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            points = float(row[k])
                        except:
                            points = 0.0
                    obj[_listHeader[k]] = points
                elif _listHeader[k] == 'newsletters':
                    newsletters = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            newsletters = int(row[k])
                        except:
                            newsletters = 0
                    obj[_listHeader[k]] = newsletters
                elif _listHeader[k] == 'banned':
                    banned = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            banned = int(row[k])
                        except:
                            banned = 0
                    obj[_listHeader[k]] = banned
                elif _listHeader[k] == 'taxexempt':
                    taxexempt = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            taxexempt = int(row[k])
                        except:
                            taxexempt = 0
                    obj[_listHeader[k]] = taxexempt
                elif _listHeader[k] == 'statetaxexempt':
                    statetaxexempt = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            statetaxexempt = int(row[k])
                        except:
                            statetaxexempt = 0
                    obj[_listHeader[k]] = statetaxexempt
                elif _listHeader[k] == 'credits':
                    credits = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            credits = float(row[k])
                        except:
                            credits = 0.0
                    obj[_listHeader[k]] = credits
                elif _listHeader[k] == 'dob':
                    dob = datetime.now()
                    if len(str(row[k]).strip()) > 0:
                        try:
                            dob = datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode))
                        except:
                            dob = datetime.now()
                    obj[_listHeader[k]] = dob
                elif _listHeader[k] == 'Customer_Since':
                    cust_since = datetime.now()
                    if len(str(row[k]).strip()) > 0:
                        try:
                            cust_since = datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode))
                        except:
                            cust_since = datetime.now()
                    obj[_listHeader[k]] = cust_since
                elif _listHeader[k] == 'recom_exp':
                    recom_exp = datetime.now()
                    if len(str(row[k]).strip()) > 0:
                        try:
                            recom_exp = datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode))
                        except:
                            recom_exp = datetime.now()
                    obj[_listHeader[k]] = recom_exp
                elif _listHeader[k] == 'account_exp':
                    account_exp = datetime.now()
                    if len(str(row[k]).strip()) > 0:
                        try:
                            account_exp = datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode))
                        except:
                            account_exp = datetime.now()
                    obj[_listHeader[k]] = account_exp
                else:
                    obj[_listHeader[k]] = row[k]
            elif j == 1:
                if _listHeader[k] == 'Date_Created':
                    dtcreated = ''
                    if len(str(row[k]).strip()) > 0:
                        try:
                            dtcreated = datetime.strptime(
                                str(datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode)))).isoformat()
                        except:
                            dtcreated = ''
                    obj[_listHeader[k]] = dtcreated
            elif j == 2:
                if _listHeader[k] == 'Check-In':
                    checkIn = ''
                    if len(str(row[k]).strip()) > 0:
                        try:
                            checkIn = str(datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode)))
                        except:
                            checkIn = ''
                    obj[_listHeader[k]] = checkIn
                elif _listHeader[k] == 'Check-Out':
                    checkOut = ''
                    if len(str(row[k]).strip()) > 0:
                        try:
                            checkOut = str(datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode)))
                        except:
                            checkOut = ''
                    obj[_listHeader[k]] = checkOut
                else:
                    obj[_listHeader[k]] = str(row[k])
            elif j == 3:
                if _listHeader[k] == 'Date':
                    date = ''
                    if len(str(row[k]).strip()) > 0:
                        try:
                            date = str(datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode)))
                        except:
                            date = ''
                    obj[_listHeader[k]] = date
                else:
                    obj[_listHeader[k]] = str(row[k])
            elif j == 4:
                if _listHeader[k] == 'date':
                    date = ''
                    if len(str(row[k]).strip()) > 0:
                        try:
                            date = str(datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode)))
                        except:
                            date = ''
                    obj[_listHeader[k]] = date
                else:
                    obj[_listHeader[k]] = str(row[k])
            elif j == 5:
                if _listHeader[k] == 'Date':
                    date = ''
                    if len(str(row[k]).strip()) > 0:
                        try:
                            date = str(datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode)))
                        except:
                            date = ''
                    obj[_listHeader[k]] = date
                else:
                    obj[_listHeader[k]] = str(row[k])
            elif j == 6:
                if _listHeader[k] == 'Created_Date':
                    date = ''
                    if len(str(row[k]).strip()) > 0:
                        try:
                            date = str(datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode)))
                        except:
                            date = ''
                    obj[_listHeader[k]] = date
                else:
                    obj[_listHeader[k]] = str(row[k])
            elif j == 7:
                obj[_listHeader[k]] = str(row[k])
            elif j == 8:
                if _listHeader[k] == 'Created':
                    date = ''
                    if len(str(row[k]).strip()) > 0:
                        try:
                            date = str(datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode)))
                        except:
                            date = ''
                    obj[_listHeader[k]] = date
                else:
                    obj[_listHeader[k]] = str(row[k])
            elif j == 9:
                obj[_listHeader[k]] = str(row[k])
            elif j == 10:
                obj[_listHeader[k]] = str(row[k])

        _listBody.append(obj)


    # insert data in elastic search
    indexName = fnPath()[j].replace(' ', '-').lower()
    typeName = "test"
    actions = []
    print(indexName)
    a = 1
    for data in _listBody:
        # res = es.index(index=indexName, body=data, doc_type="test")
        actions.append({
            "_index": indexName + "-2",
            "_type": typeName,
            # "_id": a,
            "_source": {
                "data": data,
                "timestamp": datetime.now()
            }
        })
        a += 1


    print("Total: " + str(len(actions)) + " - {0}".format(indexName))

    try:
        helpers.bulk(es, actions)
        print('Success {0} ...'.format(indexName))
    except Exception as e:
        logging.error("{0} start bulk error: {1}".format(datetime.now(), e))

    del _listHeader[:]
    del _listBody[:]


def fnRun():
    for x in range(0, 11):
        fnGetWorksheet(x)
        break


fnRun()


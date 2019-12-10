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
    tot_retail_value = 0.0

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
                    dtcreated = datetime.now()
                    if len(str(row[k]).strip()) > 0:
                        try:
                            dtcreated = datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode))
                        except:
                            dtcreated = datetime.now()
                    obj[_listHeader[k]] = dtcreated
            elif j == 2:
                if _listHeader[k] == 'Check-In':
                    checkIn = datetime.now()
                    if len(str(row[k]).strip()) > 0:
                        try:
                            checkIn = datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode))
                        except:
                            checkIn = datetime.now()
                    obj[_listHeader[k]] = checkIn
                elif _listHeader[k] == 'Check-Out':
                    checkOut = datetime.now()
                    if len(str(row[k]).strip()) > 0:
                        try:
                            checkOut = datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode))
                        except:
                            checkOut = datetime.now()
                    obj[_listHeader[k]] = checkOut
                elif _listHeader[k] == 'Age':
                    Age = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            Age = int(row[k])
                        except:
                            Age = 0
                    obj[_listHeader[k]] = Age
                else:
                    obj[_listHeader[k]] = str(row[k])
            elif j == 3:
                if _listHeader[k] == 'Date':
                    date = datetime.now()
                    if len(str(row[k]).strip()) > 0:
                        try:
                            date = datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode))
                        except:
                            date = datetime.now()
                    obj[_listHeader[k]] = date
                elif _listHeader[k] == 'New Patients':
                    no = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no = int(row[k])
                        except:
                            no = 0
                    obj[_listHeader[k]] = no
                elif _listHeader[k] == 'Visits':
                    no = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no = int(row[k])
                        except:
                            no = 0
                    obj[_listHeader[k]] = no
                elif _listHeader[k] == 'Cost':
                    no = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no = float(row[k])
                        except:
                            no = 0
                    obj[_listHeader[k]] = no
                elif _listHeader[k] == 'Product Sales':
                    no = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no = float(row[k])
                        except:
                            no = 0
                    obj[_listHeader[k]] = no
                elif _listHeader[k] == '# of Sales':
                    no = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no = int(row[k])
                        except:
                            no = 0
                    obj[_listHeader[k]] = no
                elif _listHeader[k] == '# of Deliveries':
                    no = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no = int(row[k])
                        except:
                            no = 0
                    obj[_listHeader[k]] = no
                elif _listHeader[k] == 'Discount':
                    no_d = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no_d = float(row[k])
                        except:
                            no_d = 0.0
                    obj[_listHeader[k]] = no_d
                elif _listHeader[k] == 'Sales Tax':
                    no_st = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no_st = float(row[k])
                        except:
                            no_st = 0.0
                    obj[_listHeader[k]] = no_st
                elif _listHeader[k] == 'Excise Tax':
                    no_et = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no_et = float(row[k])
                        except:
                            no_et = 0.0
                    obj[_listHeader[k]] = no_et
                elif _listHeader[k] == 'SubTotal':
                    no_stot = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no_stot = float(row[k])
                        except:
                            no_stot = 0.0
                    obj[_listHeader[k]] = no_stot
                elif _listHeader[k] == 'Total':
                    no_t = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no_t = float(row[k])
                        except:
                            no_t = 0.0
                    obj[_listHeader[k]] = no_t
                elif _listHeader[k] == 'Paid':
                    no_p = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no_p = float(row[k])
                        except:
                            no_p = 0.0
                    obj[_listHeader[k]] = no_p
                elif _listHeader[k] == 'Margin':
                    no_p = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            no_p = float(row[k])
                        except:
                            no_p = 0.0
                    obj[_listHeader[k]] = no_p
                else:
                    obj[_listHeader[k]] = str(row[k])
            elif j == 5:
                if _listHeader[k] == 'Received Qty':
                    rec_qty = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            rec_qty = int(row[k])
                        except:
                            rec_qty = 0
                    obj[_listHeader[k]] = rec_qty
                elif _listHeader[k] == 'Cost (each)':
                    cost = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            cost = float(row[k])
                        except:
                            cost = 0.0
                    obj[_listHeader[k]] = cost
                elif _listHeader[k] == 'Total Cost':
                    tot_cost = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            tot_cost = float(row[k])
                        except:
                            tot_cost = 0.0
                    obj[_listHeader[k]] = tot_cost
                elif _listHeader[k] == 'Date':
                    date = datetime.now()
                    if len(str(row[k]).strip()) > 0:
                        try:
                            date = datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode))
                        except:
                            date = datetime.now()
                    obj[_listHeader[k]] = date
                else:
                    try:
                        obj[_listHeader[k]] = str(row[k])
                    except:
                        obj[_listHeader[k]] = ''
            elif j == 4:
                try:
                    obj[_listHeader[k]] = str(row[k])
                except:
                    obj[_listHeader[k]] = ''
            elif j == 6:
                if _listHeader[k] == 'Created_Date':
                    date = datetime.now()
                    if len(str(row[k]).strip()) > 0:
                        try:
                            date = datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode))
                        except:
                            date = datetime.now()
                    obj[_listHeader[k]] = date
                elif _listHeader[k] == 'Phone':
                    ph = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            ph = int(row[k])
                        except:
                            date = 0
                    obj[_listHeader[k]] = ph
                elif _listHeader[k] == 'Recom Exp':
                    rexp = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            rexp = datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode))
                        except:
                            rexp = 0
                    obj[_listHeader[k]] = rexp
                elif _listHeader[k] == 'DL Exp':
                    rex_dl = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            rex_dl = datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode))
                        except:
                            rex_dl = 0
                    obj[_listHeader[k]] = rex_dl
                elif _listHeader[k] == 'Paid Invoices':
                    p_inc = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            p_inc = int(row[k])
                        except:
                            p_inc = 0
                    obj[_listHeader[k]] = p_inc
                elif _listHeader[k] == 'Total Weight':
                    t_weight = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            t_weight = float(row[k])
                        except:
                            t_weight = 0
                    obj[_listHeader[k]] = t_weight
                elif _listHeader[k] == 'Total $':
                    tot = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            tot = float(row[k])
                        except:
                            tot = 0
                    obj[_listHeader[k]] = tot
                elif _listHeader[k] == 'Avail':
                    avail = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            avail = float(row[k])
                        except:
                            avail = 0
                    obj[_listHeader[k]] = avail
                else:
                    try:
                        obj[_listHeader[k]] = str(row[k])
                    except:
                        obj[_listHeader[k]] = ''
            elif j == 7:
                if _listHeader[k] == 'UPC':
                    upc = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            upc = int(row[k])
                        except:
                            upc = 0
                    obj[_listHeader[k]] = upc
                elif _listHeader[k] == 'In_Stock':
                    stock = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            stock = int(row[k])
                            tot_retail_value = tot_retail_value + stock
                            print(tot_retail_value)
                        except:
                            stock = 0
                    obj[_listHeader[k]] = stock
                elif _listHeader[k] == 'Total_Stock':
                    t_stock = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            t_stock = int(row[k])
                        except:
                            t_stock = 0
                    obj[_listHeader[k]] = t_stock
                elif _listHeader[k] == 'Price':
                    price = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            price = float(str(row[k]).replace("$", "").replace(",",""))
                        except:
                            price = 0.0
                    obj[_listHeader[k]] = price
                elif _listHeader[k] == 'Cost':
                    cost = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            cost = float(str(row[k]).replace("$", "").replace(",",""))
                        except:
                            cost = 0.0
                    obj[_listHeader[k]] = cost
                elif _listHeader[k] == 'Value':
                    value = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            value = float(str(row[k]).replace("$", "").replace(",",""))
                        except:
                            value = 0.0
                    obj[_listHeader[k]] = value
                elif _listHeader[k] == 'Retail_Value':
                    r_value = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            r_value = float(str(row[k]).replace("$", "").replace(",",""))

                        except TypeError as e:
                            r_value = 0.0
                            print(e)
                    obj[_listHeader[k]] = r_value
                elif _listHeader[k] == 'Weight':
                    weight = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            weight = float(row[k])
                        except:
                            weight = 0.0
                    obj[_listHeader[k]] = weight
                else:
                    try:
                        obj[_listHeader[k]] = str(row[k])
                    except:
                        obj[_listHeader[k]] = ''
            elif j == 8:
                if _listHeader[k] == 'Drivers Lic.':
                    di = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            di = int(row[k])
                        except:
                            di = 0
                    obj[_listHeader[k]] = di
                elif _listHeader[k] == 'Rec.Num.':
                    r_no = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            r_no = int(row[k])
                        except:
                            r_no = 0
                    obj[_listHeader[k]] = r_no
                elif _listHeader[k] == 'Weight Allowed':
                    wa = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            wa = int(row[k])
                        except:
                            wa = 0
                    obj[_listHeader[k]] = wa
                elif _listHeader[k] == 'Weight Days':
                    wd = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            wd = int(row[k])
                        except:
                            wd = 0
                    obj[_listHeader[k]] = wd
                elif _listHeader[k] == 'Created':
                    date = ''
                    if len(str(row[k]).strip()) > 0:
                        try:
                            date = str(datetime(*xlrd.xldate_as_tuple(row[k], wb.datemode)))
                        except:
                            date = ''
                    obj[_listHeader[k]] = date
                else:
                    try:
                        obj[_listHeader[k]] = str(row[k])
                    except:
                        obj[_listHeader[k]] = ''
            elif j == 9:
                if _listHeader[k] == 'Customers':
                    cust = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            cust = int(row[k])
                        except:
                            cust = 0
                    obj[_listHeader[k]] = cust
                elif _listHeader[k] == 'Invoices':
                    inc = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            inc = int(row[k])
                        except:
                            inc = 0
                    obj[_listHeader[k]] = inc
                elif _listHeader[k] == 'Total':
                    tot = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            tot = float(row[k])
                        except:
                            tot = 0.0
                    obj[_listHeader[k]] = tot
                else:
                    try:
                        obj[_listHeader[k]] = str(row[k])
                    except:
                        obj[_listHeader[k]] = ''
            elif j == 10:
                if _listHeader[k] == '# of Sales':
                    sales = 0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            sales = int(row[k])
                        except:
                            sales = 0
                    obj[_listHeader[k]] = sales
                elif _listHeader[k] == 'Total':
                    tot = 0.0
                    if len(str(row[k]).strip()) > 0:
                        try:
                            tot = float(row[k])
                        except:
                            tot = 0.0
                    obj[_listHeader[k]] = tot
                else:
                    try:
                        obj[_listHeader[k]] = str(row[k])
                    except:
                        obj[_listHeader[k]] = ''

        _listBody.append(obj)




    # insert data in elastic search
    indexName = fnPath()[j].replace(' ', '-').lower()
    typeName = "_doc"
    actions = []
    print(indexName)
    a = 1
    for data in _listBody:
        # res = es.index(index=indexName, body=data, doc_type="test")
        actions.append({
            "_index": indexName + "-1",
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
    #for x in range(1, 11):
        # fnGetWorksheet(x)
    fnGetWorksheet(7)
        


fnRun()


import json
from datetime import datetime
from decimal import Decimal


def get_row_id(db, Table, cond):
    record = db.session.query(Table).filter_by(**cond).first()
    if record is None:
        return None
    return record.id


def strip_value(value, strip):
    if value is None:
        return value
    if isinstance(value, str):
        if strip:
            value = value.strip()
    elif isinstance(value, Decimal):
        value = float(value)
    return value


def build_rows_result(rows, items, process_none=True, json_items=[], strip=False):
    rst = []
    item_len = len(items)
    for row in rows:
        x = {}
        for i in range(0, item_len):
            name = items[i]
            if isinstance(row[i], datetime):
                x[name] = datetime.strftime(row[i], '%Y-%m-%d %H:%M:%S')
            elif name in json_items:
                try:
                    content = json.loads(row[i]) if row[i] is not None and row[i] != '' else ''
                except Exception as e:
                    content = row[i]
                x[name] = content
            elif process_none:
                value = row[i] if row[i] is not None else ''
                x[name] = strip_value(value, strip=strip)
            else:
                x[name] = strip_value(row[i], strip=strip)
        rst.append(x)
    return rst


def build_general_filter(TableClass, columns, keyword):
    filters = []
    for col in columns:
        filters.append(getattr(TableClass, col).like(keyword))
    return filters


def update_record(record, items, args):
    for item in items:
        if item in args and args[item] is not None:
            setattr(record, item, args[item])


def build_one_result(one, items, process_none=True, json_items=[]):
    record = {}
    for idx, item in enumerate(items):
        if item in json_items:
            record[item] = json.loads(one[idx]) if one[idx] is not None and one[idx] != '' else one[idx]
        else:
            record[item] = one[idx]
        if process_none and record[item] is None:
            record[item] = ''
    return record

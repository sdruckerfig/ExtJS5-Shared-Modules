Ext.define("Shared.overrides.patches.data.writer.Writer", {

    override: 'Ext.data.writer.Writer',

    getRecordData: function(record, operation) {
        var me = this,
            nameProperty = me.getNameProperty(),
            mapping = nameProperty !== 'name',
            idField = record.self.idField,
            key = idField[nameProperty] || idField.name,
            value = record.id,
            writeAll = me.getWriteAllFields(),
            ret, dateFormat, phantom, options, clientIdProperty, fieldsMap, data, field;
        
        if (idField.serialize) {
            value = idField.serialize(value);
        }

        if (!writeAll && operation && operation.isDestroyOperation) {
            ret = {};
            ret[key] = value;
        } else {
            dateFormat = me.getDateFormat();
            phantom = record.phantom;
            options = (phantom || writeAll) ? me.getAllDataOptions() : me.getPartialDataOptions();
            clientIdProperty = phantom && me.getClientIdProperty();
            fieldsMap = record.getFieldsMap();

            // patch here - SDD
            if (!options) {
                options = {
                    persist: true
                }
            }
          
            options.serialize = false;

            data = record.getData(options);

            ret = mapping ? {} : data;
            if (clientIdProperty) {
                ret[clientIdProperty] = value;
                delete data[key];
            } else if (!me.getWriteRecordId()) {
                delete data[key];
            }
            for (key in data) {
                value = data[key];
                if (!(field = fieldsMap[key])) {
                    if (mapping) {
                        ret[key] = value;
                    }
                } else {

                    if (field.isDateField && dateFormat && Ext.isDate(value)) {
                        value = Ext.Date.format(value, dateFormat);
                    } else if (field.serialize) {
                        value = field.serialize(value, record);
                    }
                    if (mapping) {
                        key = field[nameProperty] || key;
                    }
                    ret[key] = value;
                }
            }
        }
        return ret;
    }
});
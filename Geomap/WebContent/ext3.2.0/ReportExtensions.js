// add RegExp.escape if it has not been already added
if('function' !== typeof RegExp.escape) {
	RegExp.escape = function(s) {
		if('string' !== typeof s) {
			return s;
		}
		// Note: if pasting from forum, precede ]/\ with backslash manually
		return s.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
	}; // eo function escape
}



function contextSensitivePop( displaySetNum, instanceRecNum, colSeq) {
    document.contextform.DISPLAY_SET_NUM.value = displaySetNum;
    document.contextform.INSTANCE_REC_NUM.value = instanceRecNum;
    document.contextform.COL_SEQ.value = colSeq;

    var reportUrl = '';
    if(window.top.frames.mainFrame){
        reportUrl = window.top.frames.mainFrame.location.href;
    }
    document.contextform.bare.value = reportUrl;
    Ext.apply(contextParams, {
    'bare':reportUrl,
    'DISPLAY_SET_NUM':displaySetNum,
    'INSTANCE_REC_NUM':instanceRecNum,
    'COL_SEQ' : colSeq
    });

    var reportId = contextParams.REPORT_ID;
    var url =
    "Reportsgetcontextsenspopup/ajax/RelatedObjects?REPORT_ID="+reportId+"&COL_SEQ="+colSeq;
     makeJSONAjaxCall(url, null, true, getRelatedObjectsInfo, null);

}

function getDocument(valStr, col_type) {
	getDocumentPopup(valStr, col_type, '@jsmsg.DOC_NOT_AN_ATTACHMENT@');
}   
 
/**
 *
 */
Ext.ux.form.LovCombo = Ext.extend(Ext.form.ComboBox, {

	// {{{
    // configuration options
	/**
	 * It is automatically added to existing fields.
	 * Change it only if it collides with your normal field.
	 */
	 checkField:'checked'

	/**
	 */
    ,separator:','

	/**
	 * Change it only if you know what you are doing.
	 */
	// }}}
    // {{{
    ,initComponent:function() {
        
		// template with checkbox
		if(!this.tpl) {
			this.tpl = 
				 '<tpl for=".">'
				+'<div class="x-combo-list-item">'
				+'<img src="' + Ext.BLANK_IMAGE_URL + '" '
				+'class="ux-lovcombo-icon ux-lovcombo-icon-'
				+'{[values.' + this.checkField + '?"checked":"unchecked"' + ']}">'
				+'<div class="ux-lovcombo-item-text">{' + (this.displayField || 'text' )+ '}</div>'
				+'</div>'
				+'</tpl>'
			;
		}
 
        // call parent
        Ext.ux.form.LovCombo.superclass.initComponent.apply(this, arguments);

		// install internal event handlers
		this.on({
			 scope:this
			,beforequery:this.onBeforeQuery
			,blur:this.onRealBlur
		});

		// remove selection from input field
		this.onLoad = this.onLoad.createSequence(function() {
			if(this.el) {
				var v = this.el.dom.value;
				this.el.dom.value = '';
				this.el.dom.value = v;
			}
		});
 
    } // e/o function initComponent
    // }}}
	// {{{
	/**
	 * Disables default tab key bahavior
	 */
	,initEvents:function() {
		Ext.ux.form.LovCombo.superclass.initEvents.apply(this, arguments);

		// disable default tab handling - does no good
		this.keyNav.tab = false;

	} // eo function initEvents
	// }}}
	// {{{
	/**
	 * clears value
	 */
	,clearValue:function(field) {
		//this.value = '';
        field = field || this.valueField;
        var c= [];
        var d = this.value || '';
        if (d)
            c = d.split(this.separator);

		this.store.clearFilter();
		this.store.each(function(r) {
			r.set(this.checkField, false);
            c.remove(r.get(field));

		}, this);
       
        c = this.unique(c);
        d = c.join(this.separator);
        this.value = d;
		this.displayValue = this.getCheckedDisplay() || d;
		if(this.hiddenField) {
			this.hiddenField.value = this.value;
		}
		this.setRawValue(this.value);
		this.applyEmptyText();
	} // eo function clearValue
	// }}}
	// {{{
	/**
	 */
	,getCheckedDisplay:function() {
		var re = new RegExp(RegExp.escape(this.separator), "g");
		return this.getCheckedValue(this.displayField).replace(re, this.separator );
	} // eo function getCheckedDisplay
	// }}}
	// {{{
	/**
	 */
	,getCheckedValue:function(field) {
		field = field || this.valueField;
		var c = [];
        var d = this.value || '';
        if (d)
            c = d.split(this.separator);

		// store may be filtered so get all records
		var snapshot = this.store.snapshot || this.store.data;

		snapshot.each(function(r) {
			if(r.get(this.checkField)) {
				c.push(r.get(field));
			} else {
                c.remove(r.get(field));
            }
		}, this);
        
        c = this.unique(c);
        d = c.join(this.separator);


		return d;
	}
    , unique : function(arr){
            var ret = [],
                collect = {};

            Ext.each(arr, function(v) {
                if(!collect[v]){
                    ret.push(v);
                }
                collect[v] = true;
            });
            return ret;
        }
        
        
    // eo function getCheckedValue
	// }}}
	// {{{
	/**
	 * beforequery event handler - handles multiple selections
	 */
	,onBeforeQuery:function(qe) {
        this.store.baseParams.xinit_sv= this.getRawValue();
		qe.query = qe.query.replace(new RegExp(this.getCheckedDisplay() + '[ ' + RegExp.escape(this.separator) + ']*'), '');
	} // eo function onBeforeQuery
	// }}}
	// {{{
	/**
	 * blur event handler - runs only when real blur event is fired
	 */
	,onRealBlur:function() {
		this.list.hide();
		var rv = this.getRawValue();
		var rva = rv.split(new RegExp(RegExp.escape(this.separator) + ' *'));
		var va = [];
		var snapshot = this.store.snapshot || this.store.data;

		// iterate through raw values and records and check/uncheck items
		Ext.each(rva, function(v) {
			snapshot.each(function(r) {
				if(v === r.get(this.displayField)) {
					va.push(r.get(this.valueField));
				}
			}, this);
		}, this);
		this.setValue(va.join(this.separator));
		this.store.clearFilter();
	} // eo function onRealBlur
	// }}}
	// {{{
	/**
	 * Combo's onSelect override
	 */
	,onSelect:function(record, index) {
        if(this.fireEvent('beforeselect', this, record, index) !== false){

			// toggle checked field
			record.set(this.checkField, !record.get(this.checkField));

			// display full list

			// set (update) value and fire event
			this.setValue(this.getCheckedValue());

			if(this.store.isFiltered() || this.store.baseParams.query) {
				this.doQuery(this.allQuery, true);
			}
            this.fireEvent('select', this, record, index);
        }
	} // eo function onSelect
	// }}}
	// {{{
	/**
	 * Sets the value of the LovCombo
	 */
	,setValue:function(v) {
		if(v) {
			v = '' + v;
			if(this.valueField) {
				this.store.clearFilter();
				this.store.each(function(r) {
					var checked = !(!v.match(
						 '(^|' + this.separator + ')' + RegExp.escape(r.get(this.valueField))
						+'(' + this.separator + '|$)'))
					;

					r.set(this.checkField, checked);
				}, this);
				this.value = this.getCheckedValue();
				this.setRawValue(this.getCheckedDisplay());
				if(this.hiddenField) {
					this.hiddenField.value = this.value;
				}
			}
			else {
				this.value = v;
				this.setRawValue(v);
				if(this.hiddenField) {
					this.hiddenField.value = v;
				}
			}
			if(this.el) {
				this.el.removeClass(this.emptyClass);
			}
		}
		else {
			this.clearValue();
		}
	} // eo function setValue
	// }}}
	// {{{
	/**
	 * Selects all items
	 */
	,selectAll:function() {
        this.store.each(function(record){
            // toggle checked field
            record.set(this.checkField, true);
        }, this);

        //display full list
        this.doQuery(this.allQuery);
        this.setValue(this.getCheckedValue());
		this.fireEvent('selectall', this); 
    } // eo full selectAll
	// }}}
	// {{{
	/**
	 * Deselects all items. Synonym for clearValue
	 */
    ,deselectAll:function() {
		this.clearValue();
        this.setValue(this.getCheckedValue());
		this.fireEvent('selectall', this ); 
    } // eo full deselectAll 
	// }}}

}); // eo extend
 
// register xtype
Ext.reg('lovcombo', Ext.ux.form.LovCombo);

Ext.override(Ext.ux.form.LovCombo, {

    //True for use selectAll item
    addSelectAllItem:true,
    
    //Value of valueField for selectAll item
    selectAllValueField: '_all',
    
    //Value of textField for selectAll item
    selectAllTextField: 'Select All',
    
    //Toggle selectAll item
    allSelected:false,
    
    //Select correct action for selected record
    onViewClick : function(doFocus){
        var index = this.view.getSelectedIndexes()[0];
        if (this.addSelectAllItem && index == 0) {
            this.toggleAll();
        }else {            
            var r = this.store.getAt(index);
            if(r){
                this.onSelect(r, index);
            }
            if(doFocus !== false){
                this.el.focus();
            }
        }
    },
    
    //Specificaly css class for selactAll item : ux-lovcombo-list-item-all
    initComponent:function() {
        
        // template with checkbox
        if(!this.tpl) {
            this.tpl = 
                 '<tpl for=".">'
                    + '<tpl if="' + this.valueField + '==\''+this.selectAllValueField+'\'">'
                        +'<div class="x-combo-list-item ux-lovcombo-list-item-all">'
                        +'<img src="' + Ext.BLANK_IMAGE_URL + '" '
                        +'class="ux-lovcombo-icon ux-lovcombo-icon-'                
                        +'{[values.' + this.checkField + '?"checked":"unchecked"' + ']}">'
                        +'<div class="ux-lovcombo-item-text">' + (this.selectAllTextField || 'text' )+ '</div>'
                        +'</div>'
                    + '</tpl>'
                    + '<tpl if="' + this.valueField + '!=\''+this.selectAllValueField+'\'">'
                        +'<div class="x-combo-list-item">'
                        +'<img src="' + Ext.BLANK_IMAGE_URL + '" '
                        +'class="ux-lovcombo-icon ux-lovcombo-icon-'                
                        +'{[values.' + this.checkField + '?"checked":"unchecked"' + ']}">'
                        +'<div class="ux-lovcombo-item-text">{' + (this.displayField || 'text' )+ '}</div>'
                        +'</div>'
                    + '</tpl>'
                +'</tpl>'
            ;
        }
 
        // call parent
        Ext.ux.form.LovCombo.superclass.initComponent.apply(this, arguments);

        // install internal event handlers
        this.on({
             scope:this
            ,beforequery:this.onBeforeQuery
            ,blur:this.onRealBlur
        });

        // remove selection from input field
        this.onLoad = this.onLoad.createSequence(function() {
            if(this.el) {
                var v = this.el.dom.value;
                this.el.dom.value = '';
                this.el.dom.value = v;
            }
        });
 
    },
    
    //Escape selectAll item value if it's here
    getCheckedValue:function(field) {
        field = field || this.valueField;
        var c = [];
        var d = (field == this.displayField) ? (this.displayValue || '') : (this.value || '');
        if (d)
            c = d.split(this.separator);

        // store may be filtered so get all records
        var snapshot = this.store.snapshot || this.store.data;

        snapshot.each(function(r, index) {            
            if(((this.addSelectAllItem && index > 0) || !this.addSelectAllItem) && r.get(this.checkField)) {
                c.push(r.get(field));
            }
            if(!r.get(this.checkField)) {
                c.remove(r.get(field));
            }
        }, this);

        //return c.join(this.separator);
        c = this.unique(c);
        d = c.join(this.separator);

		return d;

    },
    
    //Using allChecked value
    setValue:function(v) {
        if(v) {
            v = '' + v;
            if(this.valueField) {
                this.store.clearFilter();
                this.allSelected = true;
                this.store.each(function(r, index) {
                    var checked = !(!v.match(
                         '(^|' + RegExp.escape(this.separator) + ')' + RegExp.escape(r.get(this.valueField))
                        +'(' + RegExp.escape(this.separator) + '|$)'))
                    ;

                    r.set(this.checkField, checked);
                    
                    if (this.addSelectAllItem && index > 0) {
                        this.allSelected = this.allSelected && checked;
                    }
                }, this);
                
                if (this.addSelectAllItem) {
                    if(this.store.data.itemAt(0))
                    this.store.getAt(0).set(this.checkField, this.allSelected);
                }
                this.displayValue = this.getCheckedDisplay() || v;
				this.lastSelectionText = this.displayValue;
                this.value = this.getCheckedValue() || v;
                
                this.setRawValue(this.displayValue);
                this.store.baseParams.STARTING_VALUE= this.displayValue;
                if(this.hiddenField) {
                    this.hiddenField.value = this.value;
                }
            }
            else {
                this.value = v;
                this.setRawValue(v);
                this.store.baseParams.STARTING_VALUE= v;
                if(this.hiddenField) {
                    this.hiddenField.value = v;
                }
            }
            if(this.el) {
                this.el.removeClass(this.emptyClass);
            }
        }
        else {
            this.clearValue();
			if(this.getCheckedValue() && this.getCheckedValue()!='') this.setValue(this.getCheckedValue());
        }
    },
    
    // Create a specific record for selectAll item
    initList : function(){
        if(!this.list){   
        
            //add specific record         
            if(this.store && this.addSelectAllItem){                
                var RecordType = Ext.data.Record.create([this.valueField, this.displayField]);
                var data = {};
                data[this.valueField] = this.selectAllValueField;
                data[this.displayField] = this.selectAllTextField;
                this.store.insert(0, [new RecordType(data)]);
            }
        
            var cls = 'x-combo-list';

            this.list = new Ext.Layer({
                shadow: this.shadow, cls: [cls, this.listClass].join(' '), constrain:false
            });

            var lw = this.listWidth || Math.max(this.wrap.getWidth(), this.minListWidth);
            this.list.setWidth(lw);
            this.list.swallowEvent('mousewheel');
            this.assetHeight = 0;

            if(this.title){
                this.header = this.list.createChild({cls:cls+'-hd', html: this.title});
                this.assetHeight += this.header.getHeight();
            }

            this.innerList = this.list.createChild({cls:cls+'-inner'});
            this.innerList.on('mouseover', this.onViewOver, this);
            this.innerList.on('mousemove', this.onViewMove, this);
            this.innerList.setWidth(lw - this.list.getFrameWidth('lr'));

            if(this.pageSize){
                this.footer = this.list.createChild({cls:cls+'-ft'});
                this.pageTb = new Ext.PagingToolbar({
                    store:this.store,
                    pageSize: this.pageSize,
                    renderTo:this.footer
                });
                this.assetHeight += this.footer.getHeight();
            }

            this.view = new Ext.DataView({
                applyTo: this.innerList,
                tpl: this.tpl,
                singleSelect: true,
                selectedClass: this.selectedClass,
                itemSelector: this.itemSelector || '.' + cls + '-item'
            });

            this.view.on('click', this.onViewClick, this);

            this.bindStore(this.store, true);

            if(this.resizable){
                this.resizer = new Ext.Resizable(this.list,  {
                   pinned:true, handles:'se'
                });
                this.resizer.on('resize', function(r, w, h){
                    this.maxHeight = h-this.handleHeight-this.list.getFrameWidth('tb')-this.assetHeight;
                    this.listWidth = w;
                    this.innerList.setWidth(w - this.list.getFrameWidth('lr'));
                    this.restrictHeight();
                }, this);
                this[this.pageSize?'footer':'innerList'].setStyle('margin-bottom', this.handleHeight+'px');
            }
        }
    },
    
    //Toggle action for de/selectAll
    toggleAll:function(){
        if(this.allSelected){
            this.allSelected = false;
            this.deselectAll();
        }else{
            this.allSelected = true;
            this.selectAll();
        }
    }
});  
  


Ext.data.CFQueryReader = function(meta, recordType){
        this.meta = meta || {};
        Ext.data.CFQueryReader.superclass.constructor.call(this, meta, recordType || meta.fields);
    };
    
    fItem= Ext.extend(Ext.BoxComponent, {
    render : function(td){
        td.style.width = '100%';
        fItem.superclass.render.call(this, td);
     }
});

Ext.reg('tbfilltext', fItem);

fillSpacer = function() {
        var s = document.createElement("div");
        s.className = "ytb-spacer";
        s.style.width= '20px';
        fillSpacer.superclass.constructor.call(this, s); 
    }

Ext.extend( fillSpacer, Ext.Toolbar.Item, {
 enable:Ext.emptyFn,
 disable:Ext.emptyFn,
 focus:Ext.emptyFn
});

Ext.reg('tbfillspacer', fillSpacer); 
    
    Ext.extend(Ext.data.CFQueryReader, Ext.data.ArrayReader, {
        read : function(response){
            var json = response.responseText;
            var o = eval("("+json+")");
            if(!o) {
                throw {message: "JsonReader.read: Json object not found"};
            }
            if(o.TOTALROWCOUNT){
                this.totalRowCount = o.TOTALROWCOUNT;
            }
            if(o.TOTALCOLUMNCOUNT){
                this.totalColumnCount = o.TOTALCOLUMNCOUNT;
            }
            if(o.DTTIME){
                this.dtTime = o.DTTIME;
            }
            if(o.REPORT_NAME){
                this.reportName = o.REPORT_NAME;
            }
            if(o.replaceTitle){
                this.replaceTitle = o.replaceTitle;
            }
            if(o.INSTANCEID){
                this.currentInstanceId = o.INSTANCEID;
            }
            if (o.PARAMSFORREQ) {
                this.paramsForReq = o.PARAMSFORREQ;
            }
            if (o.PARAMSFORREQDISP) {
                this.paramsForReqDisp = o.PARAMSFORREQDISP;
            }
            if (o.RUNTIMESORTCOLSEQ) {
                this.rtSortColSeq = o.RUNTIMESORTCOLSEQ;
            }
            if (o.RUNTIMESORTDIR) {
                this.rtSortDir = o.RUNTIMESORTDIR;
            }
            if (o.SRCHCOND) {
                this.srchCond = o.SRCHCOND;
            }
            //if(o.ERRMSG) {
                //Ext.get('errormessage').innerHtml= o.ERRMSG;
                //errorMessage(o.ERRMSG, 'errormessage');
                this.errmsg=o.ERRMSG;
                
            //}
            if (o.QUERY.summaryData) {
                this.summaryData = o.QUERY.summaryData;
            }
            return this.readRecords(((o.QUERY)? o.QUERY : o));
        },
        readRecords : function(o){
            var sid = this.meta ? this.meta.id : null;
            var recordType = this.recordType, fields = recordType.prototype.fields;
            var records = [];
            var root = o.DATA;

            // give sid an integer value that equates to it's mapping
            sid = fields.indexOfKey(sid);
            // re-assign the mappings to line up with the column position
            // in the returned json response
            for(var a = 0; a < o.COLUMNS.length; a++){
                for(var b = 0; b < fields.length; b++){
                    if(fields.items[b].mapping == o.COLUMNS[a]){
                        fields.items[b].mapping = a;
                    }
                }
            }
            for(var i = 0; i < root.length; i++){
                var n = root[i];
                var values = {};
                var id = ((sid || sid === 0) && n[sid] !== undefined && n[sid] !== "" ? n[sid] : null);
                for(var j = 0, jlen = fields.length; j < jlen; j++){
                    var f = fields.items[j];
                    var k = f.mapping !== undefined && f.mapping !== null ? f.mapping : j;
                    var v = n[k] !== undefined ? n[k] : f.defaultValue;
                    v = f.convert(v, n);
                    values[f.name] = v;
                }
                var record = new recordType(values, id);
                record.json = n;
                records[records.length] = record;
            }
            if(!this.totalRowCount){
                this.totalRowCount = records.length;
            }
            return {
                records : records,
                errmsg:this.errmsg,
                paramsForReq : this.paramsForReq,
                rtSortColSeq: this.rtSortColSeq,
                rtSortDir: this.rtSortDir,
                srchCond: this.srchCond,
                summaryData: this.summaryData,
                totalRecords : this.totalRowCount
            };
        }
    });

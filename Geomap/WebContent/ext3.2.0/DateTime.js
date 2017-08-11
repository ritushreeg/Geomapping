/*
 * SYSTEMi Copyright ï¿½ 2000-2003, MetricStream, Inc. All rights reserved.
 * Open source EXT component modified for usage in ECP
 * $Id: DateTime.js,v 1.1.2.9 2008-09-19 08:56:01 aviswanath Exp $
 */

/**
 * Ext.ux.form.DateTime Extension Class for Ext 2.x Library
 *
 * @author    Ing. Jozef Sakalos
 * @copyright (c) 2008, Ing. Jozef Sakalos
 * @version $Id: DateTime.js,v 1.1.2.9 2008-09-19 08:56:01 aviswanath Exp $
 *
 * @license Ext.ux.form.DateTime is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

/*global Ext */

Ext.ns('Ext.ux.form');

/**
 * @class Ext.ux.form.DateTime
 * @extends Ext.form.Field
 */
Ext.ux.form.DateTime = Ext.extend(Ext.form.Field, {
    /**
     * @cfg {String/Object} defaultAutoCreate DomHelper element spec
     * Let superclass to create hidden field instead of textbox. Hidden will be submittend to server
     */
     defaultAutoCreate:{tag:'input', type:'hidden'}
    /**
     * @cfg {Number} timeWidth Width of time field in pixels (defaults to 100)
     */
    ,timeWidth:100
    /**
     * @cfg {String} dtSeparator Date - Time separator. Used to split date and time (defaults to ' ' (space))
     */
    ,dtSeparator:' '
    /**
     * @cfg {String} hiddenFormat Format of datetime used to store value in hidden field
     * and submitted to server (defaults to 'Y-m-d H:i:s' that is mysql format)
     */
    ,hiddenFormat:'Y-m-d H:i:s'
    /**
     * @cfg {Boolean} otherToNow Set other field to now() if not explicly filled in (defaults to true)
     */
    ,otherToNow:true
    /**
     * @cfg {Boolean} emptyToNow Set field value to now on attempt to set empty value.
     * If it is true then setValue() sets value of field to current date and time (defaults to false)
     */
    /**
     * @cfg {String} timePosition Where the time field should be rendered. 'right' is suitable for forms
     * and 'below' is suitable if the field is used as the grid editor (defaults to 'right')
     */
    ,timePosition:'right' // valid values:'below', 'right'
    /**
     * @cfg {String} dateFormat Format of DateField. Can be localized. (defaults to 'm/y/d')
     */
    ,dateFormat:'m/d/Y'
    /**
     * @cfg {String} timeFormat Format of TimeField. Can be localized. (defaults to 'g:i:s A')
     */
    ,timeFormat:'g:i:s A'
    /**
     * @cfg {boolean} showTime Show time field or not
     */
    ,showTime:true
    /**
     * @cfg {boolean} showDate Show time field or not
     */
    ,showDate:true
    /**
     * @cfg {boolean} disable Time Field in case of Date only format
     */
    ,disableTimeField:false
    /**
     * @cfg {String} Date value
     */
    ,date:''
    /**
     * @cfg {String} Time value
     */
    ,time:''
    /**
     * @cfg {Object} dateConfig Config for DateField constructor.
     */
    /**
     * @cfg {Object} timeConfig Config for TimeField constructor.
     */
	,dateFlag :false
    // {{{
    /**
     * private
     * creates DateField and TimeField and installs the necessary event handlers
     */
    ,initComponent:function() {
        // call parent initComponent
        Ext.ux.form.DateTime.superclass.initComponent.call(this);

        if (!this.showTime && !this.showDate) {
            this.showDate = true;
        }

        if(!this.showTime){
            this.hiddenFormat = this.dateFormat;
        } else if (!this.showDate) {
            this.hiddenFormat = this.timeFormat;
        }

        // create DateField
        if (this.showDate) {
            var dateConfig = Ext.apply({}, {
                 id:this.id + '-date'
                ,name:this.id + '-date'
                ,format:this.dateFormat || Ext.form.DateField.prototype.format
                ,width:this.timeWidth
                ,selectOnFocus:this.selectOnFocus
                ,listeners:{
                      blur:{scope:this, fn:this.onBlur}
                     ,focus:{scope:this, fn:this.onFocus}
					 ,select:{scope:this, fn:this.doBlur} 
                }
            }, this.dateConfig);
            this.df = new Ext.form.DateField(dateConfig);
            this.df.setValue(this.date);
            delete(this.dateFormat);
        }

        // create TimeField
        if (this.showTime) {
            var timeConfig = Ext.apply({}, {
                 id:this.id + '-time'
                ,name:this.id + '-time'
                ,format:this.timeFormat || Ext.form.TimeField.prototype.format
                ,width:this.timeWidth
                ,selectOnFocus:this.selectOnFocus
                ,listeners:{
                      blur:{scope:this, fn:this.onBlur}
                     ,focus:{scope:this, fn:this.onFocus}
					 ,select:{scope:this, fn:this.doBlur}
                }
            }, this.timeConfig);
            this.tf = new Ext.form.TimeField(timeConfig);
            this.tf.setValue(this.time);
            delete(this.timeFormat);
            this.relayEvents(this.tf, ['focus', 'specialkey', 'invalid', 'valid']);
        }

        if (this.showDate) {
            // relay events
            this.relayEvents(this.df, ['focus', 'specialkey', 'invalid', 'valid']);
        }

    } // eo function initComponent
    /**
     * private
     * Renders underlying DateField and TimeField and provides a workaround for side error icon bug
     */
    ,onRender:function(ct, position) {
        // don't run more than once
        if(this.isRendered) {
            return;
        }

        // render underlying hidden field
        Ext.ux.form.DateTime.superclass.onRender.call(this, ct, position);

        // render DateField and TimeField
        // create bounding table
        var t;
        if('below' === this.timePosition || 'bellow' === this.timePosition) {
            t = Ext.DomHelper.append(ct, {tag:'table',style:'border-collapse:collapse',children:[
                 {tag:'tr',children:[{tag:'td', style:'padding-bottom:1px', cls:'ux-datetime-date'}]}
                ,{tag:'tr',children:[{tag:'td', cls:'ux-datetime-time'}]}
            ]}, true);
        }
        else {
            t = Ext.DomHelper.append(ct, {tag:'table',style:'border-collapse:collapse',children:[
                {tag:'tr',children:[
                    {tag:'td',style:'padding-right:4px', cls:'ux-datetime-date'},{tag:'td', cls:'ux-datetime-time'}
                ]}
            ]}, true);
        }

        Ext.DomHelper.append(ct,{tag:'input',type:'hidden',name:this.name + '_YEAR',id:this.name + '_YEAR'});
        Ext.DomHelper.append(ct,{tag:'input',type:'hidden',name:this.name + '_DAY',id:this.name + '_DAY'});
        Ext.DomHelper.append(ct,{tag:'input',type:'hidden',name:this.name + '_MONTH',id:this.name + '_MONTH'});
        Ext.DomHelper.append(ct,{tag:'input',type:'hidden',name:this.name + '_DAYVALUE',id:this.name + '_DAYVALUE'});
        if (this.showTime) {
            Ext.DomHelper.append(ct,{tag:'input',type:'hidden',name:this.name + '_HOUR',id:this.name + '_HOUR'});
            Ext.DomHelper.append(ct,{tag:'input',type:'hidden',name:this.name + '_MINUTE',id:this.name + '_MINUTE'});
            Ext.DomHelper.append(ct,{tag:'input',type:'hidden',name:this.name + '_SECOND',id:this.name + '_SECOND'});
        }

        this.tableEl = t;
//        this.wrap = t.wrap({cls:'x-form-field-wrap'});
        this.wrap = t.wrap();
        this.wrap.on("mousedown", this.onMouseDown, this, {delay:10});

        // render DateField & TimeField
        if (this.showDate) {
            this.df.render(t.child('td.ux-datetime-date'));
        }
        if (this.showTime) {
            this.tf.render(t.child('td.ux-datetime-time'));
        }
        // workaround for IE trigger misalignment bug
        if(Ext.isIE && Ext.isStrict) {
            t.select('input').applyStyles({top:0});
        }

        this.on('specialkey', this.onSpecialKey, this);
        if (this.showDate) {
            this.df.el.swallowEvent(['keydown', 'keypress']);
        }
        if (this.showTime) {
            this.tf.el.swallowEvent(['keydown', 'keypress']);
        }

        // create icon for side invalid errorIcon
        if('side' === this.msgTarget) {
            var elp = this.el.findParent('.x-form-element', 10, true);
            this.errorIcon = elp.createChild({cls:'x-form-invalid-icon'});

            if (this.showDate) {
                this.df.errorIcon = this.errorIcon;
            }
            if (this.showTime) {
                this.tf.errorIcon = this.errorIcon;
            }
        }

        // setup name for submit
        this.el.dom.name = this.hiddenName || this.name || this.id;

        // prevent helper fields from being submitted
        if (this.showDate) {
            this.df.el.dom.removeAttribute("name");
        }
        if (this.showTime) {
            this.tf.el.dom.removeAttribute("name");
        }

        // we're rendered flag
        this.isRendered = true;
        // update values
        this.updateValue();

    } // eo function onRender
    ,afterRender:function() {
        Ext.ux.form.DateTime.superclass.afterRender.call(this);
            if(this.disableTimeField){
                this.tf.hide();
            }
    }
    
    // {{{
    /**
     * private
     */
    ,adjustSize:Ext.BoxComponent.prototype.adjustSize


    /**
     * private
     */
    ,alignErrorIcon:function() {
        this.errorIcon.alignTo(this.tableEl, 'tl-tr', [2, 0]);
    }


    /**
     * private initializes internal dateValue
     */
    ,initDateValue:function() {
        this.dateValue = this.otherToNow ? new Date() : new Date(1970, 0, 1, 0, 0, 0);
    }


    /**
     * Calls clearInvalid on the DateField and TimeField
     */
    ,clearInvalid:function(){
        if (this.showDate) {
            this.df.clearInvalid();
        }
        if (this.showTime) {
            this.tf.clearInvalid();
        }
    } // eo function clearInvalid


    /**
     * Disable this component.
     * @return {Ext.Component} this
     */
    ,disable:function() {
        if(this.isRendered) {
            if (this.showDate) {
                this.df.disabled = this.disabled;
                this.df.onDisable();
            }
            if (this.showTime) {
                this.tf.onDisable();
            }
        }
        this.disabled = true;
        if (this.showDate) {
            this.df.disabled = true;
        }
        if (this.showTime) {
            this.tf.disabled = true;
        }
        this.fireEvent("disable", this);
        return this;
    } // eo function disable


    /**
     * Enable this component.
     * @return {Ext.Component} this
     */
    ,enable:function() {
        if(this.rendered){
            if (this.showDate) {
                this.df.onEnable();
            }
            if (this.showTime) {
                this.tf.onEnable();
            }
        }
        this.disabled = false;
        if (this.showDate) {
            this.df.disabled = false;
        }
        if (this.showTime) {
            this.tf.disabled = false;
        }
        this.fireEvent("enable", this);
        return this;
    } // eo function enable


    /**
     * private Focus date filed
     */
    ,focus:function() {
        if (this.showDate) {
            this.df.focus();
        }
    } // eo function focus


    /**
     * private
     */
    ,getPositionEl:function() {
        return this.wrap;
    }


    /**
     * private
     */
    ,getResizeEl:function() {
        return this.wrap;
    }


    /**
     * @return {Date/String} Returns value of this field
     */
    ,getValue:function() {
        // create new instance of date
        return this.dateValue ? new Date(this.dateValue) : '';
    } // eo function getValue


    /**
     * @return {Boolean} true = valid, false = invalid
     * private Calls isValid methods of underlying DateField and TimeField and returns the result
     */
    ,isValid:function() {
        if (this.showTime && this.showDate) {
            return this.df.isValid() && this.tf.isValid();
        } else if (this.showDate) {
            return this.df.isValid();
        } else if (this.showTime) {
            return this.tf.isValid();
        }
    } // eo function isValid


    /**
     * Returns true if this component is visible
     * @return {boolean}
     */
    ,isVisible : function(){
        if (this.showDate) {
            return this.df.rendered && this.df.getActionEl().isVisible();
        }
    } // eo function isVisible


    /**
     * private Handles blur event
     */
    ,onBlur:function(f) {
        // called by both DateField and TimeField blur events

        // revert focus to previous field if clicked in between
        if(this.wrapClick) {
            f.focus();
            this.wrapClick = false;
        }
		if(!this.dateFlag){
        // update underlying value
        if(f === this.df) {
            this.updateDate();
        }
        else {
            this.updateTime();
        }
        this.updateHidden();

        // fire events later
        (function() {
            if(!(this.showDate && this.df.hasFocus) && !(this.showTime && this.tf.hasFocus)) {
                var v = this.getValue();
                if(String(v) !== String(this.startValue)) {
                    this.fireEvent("change", this, v, this.startValue);
                }
                this.hasFocus = false;
                this.fireEvent('blur', this);
            }
        }).defer(0, this);
		}
		this.dateFlag = false;
    } // eo function onBlur


    /**
     * private Handles focus event
     */
    ,onFocus:function() {
        if(!this.hasFocus){
            this.hasFocus = true;
            this.startValue = this.getValue();
            this.fireEvent("focus", this);
        }
    }


    /**
     * private Just to prevent blur event when clicked in the middle of fields
     */
    ,onMouseDown:function(e) {
        if(!this.disabled) {
            this.wrapClick = 'td' === e.target.nodeName.toLowerCase();
        }
    }


    /**
     * private
     * Handles Tab and Shift-Tab events
     */
    ,onSpecialKey:function(t, e) {
        var key = e.getKey();
        if(key === e.TAB) {
            if(this.showTime && t === this.df && !e.shiftKey) {
                e.stopEvent();
                this.tf.focus();
            }
            if(this.showDate && this.showTime && t === this.tf && e.shiftKey) {
                e.stopEvent();
                this.df.focus();
            }
        }
        // otherwise it misbehaves in editor grid
        if(key === e.ENTER) {
            this.updateValue();
        }

    } // eo function onSpecialKey


    /**
     * private Sets the value of DateField
     */
    ,setDate:function(date) {
        if (this.showDate) {
            this.df.setValue(date);
        }
    } // eo function setDate

    ,getDate:function( ) {
        if (this.showDate) {
            return this.df.getValue();
        }
    } // eo function setDate


    /**
     * private Sets the value of TimeField
     */
    ,setTime:function(date) {
        if (this.showTime) {
            this.tf.setValue(date);
        }
    } // eo function setTime

    ,getTime:function( ) {
        if (this.showTime) {
            return this.tf.getValue();
        }
    }

    /**
     * private
     * Sets correct sizes of underlying DateField and TimeField
     * With workarounds for IE bugs
     */
    ,setSize:function(w, h) {
        if(!w) {
            return;
        }
        if('below' === this.timePosition) {
            if (this.showDate) {
                this.df.setSize(w, h);
            }
            if (this.showTime) {
                this.tf.setSize(w, h);
            }
            if(Ext.isIE) {
                if (this.showDate) {
                    this.df.el.up('td').setWidth(w);
                }
                if (this.showTime) {
                    this.tf.el.up('td').setWidth(w);
                }
            }
        }
        else {
            if (this.showDate) {
                this.df.setSize(w - this.timeWidth - 4, h);
            }
            if (this.showTime) {
                this.tf.setSize(this.timeWidth, h);
            }

            if(Ext.isIE) {
                if (this.showDate) {
                    this.df.el.up('td').setWidth(w - this.timeWidth - 4);
                }
                if (this.showTime) {
                    this.tf.el.up('td').setWidth(this.timeWidth);
                }
            }
        }
    } // eo function setSize


    /**
     * @param {Mixed} val Value to set
     * Sets the value of this field
     */
    ,setValue:function(val) {
        if(!val && true === this.emptyToNow) {
            this.setValue(new Date());
            return;
        }
        else if(!val) {
            this.setDate('');
            this.setTime('');
            this.updateValue();
            return;
        }
        if ('number' === typeof val) {
          val = new Date(val);
        }
        val = val ? val : new Date(1970, 0 ,1, 0, 0, 0);
        var da, time;
        if(val instanceof Date) {
            this.setDate(val);
            this.setTime(val);
            this.dateValue = new Date(val);
        }
        else {
            da = val.split(this.dtSeparator);
            this.setDate(da[0]);
            if(da[1]) {
                this.setTime(da[1]);
            }
        }
        this.updateValue();
    } // eo function setValue


    /**
     * Hide or show this component by boolean
     * @return {Ext.Component} this
     */
    ,setVisible: function(visible){
        if(visible) {
            if (this.showDate) {
                this.df.show();
            }
            if (this.showTime) {
                this.tf.show();
            }
        }else{
            if (this.showDate) {
                this.df.hide();
            }
            if (this.showTime) {
                this.tf.hide();
            }
        }
        return this;
    } // eo function setVisible

    //{{{
    ,show:function() {
        return this.setVisible(true);
    } // eo function show
    //}}}
    //{{{
    ,hide:function() {
        return this.setVisible(false);
    } // eo function hide
    //}}}

    /**
     * private Updates the date part
     */
    ,updateDate:function() {

        if (this.showDate) {
            var d = this.df.getValue();
            if(d) {
                if(!(this.dateValue instanceof Date)) {
                    this.initDateValue();
                    if(this.showTime && !this.tf.getValue()) {
                        this.setTime(this.dateValue);
                    }
                }
                this.dateValue.setMonth(0); // because of leap years
                Ext.DomQuery.selectNode('input[name=' + this.name + '_YEAR]').value = d.getFullYear();
                Ext.DomQuery.selectNode('input[name=' + this.name + '_MONTH]').value = d.getMonth() + 1;
                Ext.DomQuery.selectNode('input[name=' + this.name + '_DAY]').value = d.getDate();
                Ext.DomQuery.selectNode('input[name=' + this.name + '_DAYVALUE]').value = d.getDay() + 1;
                this.dateValue.setFullYear(d.getFullYear());
                this.dateValue.setMonth(d.getMonth());
                this.dateValue.setDate(d.getDate());
            } else {
                Ext.DomQuery.selectNode('input[name=' + this.name + '_YEAR]').value = '';
                Ext.DomQuery.selectNode('input[name=' + this.name + '_MONTH]').value = '';
                Ext.DomQuery.selectNode('input[name=' + this.name + '_DAY]').value = '';
                Ext.DomQuery.selectNode('input[name=' + this.name + '_DAYVALUE]').value = '';
				this.dateValue = '';
            }
        } else {
            this.dateValue = '';
            var d = new Date();
            Ext.DomQuery.selectNode('input[name=' + this.name + '_YEAR]').value = d.getFullYear();
            Ext.DomQuery.selectNode('input[name=' + this.name + '_MONTH]').value = d.getMonth() + 1;
            Ext.DomQuery.selectNode('input[name=' + this.name + '_DAY]').value = d.getDate();
            Ext.DomQuery.selectNode('input[name=' + this.name + '_DAYVALUE]').value = d.getDay() + 1;
        }
        if(this.showTime){
            this.updateTime();
        }
    } // eo function updateDate


    /**
     * private
     * Updates the time part
     */
    ,updateTime:function() {
        var t;
        if (this.showTime) {
            t = this.tf.getValue();
        }
        if(t && !(t instanceof Date) && this.showTime) {
            t = Date.parseDate(t, this.tf.format);
        }
        if(t && !(this.showDate && this.df.getValue())) {
            this.initDateValue();
            this.setDate(this.dateValue);
        }
        if(this.dateValue instanceof Date && this.showTime) {
            if(t) {
                Ext.DomQuery.selectNode('input[name=' + this.name + '_HOUR]').value = t.getHours();
                Ext.DomQuery.selectNode('input[name=' + this.name + '_MINUTE]').value = t.getMinutes();
                Ext.DomQuery.selectNode('input[name=' + this.name + '_SECOND]').value = t.getSeconds();
                this.dateValue.setHours(t.getHours());
                this.dateValue.setMinutes(t.getMinutes());
                this.dateValue.setSeconds(t.getSeconds());
                this.dateValue.setMilliseconds(t.getMilliseconds());
            } else {
                Ext.DomQuery.selectNode('input[name=' + this.name + '_HOUR]').value = '';
                Ext.DomQuery.selectNode('input[name=' + this.name + '_MINUTE]').value = '';
                Ext.DomQuery.selectNode('input[name=' + this.name + '_SECOND]').value = '';
            }
        }
    } // eo function updateTime
    /**
     * private Updates the underlying hidden field value
     */
    ,updateHidden:function() {
        if(this.isRendered) {
            var value = this.dateValue instanceof Date ? this.dateValue.format(this.hiddenFormat) : '';
            this.el.dom.value = value;
        }
    }
    /**
     * private Updates all of Date, Time and Hidden
     */
    ,updateValue:function() {
        this.updateDate();
        this.updateTime();
        this.updateHidden();
        return;
    } // eo function updateValue


    /**
     * @return {Boolean} true = valid, false = invalid
     * callse validate methods of DateField and TimeField
     */
    ,validate:function() {
        if (this.showTime && this.showDate) {
            return this.df.validate() && this.tf.validate();
        } else if (this.showDate) {
            return this.df.validate();
        } else if (this.showTime) {
                return this.tf.validate();
        }
    } // eo function validate

    /**
     * clears the date field
     */
    ,clear:function() {
        this.date = '';
        this.time = '';
        this.el.dom.value = '';
        if (this.showDate) {
            this.setDate('');
            Ext.DomQuery.selectNode('input[name=' + this.name + '_YEAR]').value = '';
            Ext.DomQuery.selectNode('input[name=' + this.name + '_MONTH]').value = '';
            Ext.DomQuery.selectNode('input[name=' + this.name + '_DAY]').value = '';
            Ext.DomQuery.selectNode('input[name=' + this.name + '_DAYVALUE]').value = '';
        }

        if (this.showTime) {
            this.setTime('');
            Ext.DomQuery.selectNode('input[name=' + this.name + '_MINUTE]').value = '';
            Ext.DomQuery.selectNode('input[name=' + this.name + '_HOUR]').value = '';
            Ext.DomQuery.selectNode('input[name=' + this.name + '_SECOND]').value = '';
        }
    }


    /**
     * Returns renderer suitable to render this field
     * @param {Object} Column model config
     */
    ,renderer: function(field) {
        var format = field.editor.dateFormat || Ext.ux.form.DateTime.prototype.dateFormat;
        format += ' ' + (field.editor.timeFormat || Ext.ux.form.DateTime.prototype.timeFormat);
        var renderer = function(val) {
            var retval = Ext.util.Format.date(val, format);
            return retval;
        };
        return renderer;
    } // eo function renderer
	,doBlur : function() {  
        if(this.df) {
			this.updateDate();
        }
        if(this.tf) {
			this.updateTime();
        }
        this.updateHidden();
		this.dateFlag = true;
        // fire events later
        (function() {
        var v = this.getValue();
        if(String(v) !== String(this.startValue)) {
			this.fireEvent("change", this, v, this.startValue);
			}
			this.hasFocus = false;
			this.fireEvent('blur', this);
        }).defer(0, this);
    }
}); // eo extend

// register xtype
Ext.reg('datetime', Ext.ux.form.DateTime);

// eof

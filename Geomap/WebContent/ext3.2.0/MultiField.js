Ext.ns('Ext.ux.form');

/**
 * Ext.ux.form.MultiField extension Class for Ext 2.x Library
 *
 * @author    G. Praveen Kumar (praveen@metricstream.com)
 * @copyright (c) 2008, MetricStream Inc.
 * @version $Id: MultiField.js,v 1.1.2.4 2008-11-05 13:01:51 praveen Exp $
 *
 * @class Ext.ux.form.MultiField
 * @extends Ext.form.Field
 * @constructor
 * Provides a form field that can encapsulate a number of form fields in a single row.
 * @param {Object} config The config object
 */
Ext.ux.form.MultiField = Ext.extend(Ext.form.Field, {

    /**
     * @cfg {String/Object} defaultAutoCreate DomHelper element spec
     */
     defaultAutoCreate:{tag:'input', type:'hidden'}

    /**
     * @cfg {Array} configs of all the fields that needs to be encapsulated in this multi field
     */
    ,fields:[]

    ,initComponent:function() {
        Ext.ux.form.MultiField.superclass.initComponent.call(this);
        var cols = this.columns ? this.columns : this.fields.length;
        this.childPanel = new Ext.Panel({
             border:false
            ,bodyBorder:false
            ,layout:'table'
            ,layoutConfig:{
                columns : cols
            }
            ,defaults:{
                ctCls : 'margin-right-4'
            }
        });
        for(var i = 0; i < this.fields.length; i++) {
            var comp = this.getComponent(this.fields[i]);
            this.childPanel.add(comp);
        }
    }
    /**
     * Renders all the contained fields.
     * @param ct
     * @param position
     */
    ,onRender:function(ct, position) {
        if(this.isRendered) {
            return;
        }
        Ext.ux.form.MultiField.superclass.onRender.call(this, ct, position);
        this.getEl().addClass('ux-multifield');
        this.childPanel.render(Ext.DomHelper.append(ct, {tag:'div',style:'width:auto;'}, true));
    }
    /**
     * private
     * Creates and returns a component according to config. TextField is the default type.
     * @param conf
     */
    ,getComponent:function(conf) {
        var cmp;

        if (conf.xtype == 'box') {
            cmp = new Ext.BoxComponent(conf);
        } else if (conf.xtype == 'button') {
            cmp = new Ext.Button(conf);
        } else if (conf.xtype == 'checkbox') {
            cmp = new Ext.form.Checkbox(conf);
        } else if (conf.xtype == 'combo') {
            cmp = new Ext.form.ComboBox(conf);
        } else if (conf.xtype == 'datefield') {
            cmp = new Ext.form.DateField(conf);
        } else if (conf.xtype == 'htmleditor') {
            cmp = new Ext.form.HtmlEditor(conf);
        } else if (conf.xtype == 'label') {
            cmp = new Ext.form.Label(conf);
        } else if (conf.xtype == 'numberfield') {
            cmp = new Ext.form.NumberField(conf);
        } else if (conf.xtype == 'radio') {
            cmp = new Ext.form.Radio(conf);
        } else if (conf.xtype == 'textarea') {
            cmp = new Ext.form.TextArea(conf);
        } else if (conf.xtype == 'textfield') {
            cmp = new Ext.form.TextField(conf);
        } else if (conf.xtype == 'timefield') {
            cmp = new Ext.form.TimeField(conf);
        } else if (conf.xtype == 'trigger') {
            cmp = new Ext.form.TriggerField(conf);
        } else if (conf.xtype == 'colorfield') {
            cmp = new Ext.ux.form.ColorPickerfield(conf);        
		} else if (conf.xtype == 'colorpickerfield') {
            cmp = new Ext.ux.form.ColorPickerField(conf);
        }else if (conf.xtype == 'datetime') {
            cmp = new Ext.ux.form.DateTime(conf);
        } else {
            cmp = new Ext.form.TextField(conf);
        }

        return cmp;
    }
});

// Register the xtype for this field
Ext.reg('multifield', Ext.ux.form.MultiField);
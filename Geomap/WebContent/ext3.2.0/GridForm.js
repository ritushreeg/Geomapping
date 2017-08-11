Ext.ns('Ext.ux');

/**
 * Ext.ux.GridForm extension Class for Ext 2.x Library
 *
 * @author    G. Praveen Kumar (praveen@metricstream.com)
 * @copyright (c) 2008, MetricStream Inc.
 * @version $Id: GridForm.js,v 1.1.2.9 2008-10-18 11:42:08 praveen Exp $
 *
 * @class Ext.ux.GridForm
 * @extends Ext.Panel
 * @constructor
 * A Panel that can display a set of form fields as a grid.
 * @param {Object} config The config object
 */
Ext.ux.GridForm = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Boolean} stripeRows True to stripe the rows. Default is false.
     */
     stripeRows : false
    /**
     * @cfg {Array} columns The headings of each column. The count of this array is the number of columns.
     */
    ,columns:[]
    /**
     * @cfg {Array} fields The configs of all the components to be added to this panel.
     */
    ,fields:[]
    /**
     * @cfg {Boolean} fill True to make the table have 100% width, false otherwise. Default is true.
     */
    ,fill : true
    /**
     * @cfg {String} gridStyle Extra css style to be added to the grid.
     */
    ,gridStyle : ''
    /*
     * private
     */
    ,rowCount:0
    /*
     * private
     */
    ,maxIndex:0
    /**
     * private
     * Intiaalizres the component.
     */
    ,initComponent : function(){
        Ext.ux.GridForm.superclass.initComponent.call(this);
    }
    /**
     * private
     * Renders all the contained fields.
     * @param ct
     * @param position
     */
    ,onRender:function(ct, position) {
        if(this.isRendered) {
            return;
        }

        Ext.ux.GridForm.superclass.onRender.apply(this, arguments);

        var headers = [];
        for(i=0;i<this.columns.length;i++){
            var extraStyle='padding:2px;';
            if(this.columns[i].width){
                extraStyle = extraStyle + 'width:'+this.columns[i].width+';';
            }
            if(this.columns[i].align){
                extraStyle = extraStyle + 'text-align:'+this.columns[i].align+';';
            } else{
            extraStyle = extraStyle + 'text-align:left;';}
            headers.push({tag:'th', cls:'x-gf-grid-hd',style:extraStyle, id:'ux-gf-head-' + this.id + '-' + i});
        }

        var head = [];
        head.push({tag:'tr',children:headers});

        var children = [];
        var indx = this.maxIndex;
        var i=0;
        var currClass = ''
        while(i<this.fields.length){
            var tmpChildren = [];
            for(j=0;j<this.columns.length;j++){
                var extraStyle='padding:2px;';
                if(this.columns[i%this.columns.length].width){
                    extraStyle = extraStyle + 'width:'+this.columns[i%this.columns.length].width+';';
                }
                if(this.columns[i%this.columns.length].align){
                    extraStyle = extraStyle + 'text-align:'+this.columns[i%this.columns.length].align+';';
                }
                children.push({tag:'td',style:extraStyle, cls:currClass, id:'ux-gf-cell-' + this.id + '-' + indx});
                indx++;
                i++;
                this.maxIndex++;
            }
            if(this.stripeRows){
                currClass = (currClass=='x-gf-grid-cell-odd') ? '' : 'x-gf-grid-cell-odd';
            }
            children.push({tag:'tr', children:tmpChildren});
            this.rowCount++;
        }

        var tableStyle = (this.fill) ? 'border-collapse:collapse;width:100%;':'border-collapse:collapse;width:auto;';

        tableStyle = tableStyle +this.gridStyle;

        Ext.DomHelper.append(this.body, {tag:'table',style:tableStyle,cls:'x-gf-grid'
            ,children:[head,children],id:'ux-gf-table-'+this.id
        }, false);

        for(i=0;i<this.columns.length;i++){
            var cmp = new Ext.form.Label({text:this.columns[i].title})
            cmp.render('ux-gf-head-' + this.id + '-' + i);
        }

        indx = 0;
        for(i=0;i<this.fields.length;i++){
            this.getComponent(this.fields[i]).render('ux-gf-cell-' + this.id + '-' + indx);
            indx++;
        }
        this.cleanTable();
    },
    // private
    afterRender : function(){
        Ext.ux.GridForm.superclass.afterRender.call(this);
        try{this.syncSize();} catch (e) {}
        try{this.getBottomToolbar().syncSize();} catch (e) {}
        try{this.getTopToolbar().syncSize();} catch (e) {}
    }
    /**
     * private
     * Removes unwanted <tr></tr> tags from the body of the generated table.
     */
    ,cleanTable:function(){
        var i = -1;
        if(Ext.get('ux-gf-table-'+this.id)){
            for(i=0; i<Ext.get('ux-gf-table-'+this.id).dom.childNodes[0].childNodes.length; i++) {
                if(Ext.get('ux-gf-table-'+this.id).dom.childNodes[0].childNodes[i].innerHTML== '') {
                    Ext.get('ux-gf-table-'+this.id).dom.childNodes[0].deleteRow(i);
                }
            }
        }
    }
    /**
     * Adds a new row to the GridForm.
     * @param rows Array of items to add to the new row.
     */
    ,addRow:function(rows) {
        this.cleanTable();
        if(Ext.get('ux-gf-table-'+this.id)){
            //Ext.get('ux-gf-table-'+this.id).remove();
            //alert(Ext.get('ux-gf-table-'+this.id).dom.childNodes[0].childNodes.length);
        }

        var children = [];
        var indx = this.maxIndex;
        var startIndx = this.maxIndex;
        var i=0;
        var currClass = ''
        if(this.stripeRows){
            currClass = ((this.rowCount-1)%2==1) ? '' : 'x-gf-grid-cell-odd';
        }
        while(i<rows.length){
            var tmpChildren = [];
            for(j=0;j<this.columns.length;j++){
                var extraStyle='padding:2px;';
                if(this.columns[i%this.columns.length].width){
                    extraStyle = extraStyle + 'width:'+this.columns[i%this.columns.length].width+';';
                }
                if(this.columns[i%this.columns.length].align){
                    extraStyle = extraStyle + 'text-align:'+this.columns[i%this.columns.length].align+';';
                }
                children.push({tag:'td',style:extraStyle, cls:currClass, id:'ux-gf-cell-' + this.id + '-' + indx});
                indx++;
                i++;
                this.maxIndex++;
            }
            children.push({tag:'tr', children:tmpChildren});
            this.rowCount++;
        }

        Ext.DomHelper.append(Ext.get('ux-gf-table-'+this.id).dom.childNodes[0], children, false);

        indx = startIndx;
        for(i=0;i<rows.length;i++){
            var cmp = this.getComponent(rows[i]);
            cmp.render('ux-gf-cell-' + this.id + '-' + indx);
            indx++;
        }
        this.cleanTable();
    }
    /**
     * private
     * Creates and returns a component according to config. TextField is the default type.
     * @param conf
     */
    ,getComponent:function(conf) {
        var cmp;

        if (conf.xtype == 'checkbox') {
            cmp = new Ext.form.Checkbox(conf);
        } else if (conf.xtype == 'button') {
            cmp = new Ext.Button(conf);
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
        } else if (conf.xtype == 'colorpickerfield') {
            cmp = new Ext.ux.form.ColorPickerField(conf);
        } else if (conf.xtype == 'box') {
            cmp = new Ext.BoxComponent(conf);
        } else if (conf.xtype == 'multifield') {
            cmp = new Ext.ux.form.MultiField(conf);
        } else {
            cmp = new Ext.form.TextField(conf);
        }

        return cmp;
    }
});

// Register the xtype for this component
Ext.reg('gridform', Ext.ux.GridForm);

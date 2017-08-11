/**
 * @class GetIt.GridPrinter
 * @author Ed Spencer (edward@domine.co.uk)
 * Class providing a common way of printing Ext.Components. Ext.ux.Printer.print delegates the printing to a specialised
 * renderer class (each of which subclasses Ext.ux.Printer.BaseRenderer), based on the xtype of the component.
 * Each renderer is registered with an xtype, and is used if the component to print has that xtype.
 * 
 * See the files in the renderers directory to customise or to provide your own renderers.
 * 
 * Usage example:
 * 
 * var grid = new Ext.grid.GridPanel({
 *   colModel: //some column model,
 *   store   : //some store
 * });
 * 
 * Ext.ux.Printer.print(grid);
 * 
 */
Ext.ux.Printer = function() {
  
  return {
    /**
     * @property renderers
     * @type Object
     * An object in the form {xtype: RendererClass} which is manages the renderers registered by xtype
     */
    renderers: {},
    
    /**
     * Registers a renderer function to handle components of a given xtype
     * @param {String} xtype The component xtype the renderer will handle
     * @param {Function} renderer The renderer to invoke for components of this xtype
     */
    registerRenderer: function(xtype, renderer) {
      this.renderers[xtype] = new (renderer)();
    },
    
    /**
     * Returns the registered renderer for a given xtype
     * @param {String} xtype The component xtype to find a renderer for
     * @return {Object/undefined} The renderer instance for this xtype, or null if not found
     */
    getRenderer: function(xtype) {
      return this.renderers[xtype];
    },
    
    /**
     * Prints the passed grid. Reflects on the grid's column model to build a table, and fills it using the store
     * @param {Ext.Component} component The component to print
     */
    print: function(component) {
      var xtypes = component.getXTypes().split('/');
      
      //iterate backwards over the xtypes of this component, dispatching to the most specific renderer
      for (var i = xtypes.length - 1; i >= 0; i--){
        var xtype    = xtypes[i],        
            renderer = this.getRenderer(xtype);
        
        if (renderer != undefined) {
          renderer.print(component);
          break;
        }
      }
    }
  };
}();

/**
 * Override how getXTypes works so that it doesn't require that every single class has
 * an xtype registered for it.
 */
Ext.override(Ext.Component, {
  getXTypes : function(){
      var tc = this.constructor;
      if(!tc.xtypes){
          var c = [], sc = this;
          while(sc){ //was: while(sc && sc.constructor.xtype) {
            var xtype = sc.constructor.xtype;
            if (xtype != undefined) c.unshift(xtype);
            
            sc = sc.constructor.superclass;
          }
          tc.xtypeChain = c;
          tc.xtypes = c.join('/');
      }
      return tc.xtypes;
  }
});

/**
 * @class Ext.ux.Printer.BaseRenderer
 * @extends Object
 * @author Ed Spencer
 * Abstract base renderer class. Don't use this directly, use a subclass instead
 */
Ext.ux.Printer.BaseRenderer = Ext.extend(Object, {
  /**
   * Prints the component
   * @param {Ext.Component} component The component to print
   */
  print: function(component) {
    var name = component && component.getXType
             ? String.format("print_{0}_{1}", component.getXType(), component.id)
             : "print";
             
    var win = window.open('', name);
    
    win.document.write(this.generateHTML(component));
    win.document.close();
    
    //win.print();
    //win.close();
  },
  
  /**
   * Generates the HTML Markup which wraps whatever this.generateBody produces
   * @param {Ext.Component} component The component to generate HTML for
   * @return {String} An HTML fragment to be placed inside the print window
   */
  generateHTML: function(component) {
    return new Ext.XTemplate(
      this.getDocType(),
      '<html>',
        '<head>',
          '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />',
          '<link href="' + this.stylesheetPath + '" rel="stylesheet" type="text/css" media="screen,print" />',
          '<title>' + this.getTitle(component) + '</title>',
        '</head>',
        '<body>',
          this.generateBody(component),
        '</body>',
      '</html>'
    ).apply(this.prepareData(component));
  },
  
  /**
   * Returns the HTML that will be placed into the print window. This should produce HTML to go inside the
   * <body> element only, as <head> is generated in the print function
   * @param {Ext.Component} component The component to render
   * @return {String} The HTML fragment to place inside the print window's <body> element
   */
  generateBody: Ext.emptyFn,
  
  /**
   * Prepares data suitable for use in an XTemplate from the component 
   * @param {Ext.Component} component The component to acquire data from
   * @return {Array} An empty array (override this to prepare your own data)
   */
  prepareData: function(component) {
    return component;
  },
  
  /**
   * Returns the title to give to the print window
   * @param {Ext.Component} component The component to be printed
   * @return {String} The window title
   */
  getTitle: function(component) {
    return typeof component.getTitle == 'function' ? component.getTitle() : (component.title || "Printing");
  },

  getDocType: function() {
      return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
  },
  
  /**
   * @property stylesheetPath
   * @type String
   * The path at which the print stylesheet can be found (defaults to 'stylesheets/print.css')
   */
  stylesheetPath: '/css/print.css'
});

/**
 * @class Ext.ux.Printer.ColumnTreeRenderer
 * @extends Ext.ux.Printer.BaseRenderer
 * @author Ed Spencer
 * Helper class to easily print the contents of a column tree
 */
Ext.ux.Printer.ColumnTreeRenderer = Ext.extend(Ext.ux.Printer.BaseRenderer, {

  /**
   * Generates the body HTML for the tree
   * @param {Ext.tree.ColumnTree} tree The tree to print
   */
  generateBody: function(tree) {
    var columns = this.getColumns(tree);
    
    //use the headerTpl and bodyTpl XTemplates to create the main XTemplate below
    var headings = this.headerTpl.apply(columns);
    var body     = this.bodyTpl.apply(columns);
    
    return String.format('<table>{0}<tpl for=".">{1}</tpl></table>', headings, body);
  },
    
  /**
   * Returns the array of columns from a tree
   * @param {Ext.tree.ColumnTree} tree The tree to get columns from
   * @return {Array} The array of tree columns
   */
  getColumns: function(tree) {
    return tree.columns;
  },
  
  /**
   * Descends down the tree from the root, creating an array of data suitable for use in an XTemplate
   * @param {Ext.tree.ColumnTree} tree The column tree
   * @return {Array} Data suitable for use in the body XTemplate
   */
  prepareData: function(tree) {
    var root = tree.root,
        data = [],
        cols = this.getColumns(tree),
        padding = this.indentPadding;
        
    var f = function(node) {
      if (node.hidden === true || node.isHiddenRoot() === true) return;
      
      var row = Ext.apply({depth: node.getDepth() * padding}, node.attributes);
      
      Ext.iterate(row, function(key, value) {
        Ext.each(cols, function(column) {
          if (column.dataIndex == key) {
            row[key] = column.renderer ? column.renderer(value) : value;
          }
        }, this);        
      });
      
      //the property used in the first column is renamed to 'text' in node.attributes, so reassign it here
      row[this.getColumns(tree)[0].dataIndex] = node.attributes.text;
      
      data.push(row);
    };
    
    root.cascade(f, this);
    
    return data;
  },
  
  /**
   * @property indentPadding
   * @type Number
   * Number of pixels to indent node by. This is multiplied by the node depth, so a node with node.getDepth() == 3 will
   * be padded by 45 (or 3x your custom indentPadding)
   */
  indentPadding: 15,
  
  /**
   * @property headerTpl
   * @type Ext.XTemplate
   * The XTemplate used to create the headings row. By default this just uses <th> elements, override to provide your own
   */
  headerTpl:  new Ext.XTemplate(
    '<tr>',
      '<tpl for=".">',
        '<th width="{width}">{header}</th>',
      '</tpl>',
    '</tr>'
  ),
 
  /**
   * @property bodyTpl
   * @type Ext.XTemplate
   * The XTemplate used to create each row. This is used inside the 'print' function to build another XTemplate, to which the data
   * are then applied (see the escaped dataIndex attribute here - this ends up as "{dataIndex}")
   */
  bodyTpl:  new Ext.XTemplate(
    '<tr>',
      '<tpl for=".">',
        '<td style="padding-left: {[xindex == 1 ? "\\{depth\\}" : "0"]}px">\{{dataIndex}\}</td>',
      '</tpl>',
    '</tr>'
  )
});

Ext.ux.Printer.registerRenderer('columntree', Ext.ux.Printer.ColumnTreeRenderer);

/**
 * @class Ext.ux.Printer.GridPanelRenderer
 * @extends Ext.ux.Printer.BaseRenderer
 * @author Ed Spencer
 * Helper class to easily print the contents of a grid. Will open a new window with a table where the first row
 * contains the headings from your column model, and with a row for each item in your grid's store. When formatted
 * with appropriate CSS it should look very similar to a default grid. If renderers are specified in your column
 * model, they will be used in creating the table. Override headerTpl and bodyTpl to change how the markup is generated
 */
Ext.ux.Printer.GridPanelRenderer = Ext.extend(Ext.ux.Printer.BaseRenderer, {
  
  /**
   * Generates the body HTML for the grid
   * @param {Ext.grid.GridPanel} grid The grid to print
   */
  generateBody: function(grid) {
    var columns = this.getColumns(grid);
    
    //use the headerTpl and bodyTpl XTemplates to create the main XTemplate below
    var title = '<h2>Report Name - ' +grid.repid + '</h2><h2>' + grid.title + '</h2>';
    var headings = this.headerTpl.apply(columns);
    var body     = this.bodyTpl.apply(columns);
    
    return String.format('{0}<table>{1}<tpl for=".">{2}</tpl></table>', title,headings, body);
  },

 
  
  /**
   * Prepares data from the grid for use in the XTemplate
   * @param {Ext.grid.GridPanel} grid The grid panel
   * @return {Array} Data suitable for use in the XTemplate
   */
  prepareData: function(grid) {
    //We generate an XTemplate here by using 2 intermediary XTemplates - one to create the header,
    //the other to create the body (see the escaped {} below)
    var columns = this.getColumns(grid);
  
    //build a useable array of store data for the XTemplate
    var data = [];
    grid.store.data.each(function(item) {
      var convertedData = {};
      
      //apply renderers from column model
      //Ext.iterate(item.data, function(key, value) {
        for (var key in item.data) {
         var value = item.data[key];
		 if (value.toLowerCase().indexOf("<a ") > -1) {
			value = value.replace(/^<a\s[^>]*>([^<]*)<\/a>$/gi, '<a href="javascript:void(0);">$1</a>');   
		 }	
        Ext.each(columns, function(column) {
          if (column.dataIndex == key) {
            convertedData[key] = column.renderer ? column.renderer(value, null, item) : value;
            return false;
          }
        }, this);

        }
      //});
    
      data.push(convertedData);
    });
    
    return data;
  },
  
  /**
   * Returns the array of columns from a grid
   * @param {Ext.grid.GridPanel} grid The grid to get columns from
   * @return {Array} The array of grid columns
   */
  getColumns: function(grid) {
    var columns = [];
    
	if(grid.store.groupField) {
		Ext.each(grid.store.groupField, function(group) {
			Ext.each(grid.getColumnModel().config, function(col) {
			  if (group == col.dataIndex) 
				columns.push(col);
			}, this);
		}, this);
	}
	
  	Ext.each(grid.getColumnModel().config, function(col) {
  	  if (col.hidden != true) columns.push(col);
  	}, this);
  	
  	return columns;
  },
  
  /**
   * @property headerTpl
   * @type Ext.XTemplate
   * The XTemplate used to create the headings row. By default this just uses <th> elements, override to provide your own
   */
  headerTpl:  new Ext.XTemplate(
    '<thead><tr>',
      '<tpl for=".">',
        '<th>{header}</th>',
      '</tpl>',
    '</tr>',
    '</thead>'
  ),
 
   /**
    * @property bodyTpl
    * @type Ext.XTemplate
    * The XTemplate used to create each row. This is used inside the 'print' function to build another XTemplate, to which the data
    * are then applied (see the escaped dataIndex attribute here - this ends up as "{dataIndex}")
    */
  bodyTpl:  new Ext.XTemplate(
    '<tr>',
      '<tpl for=".">',
        '<td>\{{dataIndex}\}</td>',
      '</tpl>',
    '</tr>'
  )
});



Ext.ux.Printer.registerRenderer('grid', Ext.ux.Printer.GridPanelRenderer);

Ext.ux.Printer.CalendarPanelRenderer = Ext.extend(Ext.ux.Printer.BaseRenderer, {
  
  /**
   * Generates the body HTML for the grid
   * @param {Ext.grid.GridPanel} grid The grid to print
   */
  generateBody: function(grid) {
    var sdate = grid.getView().startDate;
    var tmonth = Ext.DatePicker.prototype.monthNames[sdate.getMonth()] + sdate.format(' Y');
    //use the headerTpl and bodyTpl XTemplates to create the main XTemplate below
    var title = String.format('<tr><th colspan="5" style="background:#ffffff;border:0px;height:30px"><h2>{0}</h2></th><th colspan="2" style="background:#ffffff;border:0px;height:30px;text-align:right;"><h2>{1}</h2></th></tr>',this.titleTpl.apply(grid.filter),tmonth);
    var columns = this.getColumns(grid);
    var headings = String.format('<thead><tr style="height:10%;"><th colspan="7" style="vertical-align:bottom;border:0px;padding:0px;background:#ffffff;"><table style="width:100%;table-layout:fixed">{0}{1}</table></th></tr></thead>',title, this.headerTpl.apply(columns));
    //title = title + headings;
    //var body     = this.bodyTpl.apply(columns);
    var body = '';

    body='<tr style="height:{height};"><tpl for="header"><td style="background:{background};vertical-align:top;border-color:#D0D0D0;"><div><div style="text-align:right;color:{headercolor};">{headertext}</div><tpl for="events"><div style="color: {color};">{summary}</div></tpl></div></td></tpl></tr>';
    
    var eventsBody = '';
    var unschevents=this.getUnscheduledEvents(grid);
    if (unschevents && unschevents.length > 0) {
        eventsBody = String.format('<tr><td colspan="7">{0}</td></tr>',this.eventTpl.apply(unschevents));
    }
    return String.format('<table style="width:100%;height:100%;table-layout:fixed">{0}<tpl for=".">{1}</tpl>{2}</table>', headings, body,eventsBody);
   // return String.format('{0}<table>{1}{2}</table>', title,headings, body);
  },

 
  
  /**
   * Prepares data from the grid for use in the XTemplate
   * @param {Ext.grid.GridPanel} grid The grid panel
   * @return {Array} Data suitable for use in the XTemplate
   */
  prepareData: function(grid) {
    //We generate an XTemplate here by using 2 intermediary XTemplates - one to create the header,
    //the other to create the body (see the escaped {} below)
  
    //build a useable array of store data for the XTemplate
    var data = [];
    
    var dayCells = [];

    var mesh = grid.getView().dateMesh;
    for(var i=0; i<mesh.length; i++) {
            var cell= {};
            cell.background = mesh[i].getMonth() == grid.getView().startDate.getMonth() ? '#FFFFFF' : '#F9F9F9';
            if (mesh[i].getTime() == grid.getView().toDay.getTime()) {
                cell.background = '#EBF3FD';
            }
               
            cell.headercolor = mesh[i].getMonth() == grid.getView().startDate.getMonth() ? '#000000' : '#888888';
            if(mesh[i].getDate() == 1) {
                cell.headertext = mesh[i].format('M j');
            } else {
                cell.headertext = mesh[i].format('j');
            }
            cell.events=[];
            dayCells.push(cell);
    }


    // insert events in the cell
    grid.getView().ds.each(function(event) {
        // do not Show it here if it is a month event
          var ismEvent=event.get('is_month_event');

        if(ismEvent && ismEvent==1) {
            return;
        }
        
        var dtStart = event.get('dtstart');
        //Basic check. If start date is not there, do not bother to show
        if(!dtStart) {
            return;
        }
        var startCellNumber = Math.round((dtStart.clearTime(true).getTime() - mesh[0].getTime())/Date.msDAY);

        var dtEnd = event.get('dtend');
        // 00:00 in users timezone is a spechial case where the user expects
        // something like 24:00 and not 00:00
        if (dtEnd.format('H:i') == '00:00') {
            dtEnd = dtEnd.add(Date.MINUTE, -1);
        }
        var endCellNumber = Math.round((dtEnd.clearTime(true).getTime() - mesh[0].getTime())/Date.msDAY);

        // skip out of range events
        if (endCellNumber < 0 || startCellNumber >= mesh.length) {
            return;
        }
        for (var i=Math.max(startCellNumber, 0); i<=Math.min(endCellNumber, dayCells.length-1) ; i++) {
            var ev = dayCells[i].events;
            var evdata = {
                startTime: dtStart.format('H:i'),
                summary: event.get('title'),
                color: event.ui.color,
                bgColor: event.ui.bgColor
            };
            evdata.extraCls = '';
            if (event.ui.is_all_day_event) {
                evdata.color = 'black';
                
                if (i > startCellNumber) {
                    evdata.extraCls += ' cal-monthview-alldayevent-cropleft';
                }
                if (i < endCellNumber) {
                    evdata.extraCls += ' cal-monthview-alldayevent-cropright';
                }
                
                // show icon on startCell and leftCells
                evdata.showInfo = i == startCellNumber || i%7 == 0;
            }
            ev.push(evdata);
        }


    },this);

    // Arrange the cells in a matrix of 7(weekdays) X 5 or 6(weeks)
    var row = [];
    // 10% is used by headers so remaining 90% is to be divided among 5 or 6 weeks
    var height=90/(Math.ceil(mesh.length/7)) + '%';
    for(var i=0; i<mesh.length; i++) {
            if(i % 7 == 0 && i != 0){
                data.push({header:row,height:height});
                row =[];
            }
            var cell = dayCells[i];
            row.push(cell);
    }
    data.push({header:row,height:height});

  
    return data;
  },

  getUnscheduledEvents: function(grid) {
    var data = [];

    // insert events in the cell
    grid.getView().ds.each(function(event) {
        // do not Show it here if it is a month event
          var ismEvent=event.get('is_month_event');

        if(!ismEvent || ismEvent!=1) {
            return;
        }
        
        var dtStart = event.get('dtstart');
        var evdata = {
                startTime: dtStart.format('H:i'),
                summary: event.get('title'),
                color: event.ui.color,
                bgColor: event.ui.bgColor
         };

         data.push(evdata);
        


    },this);

    return data;
  },
  
  /**
   * Returns the array of columns from a grid
   * @param {Ext.grid.GridPanel} grid The grid to get columns from
   * @return {Array} The array of grid columns
   */
  getColumns: function(grid) {
    var columns = [];
    
    var sdate = grid.getView().startDate;
    var startDay = Ext.DatePicker.prototype.startDay;
    var dayNames = Date.dayNames;
    for(var i = 0; i < 7; i++){
            var d = startDay+i;
            if(d > 6){
                d = d-7;
            }
            columns.push({header:dayNames[d],dataIndex:i+1});
     }

  	return columns;
  },

  getTitle: function() {
    return 'Calendar Print Preview';
  },
  
  getDocType: function() {
    return '';
  },
  
  /**
   * @property headerTpl
   * @type Ext.XTemplate
   * The XTemplate used to create the headings row. By default this just uses <th> elements, override to provide your own
   */
  headerTpl:  new Ext.XTemplate(
    '<tr style="height:25px;">',
      '<tpl for=".">',
        '<th style="border-color:#D0D0D0;">{header}</th>',
      '</tpl>',
    '</tr>'
  ),
 
  titleTpl:  new Ext.XTemplate(
      '<tpl for=".">',
        '<span style="color:#{color};">{calname}</span>{[xindex < xcount ? ", " : ""]}',
      '</tpl>'
  ),

  eventTpl:  new Ext.XTemplate(
    '<div>',
    '<h2>Unscheduled Events</h2>',
    '<tpl for=".">',
    '<div style="padding: 0 0 5px 10px;color: {color};">{summary}</div>',
    '</tpl>',
    '</div>'
  ),
 
   /**
    * @property bodyTpl
    * @type Ext.XTemplate
    * The XTemplate used to create each row. This is used inside the 'print' function to build another XTemplate, to which the data
    * are then applied (see the escaped dataIndex attribute here - this ends up as "{dataIndex}")
    */
  bodyTpl:  new Ext.XTemplate(
    '<tr>',
      '<tpl for=".">',
        '<td>\{{dataIndex}\}</td>',
      '</tpl>',
    '</tr>'
  )
});

Ext.ux.Printer.registerRenderer('uxcal', Ext.ux.Printer.CalendarPanelRenderer);


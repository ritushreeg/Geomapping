/**
 * @class Ext.ScrollerToolbar
 * @extends Ext.Toolbar
 * @constructor
 * Create a new ScrollerToolbar
 * @param {Object} config The config object
 * $Id: ScrollerToolbar.js,v 1.1.2.6 2008-11-04 05:47:16 aviswanath Exp $
 */

Ext.ScrollerToolbar = Ext.extend(Ext.Toolbar, {
    currentPage:1,
    lastPage:1,
    firstPage:1,
    prevText:'Previous',
    nextText:'Next',
    scrollPrevText:'Previous Set',
    scrollNextText:'Next Set',
    hasPreviousScroll:false,
    hasNextScroll:false,
    ctCls:'x-scroll-tb',
    initComponent : function(){
        Ext.ScrollerToolbar.superclass.initComponent.call(this);
    },
    scrollers:[],
    buttons:[],
    // private
    onRender : function(ct, position){
        Ext.ScrollerToolbar.superclass.onRender.call(this, ct, position);
        this.gotButtons = this.buttons.length>0;
        if(this.buttons){
            //this.add.apply(this, this.buttons);
            delete this.buttons;
        }

        if(this.buttons){
            for(i=0;i<this.buttons.length;i++){
                if(this.buttons[i]){
                    this.addButton(this.buttons[i]);
                }
            }
        }
        this.addFill();
        if(this.scrollers.length > 0){
            this.gotScrollers = true;
            var i = 0;
            this.scrollprev = this.addButton({
                //tooltip: this.scrollPrevText,
                iconCls: 'x-tbar-scroll-prev',
                ctCls:'x-scroller',
                disabled: true,
                handler: this.onClick.createDelegate(this, ["scrollprev"])
            });
            this.prev = this.addButton({
                //tooltip: this.prevText,
                iconCls: "x-tbar-page-prev",
                ctCls:'x-scroller',
                disabled: true,
                handler: this.onClick.createDelegate(this, ["prev"])
            });
            if(this.scrollers[0]){
                this.firstPage = this.scrollers[0].page;
            }
            for(i=0;i<this.scrollers.length;i++){
                if(this.scrollers[i]){
                    this.lastPage = this.scrollers[i].page;
                    if(this.scrollers[i].current){
                        this.currentPage = this.scrollers[i].page;
                    }
                    this.addButton({
                         text:this.scrollers[i].page
                        ,ctCls:'x-scroller'
                        ,pressed:this.scrollers[i].current
                        ,handler:this.scrollers[i].current ? function(){} : this.scrollers[i].handler
                    });
                }
            }
            this.next = this.addButton({
                //tooltip: this.nextText,
                iconCls: "x-tbar-page-next",
                ctCls:'x-scroller',
                disabled: true,
                handler: this.onClick.createDelegate(this, ["next"])
            });
            this.scrollnext = this.addButton({
                //tooltip: this.scrollNextText,
                iconCls: "x-tbar-scroll-next",
                ctCls:'x-scroller',
                disabled: true,
                handler: this.onClick.createDelegate(this, ["scrollnext"])
            });
            this.prev.setDisabled(this.currentPage == this.firstPage);
            this.next.setDisabled(this.currentPage == this.lastPage);
            this.scrollprev.setDisabled(!this.hasPreviousScroll);
            this.scrollnext.setDisabled(!this.hasNextScroll);

            if(this.scrollers && (this.scrollers.length < 1)) {
                this.scrollprev.hide();
                this.scrollnext.hide();
            }
        }

        if((this.scrollers.length==0) && (!this.gotButtons)){
            this.hide();
        }
    },

    //private
    onClose : function(){

    },

    // private
    onClick : function(which){
        switch(which){
            case "close":
                this.onClose();
                break;
            case "first":
                this.doLoad(0);
                break;
            case "prev":
                if(this.currentPage > 1){
                    this.currentPage = this.currentPage - 1;
                    if(this.scrollHandler){
                        this.scrollHandler(this.currentPage);
                    }
                }
                break;
            case "scrollprev":
                if(this.hasPreviousScroll){
                    this.currentPage = this.firstPage - 1;
                    if(this.scrollHandler){
                        this.scrollHandler(this.currentPage);
                    }
                }
                break;
            case "next":
                if(this.currentPage < this.lastPage){
                    this.currentPage = this.currentPage + 1;
                    if(this.scrollHandler){
                        this.scrollHandler(this.currentPage);
                    }
                }
                break;
            case "scrollnext":
                var nextPage = (this.scrollers[this.scrollers.length -1])
                              ? this.scrollers[this.scrollers.length - 1].page
                              : this.scrollers[this.scrollers.length - 2].page;
                if(this.hasNextScroll){
                    if(this.scrollHandler){
                        this.scrollHandler(nextPage + 1);
                    }
                }
                break;
        }
    }
});
		Ext.grid.ColumnModel.override({
			getSortIndex : function(col) {
			return this.config[col].sortIndex || this.config[col].dataIndex;
			 },
			findColumnIndex : function(dataIndex){
			var c = this.config;
			for(var i = 0, len = c.length; i < len; i++){
				if(c[i].dataIndex == dataIndex || c[i].sortIndex == dataIndex){
					return i;
				}
			}
			return -1;
			}
		});
	    
		Ext.grid.GridView.override({
			onHeaderClick : function(g, index){
				if(this.headersDisabled || !this.cm.isSortable(index)){
					return;
				}
				g.stopEditing(true);
				g.store.sort(this.cm.getSortIndex(index));
			}
		});
        
Ext.reg('scroller', Ext.ScrollerToolbar);

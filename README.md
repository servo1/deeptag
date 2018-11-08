# deeptag
Vanilla javascript templating system.  It utilizes nested/recursive taggs and arrays for real-time and fast templating.

This is an attempt to create a similar system to Dot (https://github.com/olado/doT) but only does real-time client and server side rendering with similar speeds.

The template format is similar but all functional tags such as conditionals and arrays are tagged.  Here are some examples:

```var DeepTag = require('deeptag');
var maintemplate = `{{:~:options1:rows:item}}
                 <div style="width:100%" >
                   <div style="float:left;width:80%;margin-left:0px" class="sugs" data-type="{{=item.type}}" data-val="{{=item.id}}">{{=item.name}}</div>
                   {{#def['subtemplate']}}
                 </div>
                 {{~:options1}}`

var subtemplate = `{{:?:options:options.add:=:true}}
    <div style="float:left;width:45px">
      <i style="float:left" data-type="{{=item.type}}" data-val="{{=item.id}}" class="sugsadd icon-plus"></i>
      <i style="float:left" data-type="{{=item.type}}" data-val="{{=item.id}}" class="sugsdel icon-minus"></i>
    </div>
    {{?:options}}
    {{:?:options2:options.remove:=:true}}
    <div style="float:left;width:45px">
      <i style="float:left" data-type="{{=item.type}}" data-val="{{=item.id}}" class="sugsadd icon-plus"></i>
      <i style="float:left" data-type="{{=item.type}}" data-val="{{=item.id}}" class="sugsdel icon-minus"></i>
    </div>
    {{?:options2}}`

tpls = [{
    name: options1,
    content: maintemplate
  },
  {
    name: subtemplate,
    content: subtemplate
  }
};

var dt = new DeepTag(tpls);

var items = [{
    id: 1,
    type: "integer",
    name: "First"
  },
  {
    id: 2,
    type: "string",
    name: "Second"
  }
];
var opts = {
  add: 'true',
  remove: 'true'
};
var html = dt.render('options1', [items, opts]);

```
  
  The conditionals are not complete. There currently is no "else" statement and only "if" conditionals.
  Rendering lists of about 20-50 items is in the sub milisecond range.
  
  The array structure that is created from the templating system is fully recursive and creates a fairly neat array structure when parsing templates.  It would be pretty easy to add in functionality for triggering rendering of nested templates on updates.  
  
  The endgoal is to have a templating library that is ultra fast, server side and client side and can be used easily with websocket applications to only update specific parts of the template when needed despite how deep the data is nested.
  

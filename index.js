(function() {

  function renderer(data) {
    if (!(this instanceof renderer)) return new renderer(data);
    this.tpls = {};
    this.routeMap = {};
    this.iterations = 0;
    this.initTpls(data);
  }


  /**
   * Render a template with passed data
   * @method
   * @param  string name name of template
   * @param  array  data data contained within an array even if single item
   * @return string  rendered template
   */
  renderer.prototype.render = function(name, data) {
    if (false) {
      var i = 0,
        testtot = 9,
        times = [];
      for (; i < testtot; i++) {
        start = performance.now();
        var tags = this.tagem(this.tpls[name]),
          len = tags.length,
          tstr = this.dotpl(data, tags, 0, len)
        end = performance.now();
        times.push(end - start);
      }
      var sum = times.reduce(function(a, b) {
        return a + b;
      });
      var avg = sum / times.length;
      ge('Average time took ', avg)
    } else {
      var startTpl = this.defs(this.tpls[name]),
        tags = this.tagem(startTpl);
      tstr = this.dotpl(data, tags, 0, tags.length);
    }
    return tstr;
  }

  /**
   * Process through the depth of the array tags
   * @method
   * @param  {array} data  data to be used at this level
   * @param  {array} tags  tagged version of template
   * @param  {Number} [i=0]  current tag index
   * @param  {Number} len   length of array
   * @return {string}       rendered template string
   */
  renderer.prototype.dotpl = function(data, tags, i = 0, len) {
    var ctag = tags[i],
      tstr = '';

    switch (ctag[1]) {
      case 't':
        tstr = this.dovals(ctag[2], data);
        break;
      case '~':
        tstr = this.doIter(ctag, data, tags, i, len);
        break;
      case '?':
        tstr = this.doConditionals(ctag, data, tags, i, len);
        break;
      default:
        ge('here at default', ctag[1])
        break;
    }
    if (i < len - 1) return tstr + this.dotpl(data, tags, i + 1, len);
    else return tstr;
  }

  /**
   * handle array tags
   *   format open tag:  {{:~:tagName:objName:itemName}}
   *    close tag:       {{?:tagName1}}
   *   example: {{:~:options1:rows:item}}
   *            {{~:options1}}
   * @method
   * @param  {string} ctag current tag
   * @param  {object} data data for current level
   * @param  {array} tags template tags for current level
   * @param  {number} i    current iteration
   * @param  {number} len  length of tags
   * @return {string}      rendered template
   */
  renderer.prototype.doIter = function(ctag, data, tags, i, len) {
    var olen = data.length - 1,
      tdata, tobj = {},
      tstr = '',
      ctlen = tags[i][6].length;
    if (ctlen === 0) return '';

    if (typeof data === 'object') {
      tdata = this.depthVal(data, ctag[3]);
      if (tdata) {
        for (ivar in tdata) {
          tobj[ctag[4]] = tdata[ivar];
          tstr += this.dotpl(data.concat([tdata, tobj]), tags[i][6], 0, ctlen);
        }
        return tstr;
      }
    } else return this.dotpl(data, tags[i][6], 0, ctlen);
  }

  /**
   * Parses conditional tags and replaces variables
   * @method
   * @param  {string} ctag Current tag
   * @param  {object} data current data
   * @param  {array} tags  template tags array
   * @param  {number} i    current index of tags array
   * @param  {number} len  tag array length
   * @return {string}      replaced template conditional tags string
   */
  renderer.prototype.doConditionals = function(ctag, data, tags, i, len) {
    var tstr = '',
      tdata = this.depthVal(data, ctag[3]),
      ctlen = tags[i][6].length;

    if (ctlen === 0) return '';
    switch (ctag[4]) {
      case '!!':
        if (!!tdata) {
          ge('matches here', ctag[5])
          tstr = this.dotpl(data.concat([tdata]), tags[i][6], 0, ctlen);
        }
        break;
      case '!':
        if (!tdata) {
          ge('matches here', tdata, ctag[5])
          tstr = this.dotpl(data.concat([tdata]), tags[i][6], 0, ctlen);
        }
        break;
      case '=':
        if (tdata == ctag[5]) {
          //ge('matches here', tdata, ctag[5])
          tstr = this.dotpl(data.concat([tdata]), tags[i][6], 0, ctlen);
        }
        break;
      case '!=':
        if (tdata != ctag[5]) {
          ge('matches here', tdata, ctag[5])
          tstr = this.dotpl(data.concat([tdata]), tags[i][6], 0, ctlen);
        }
        break;
      case 'in':

        break;
      case '>':
        if (tdata > ctag[5]) {
          ge('matches here', tdata, ctag[5])
          tstr = this.dotpl(data.concat([tdata]), tags[i][6], 0, ctlen);
        }
        break;
      case '<':
        if (tdata < ctag[5]) {
          ge('matches here', tdata, ctag[5])
          tstr = this.dotpl(data.concat([tdata]), tags[i][6], 0, ctlen);
        }
        break;
      case 'v=':
        if (tdata == ctag[5]) {
          ge('matches here', tdata, ctag[5])
          tstr = this.dotpl(data.concat([tdata]), tags[i][6], 0, ctlen);
        }
        break;
      case 'v!=':
        if (tdata != ctag[5]) {
          ge('matches here', tdata, ctag[5])
          tstr = this.dotpl(data.concat([tdata]), tags[i][6], 0, ctlen);
        }
        break;
      case 'vin':

        break;
      case 'v>':

        break;
      case 'v<':

        break;
      default:
        ge('doing default')
        break;
    }
    return tstr;
    //if (tdata) return this.dotpl(data.concat([tdata]), tags[i][6], 0, tags[i][6].length);
    //else return this.dotpl(data, tags[i][6], 0, tags[i][6].length);
  }



  /**
   * replace {{=valnme}} with values from data
   * @method
   * @param  {string} str  template string
   * @param  {array} data passed data
   * @return {string}     parsed template string
   */
  renderer.prototype.dovals = function(str, data) {
    var indb = str.indexOf('{{='),
      i = 0;
    if (indb === -1) {
      return str;
    } else {
      var inde = str.indexOf('}}'),
        varname = str.substring(indb + 3, inde),
        varval = '',
        olen = data.length - 1,
        tdata;
      for (; olen >= 0; olen--) {
        if (varname === 'it') {
          if (data[olen]) varval = data[olen];
          else varval = '';
          break
        } else if (typeof data[olen] === 'object' && 'undefined' !== typeof data[olen][varname]) {
          if (data[olen][varname]) varval = data[olen][varname];
          else varval = '';
          break;
        } else {
          varval = this.byString(data[olen], varname);
          if (!varval) varval = '';
          if (varval) break;
        }
      }
      if (typeof varval === 'object') varval = JSON.stringify(varval);

      return this.dovals(str.substring(0, indb) + varval + str.substring(inde + 2, str.length), data);
    }
  }

  /**
   * turn template string into a depth/recusive array of tags
   * @method
   * @param  {string} str       template string
   * @param  {Number} [pid=0]   parent id of tag
   * @param  {Array}  [tags=[]] array version of template tags
   * @return {array}           template tags array version
   */
  renderer.prototype.tagem = function(str, pid = 0, tags = []) {
    var indb = str.indexOf('{{:'),
      i = 0,
      ltagend,
      strlen = str.length,
      len = tags.length,
      cind,
      tplstr,
      endstr,
      path = [],
      ctags;

    if (indb === -1) {
      if (strlen > 0) tags.push([pid, 't', str, null, null, null, []]);
      return tags;
    } else {
      var inde = str.indexOf('}}', indb),
        parts = str.substring(indb + 3, inde).split(':'),
        ltagend = '{{' + parts[0] + ':' + parts[1],
        endt = str.indexOf(ltagend),
        endte = str.indexOf(ltagend) + ltagend.length + 2;

      if (indb > 0) tags.push([pid, 't', str.substring(0, indb), null, null, null, []]);

      cind = tags.push([pid, parts[0], parts[1], parts[2], parts[3], parts[4], []]) - 1;
      endstr = str.substring(endte, strlen);

      this.tagem(str.substring(inde + 2, endt), cind, tags[cind][6])
      if (endstr.trim().length > 0) this.tagem(endstr, pid, tags)
      return tags
    }
  }

  /**
   * replace out def tags with template strings
   *  format:  {{#def['test2']}}
   * @method
   * @param  {string} str template string
   * @return {string}     template string post replaced template tags
   */
  renderer.prototype.defs = function(str) {
    var indb = str.indexOf('{{#def[\''),
      strlen = str.length,
      nstr = '';

    if (indb === -1) return str;
    else {
      var inde = str.indexOf('\']}}', indb),
        name = str.substring(indb + 8, inde),
        tstr = '';

      if (this.tpls[name] !== undefined) {
        nstr = str.substring(0, indb) + this.tpls[name] + str.substring(inde + 4, str.length);
      } else {
        nstr = str.substring(0, indb) + str.substring(inde + 4, str.length);
        ge('template not found:' + name);
      }
      return this.defs(nstr);
    }
  }

  /**
   * work through an array testing each with byString function
   * @method
   * @param  {object} data    data to recurse through
   * @param  {string} varname variable name to pass through to byString
   * @return {variable}         null if no match, or data of whatever type if matched
   */
  renderer.prototype.depthVal = function(data, varname) {
    var olen = data.length - 1,
      tdata;
    for (; olen >= 0; olen--) {
      tdata = this.byString(data[olen], varname);
      if (tdata) return tdata;
    }
    return null;
  }

  /**
   * work through an object recursively to find a property name and return it's value
   * @method
   * @param  {object} o objec to recurse through
   * @param  {string} s dot delineated string such as 0.name or parebtObj.childObj.thisprop
   * @return {variable}   empty string if no match or whatever object type
   */
  renderer.prototype.byString = function(o, s) {
    if (typeof o === 'object' && typeof s === 'string') {
      s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
      s = s.replace(/^\./, ''); // strip a leading dot
      var a = s.split('.');
      if (Array.isArray(a) && a[0] === 'it') a.splice(0, 1);
      var len = a.length,
        i = 0,
        go = false,
        k;
      for (; i < len; ++i) {
        k = a[i];
        if (k in o) {
          o = o[k];
          go = true;
        } else {
          return;
        }
      }
      if (go) return o;
      else return '';
    } else return '';
  }

  /**
   * encode html characters
   * @method
   * @param  {string} code html to encodeH
   * @return {string}      encoded string
   */
  renderer.prototype.encodeHTMLSource = function(code) {
    var rpl1 = /[&<>"'\/]/g,
      rpl2 = /&(?!#?\w+;)|<|>|"|'|\//g;
    code.toString().replace(rpl1, this.doEncode);
  };

  renderer.prototype.doEncode = function(m) {
    return {
      "&": "&#38;",
      "<": "&#60;",
      ">": "&#62;",
      '"': "&#34;",
      "'": "&#39;",
      "/": "&#47;"
    }[m] || m;
  }

  /**
   * parse array of templates into object with property as template names and value the template string
   * @method
   * @param  {array} data array of object with property names of 'name' and 'content'
   * @return {}      none
   */
  renderer.prototype.initTpls = function(data) {
    if (Array.isArray(data)) {
      var i = 0,
        len = data.length;
      for (; i < len; i++) {
        this.add(data[i].name, data[i].content);
      }
      return true;
    } else ge('data passed must be an array');
  }

  /**
   * function to store a template by it's name
   * @method
   * @param  {string} name template name
   * @param  {string} tpl  template content
   * @return {}      none
   */
  renderer.prototype.add = function(name, tpl) {
    if (typeof name == 'string' && typeof tpl === 'string') {
      this.tpls[name] = tpl;
    }
  }


  /**
   * remove whitespace from html
   * @method
   * @return {string} un-whitespaced string
   */
  renderer.prototype.remchars = function() {
    tpl = tpl.replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, "")
      .replace(/'|\\/g, "\\$&")
      .replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
      .replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "")
      .replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
  }

  /**
   * helper function to map a web path/url to a specific template   *
   * @method
   * @param  {string} name route name
   * @param  {variable} data data to pass into rendering
   * @return {variable}      null or processed template string
   */
  renderer.prototype.renderRoute = function(name, data) {
    if (this.routeMap[name] !== undefined) return this.render(this.routeMap[name], data);
    else {
      ge('unable to find route mapped for ', name)
      return null;
    }
  }


  if (typeof module !== "undefined" && ('exports' in module)) {
    module.exports = renderer;
  } else window.Renderer = renderer;

})();

function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/dd/droppable-delegate.js']) {
  _$jscoverage['/dd/droppable-delegate.js'] = {};
  _$jscoverage['/dd/droppable-delegate.js'].lineData = [];
  _$jscoverage['/dd/droppable-delegate.js'].lineData[6] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[7] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[8] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[12] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[14] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[15] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[17] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[25] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[29] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[37] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[46] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[47] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[48] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[50] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[51] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[53] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[54] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[56] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[57] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[58] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[59] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[65] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[66] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[67] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[70] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[74] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[75] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[76] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[77] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[81] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[88] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[91] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[92] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[95] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[96] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[98] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[103] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[104] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[105] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[142] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[148] = 0;
}
if (! _$jscoverage['/dd/droppable-delegate.js'].functionData) {
  _$jscoverage['/dd/droppable-delegate.js'].functionData = [];
  _$jscoverage['/dd/droppable-delegate.js'].functionData[0] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].functionData[1] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].functionData[2] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].functionData[3] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].functionData[4] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].functionData[5] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].functionData[6] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].functionData[7] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].functionData[8] = 0;
  _$jscoverage['/dd/droppable-delegate.js'].functionData[9] = 0;
}
if (! _$jscoverage['/dd/droppable-delegate.js'].branchData) {
  _$jscoverage['/dd/droppable-delegate.js'].branchData = {};
  _$jscoverage['/dd/droppable-delegate.js'].branchData['46'] = [];
  _$jscoverage['/dd/droppable-delegate.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/dd/droppable-delegate.js'].branchData['50'] = [];
  _$jscoverage['/dd/droppable-delegate.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/dd/droppable-delegate.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/dd/droppable-delegate.js'].branchData['50'][3] = new BranchData();
  _$jscoverage['/dd/droppable-delegate.js'].branchData['54'] = [];
  _$jscoverage['/dd/droppable-delegate.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/dd/droppable-delegate.js'].branchData['57'] = [];
  _$jscoverage['/dd/droppable-delegate.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/dd/droppable-delegate.js'].branchData['65'] = [];
  _$jscoverage['/dd/droppable-delegate.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/dd/droppable-delegate.js'].branchData['88'] = [];
  _$jscoverage['/dd/droppable-delegate.js'].branchData['88'][1] = new BranchData();
}
_$jscoverage['/dd/droppable-delegate.js'].branchData['88'][1].init(329, 23, 'lastNode[0] !== node[0]');
function visit106_88_1(result) {
  _$jscoverage['/dd/droppable-delegate.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable-delegate.js'].branchData['65'][1].init(963, 3, 'ret');
function visit105_65_1(result) {
  _$jscoverage['/dd/droppable-delegate.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable-delegate.js'].branchData['57'][1].init(114, 9, 'a < vArea');
function visit104_57_1(result) {
  _$jscoverage['/dd/droppable-delegate.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable-delegate.js'].branchData['54'][1].init(281, 24, 'DDM.inRegion(r, pointer)');
function visit103_54_1(result) {
  _$jscoverage['/dd/droppable-delegate.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable-delegate.js'].branchData['50'][3].init(132, 20, 'domNode === dragNode');
function visit102_50_3(result) {
  _$jscoverage['/dd/droppable-delegate.js'].branchData['50'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable-delegate.js'].branchData['50'][2].init(107, 21, 'domNode === proxyNode');
function visit101_50_2(result) {
  _$jscoverage['/dd/droppable-delegate.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable-delegate.js'].branchData['50'][1].init(107, 45, 'domNode === proxyNode || domNode === dragNode');
function visit100_50_1(result) {
  _$jscoverage['/dd/droppable-delegate.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable-delegate.js'].branchData['46'][1].init(285, 8, 'allNodes');
function visit99_46_1(result) {
  _$jscoverage['/dd/droppable-delegate.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable-delegate.js'].lineData[6]++;
KISSY.add('dd/droppable-delegate', function(S, DDM, Droppable, Node) {
  _$jscoverage['/dd/droppable-delegate.js'].functionData[0]++;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[7]++;
  function dragStart() {
    _$jscoverage['/dd/droppable-delegate.js'].functionData[1]++;
    _$jscoverage['/dd/droppable-delegate.js'].lineData[8]++;
    var self = this, container = self.get('container'), allNodes = [], selector = self.get('selector');
    _$jscoverage['/dd/droppable-delegate.js'].lineData[12]++;
    container.all(selector).each(function(n) {
  _$jscoverage['/dd/droppable-delegate.js'].functionData[2]++;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[14]++;
  DDM.cacheWH(n);
  _$jscoverage['/dd/droppable-delegate.js'].lineData[15]++;
  allNodes.push(n);
});
    _$jscoverage['/dd/droppable-delegate.js'].lineData[17]++;
    self.__allNodes = allNodes;
  }
  _$jscoverage['/dd/droppable-delegate.js'].lineData[25]++;
  var DroppableDelegate = Droppable.extend({
  initializer: function() {
  _$jscoverage['/dd/droppable-delegate.js'].functionData[3]++;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[29]++;
  DDM.on('dragstart', dragStart, this);
}, 
  getNodeFromTarget: function(ev, dragNode, proxyNode) {
  _$jscoverage['/dd/droppable-delegate.js'].functionData[4]++;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[37]++;
  var pointer = {
  left: ev.pageX, 
  top: ev.pageY}, self = this, allNodes = self.__allNodes, ret = 0, vArea = Number.MAX_VALUE;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[46]++;
  if (visit99_46_1(allNodes)) {
    _$jscoverage['/dd/droppable-delegate.js'].lineData[47]++;
    S.each(allNodes, function(n) {
  _$jscoverage['/dd/droppable-delegate.js'].functionData[5]++;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[48]++;
  var domNode = n[0];
  _$jscoverage['/dd/droppable-delegate.js'].lineData[50]++;
  if (visit100_50_1(visit101_50_2(domNode === proxyNode) || visit102_50_3(domNode === dragNode))) {
    _$jscoverage['/dd/droppable-delegate.js'].lineData[51]++;
    return;
  }
  _$jscoverage['/dd/droppable-delegate.js'].lineData[53]++;
  var r = DDM.region(n);
  _$jscoverage['/dd/droppable-delegate.js'].lineData[54]++;
  if (visit103_54_1(DDM.inRegion(r, pointer))) {
    _$jscoverage['/dd/droppable-delegate.js'].lineData[56]++;
    var a = DDM.area(r);
    _$jscoverage['/dd/droppable-delegate.js'].lineData[57]++;
    if (visit104_57_1(a < vArea)) {
      _$jscoverage['/dd/droppable-delegate.js'].lineData[58]++;
      vArea = a;
      _$jscoverage['/dd/droppable-delegate.js'].lineData[59]++;
      ret = n;
    }
  }
});
  }
  _$jscoverage['/dd/droppable-delegate.js'].lineData[65]++;
  if (visit105_65_1(ret)) {
    _$jscoverage['/dd/droppable-delegate.js'].lineData[66]++;
    self.setInternal('lastNode', self.get('node'));
    _$jscoverage['/dd/droppable-delegate.js'].lineData[67]++;
    self.setInternal('node', ret);
  }
  _$jscoverage['/dd/droppable-delegate.js'].lineData[70]++;
  return ret;
}, 
  _handleOut: function() {
  _$jscoverage['/dd/droppable-delegate.js'].functionData[6]++;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[74]++;
  var self = this;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[75]++;
  self.callSuper();
  _$jscoverage['/dd/droppable-delegate.js'].lineData[76]++;
  self.setInternal('node', 0);
  _$jscoverage['/dd/droppable-delegate.js'].lineData[77]++;
  self.setInternal('lastNode', 0);
}, 
  _handleOver: function(ev) {
  _$jscoverage['/dd/droppable-delegate.js'].functionData[7]++;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[81]++;
  var self = this, node = self.get('node'), superOut = DroppableDelegate.superclass._handleOut, superOver = self.callSuper, superEnter = DroppableDelegate.superclass._handleEnter, lastNode = self.get('lastNode');
  _$jscoverage['/dd/droppable-delegate.js'].lineData[88]++;
  if (visit106_88_1(lastNode[0] !== node[0])) {
    _$jscoverage['/dd/droppable-delegate.js'].lineData[91]++;
    self.setInternal('node', lastNode);
    _$jscoverage['/dd/droppable-delegate.js'].lineData[92]++;
    superOut.apply(self, arguments);
    _$jscoverage['/dd/droppable-delegate.js'].lineData[95]++;
    self.setInternal('node', node);
    _$jscoverage['/dd/droppable-delegate.js'].lineData[96]++;
    superEnter.call(self, ev);
  } else {
    _$jscoverage['/dd/droppable-delegate.js'].lineData[98]++;
    superOver.call(self, ev);
  }
}, 
  _end: function(e) {
  _$jscoverage['/dd/droppable-delegate.js'].functionData[8]++;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[103]++;
  var self = this;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[104]++;
  self.callSuper(e);
  _$jscoverage['/dd/droppable-delegate.js'].lineData[105]++;
  self.setInternal('node', 0);
}}, {
  ATTRS: {
  lastNode: {}, 
  selector: {}, 
  container: {
  setter: function(v) {
  _$jscoverage['/dd/droppable-delegate.js'].functionData[9]++;
  _$jscoverage['/dd/droppable-delegate.js'].lineData[142]++;
  return Node.one(v);
}}}});
  _$jscoverage['/dd/droppable-delegate.js'].lineData[148]++;
  return DroppableDelegate;
}, {
  requires: ['./ddm', './droppable', 'node']});

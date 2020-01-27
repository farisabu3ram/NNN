let $scope = {};
let $bindedVars;
let viewElement = document.querySelector('[view]');
class AttrData {
    constructor(query, render) {
        this.type = query.replace("\\", "").replace("\$", "");
        this.query = query;
        this.render = render
    }
}
class SpecialAttr {
    constructor(type, element, render) {
        this.attr = type;
        this.element = element;
        this.exp = element.getAttribute("$" + type);
        this.render = render
    }
}

let blockMap = [];

function checkExist(badWord) {
    for (let i = 0; i < blockMap.length; i++) {
        console.log(blockMap[i]);
        if (badWord.indexOf(blockMap[i]) != -1)
            return true;
    }
    return false;
}
function renderIf(expression, element) {
    console.log(expression);
    let exp = expression.replace(/\$/g, "$scope.");
    if (checkExist(exp) || exp.indexOf('$scope.i') != -1)
        return;
    console.log(exp);
    console.log("PASS");

    createClass('hide', 'display:none');
    let result = eval(exp);
    if (result) {
        if (element.classList.contains('hide')) { element.classList.remove('hide') }
    } else {
        if (!element.classList.contains('hide')) {
            element.classList.add('hide')
        }
    }
}

function renderFor(exp, element) {
    let def = exp.split(':');
    let iterSymbol = 'i';
    if (def.length > 1)
        iterSymbol = def[1].trim();
    let subArr = def[0].split('of')[0].trim();
    let arrName = def[0].split('of')[1].trim();

    blockMap.push('$scope.' + subArr);

    let array = eval('$scope.' + arrName);
    if (!array) return;
    let iterregx = new RegExp(`\\$` + iterSymbol + '(?![a-z])', 'g');
    let newElement = "";
    for (let i = 0; i < array.length; i++) {
        let tempele = element.innerHTML.replace(new RegExp("\[$]" + subArr, 'g'), "$" + arrName + `[${i}]`).replace(iterregx, i);
        let oldval = $scope[subArr];
        $scope[subArr] = array[i];
        $scope[subArr] = oldval;
        newElement += tempele
    }
    element.innerHTML = newElement;
    renderTemplate(element);
}

function renderDisabled(exp, element) {
    exp = exp.replace(/\$/g, "$scope.");
    let result = eval(exp);
    element.disabled = result
}

function renderStyle(exp, element) {
    let hashCode = function (str) {
        var hash = 0;
        if (str.length == 0) { return hash }
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash
        }
        return hash
    }
    let expGroup = exp.split(',');
    expGroup.forEach(ele => {
        let indx = ele.lastIndexOf(":");
        let e = [];
        e.push(ele.substring(0, indx).replace(/'/g, "").trim(), ele.substring(indx + 1).trim());
        let h = "mvc" + hashCode(e[0]);
        createClass(h, e[0]);
        renderClass(`${h} : ${e[1]}`, element)
    })
}

function renderClass(exp, element) {
    exp = exp.replace(/\$/g, "$scope.");
    let expGroup = exp.split(',');
    expGroup.forEach(ele => {
        let splitStr = ele.split(":")
        let className = splitStr[0].replace(/'/g, "").trim();
        if (eval(splitStr[1]))
            element.classList.add(className);
        else element.classList.remove(className)
    })
}
const specails = [new AttrData("\\$for", renderFor),
new AttrData("\\$if", renderIf),
new AttrData("\\$disabled", renderDisabled),
new AttrData("\\$style", renderStyle),
new AttrData("\\$class", renderClass)
]

function specialTags(doc) {
    let specialTags = [];
    for (let i = 0; i < specails.length; i++) {
        let elements = doc.querySelectorAll(`[${specails[i].query}]`);
        elements = [...elements].map(element => element = new SpecialAttr(specails[i].type, element, specails[i].render));
        specialTags = specialTags.concat(elements)
    }
    return specialTags
}

function replaceElement(attrString) {
    console.log(attrString);
    let value = attrString.replace('$', "$scope.");
    value = eval(value);
    return value || ''
}
export function $apply(doc) {
    let str;
    if (!doc) {
        str = $bindedVars;
        doc = viewElement
    } else { str = doc.innerHTML }
    str = str.replace(/(\{\{.*?\}\})/g, replaceElement);
    doc.innerHTML = str
}
let cm = new Map();

function createClass(name, attr) {
    if (cm.has(name))
        return;
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `.${name} { ${attr} }`;
    document.getElementsByTagName('head')[0].appendChild(style);
    cm.set(name, !0)
}
export function render(view, model) {
    let specials = specialTags(view);
    $scope = model;
    specials.forEach(element => element.render(element.exp, element.element));
    $bindedVars = view.innerHTML;
    $apply(view);
    const lastChance = specialTags(document.querySelector("[view]"));
    const filteredChance = lastChance.filter(data => data.attr == 'if');
    console.log(filteredChance);
    filteredChance.forEach(element => element.render(element.exp, element.element));

    return view;
}
function renderTemplate(view) {
    let specials = specialTags(view);
    specials.forEach(element => element.render(element.exp, element.element));
    return view;
}
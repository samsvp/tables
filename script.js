/**
 * Simple JS code to enhance table creation and manipulation.
 * Inspired by HTMX, although I've never written a line of 
 * HTMX in my entire live.
 * */


// holds all ids used by search elements
const ids = []
// datasheet to hide table
const sheet = new CSSStyleSheet();
document.adoptedStyleSheets.push(sheet);

function addHideRule(hideRuleName /*string*/) {
    let rule = `tr[${hideRuleName}]{display: none}`
    sheet.insertRule(rule);
}


function removeHideRule(hideRuleName /*string*/) {
    let selectorText = `tr[${hideRuleName}]`;
    let rules = sheet.cssRules;
    for (let i = 0; i < rules.length; i++) {
        if (rules[i].selectorText === selectorText) {
            sheet.deleteRule(i);
            break;
        }
    }
}


/**
 * Creates a random id
 */
function makeId(length /*number*/) /*string*/ {
    let result = "";
    const characters = 
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
}


/**
 * Returns the index of the given HTML object in the given HTMLObjetct
 * array. If not present returns -1.
 */
function elementIndex(elem /*HTMLObject*/, 
                      elems /*Array<HTMLObject>*/) /*number*/
{
    for (let i = 0; i < elems.length; i++) {
        if (elem.isSameNode(elems[i])) {
            return i;
        }
    }
    return -1;
}


/**
 * Creates a search input of the given type and sets the appropriate 
 * callback function.
 */
function createSearchInput(type /*string*/) /*string*/
{
    // create a unique id
    const n = 6;
    let id = makeId(n);
    while (ids.indexOf(id) !== -1) {
        id = makeId(n);
    }

    let inputCallback = "";
    switch (type) {
    case "text":
        inputCallback = "tableSearchText";
        break;
    case "number":
        inputCallback = "tableSearchText";
        break;
    }

    return `<input type="text" id="${id}"
                oninput="${inputCallback}('${id}')">`;
}


/**
 * Callback function to be used when filtering text. Accepts
 * regex patterns as input.
 */
function tableSearchText(id /*string*/) {
    const input = document.getElementById(id);
    const hideRule = id;
    const value = input.value;
    let re;
    try {
        // may throw a syntax error
        re = new RegExp(value);
    } catch (e) {
        return;
    }
    let tIdx = input.offsetParent.cellIndex;

    removeHideRule(hideRule);
    // the first offset parent is the inputs td
    const table = input.offsetParent.offsetParent;
    const rows = table.rows;
    for (let i = 2; i < rows.length; i++) {
        let row = rows[i];
        if (row.cells[tIdx].innerHTML.match(re) !== null) {
            row.removeAttribute(hideRule);
        } else {
            row.setAttribute(hideRule, "0");
        }
    }
    addHideRule(hideRule);
}


/**
 * Inserts a row into the table after the th tag row
 */
function insertRow(table /*HTMLTableObject*/, contents /*Array<Any>*/) 
{
    let new_row = document.createElement("tr");
    for (let i=0; i < contents.length; i++) {
        let col = document.createElement("td");
        const content = contents[i];
        col.innerHTML = content === undefined ? "" : content;
        new_row.appendChild(col);
    }

    let th_row = table.childNodes[1].childNodes[1];
    th_row.parentNode.insertBefore(new_row, th_row);
}


/**
 * Creates the search bars of the elements marked as tb-search
 * as a new row after the th elements table row.
 **/
function createSearches() {
    const tables = [];
    let ths = document.querySelectorAll('th[tb-search]');
    for (let i = 0; i < ths.length; i++) {
        const th = ths[i]
        // get the table
        let table = th.offsetParent;
        let tableIdx = elementIndex(table, tables.map(dict => dict.table));
        if (tableIdx === -1) {
            tableIdx = tables.length;
            // add table to tables array
            let cap = table.childNodes[1].childNodes[0].childElementCount;
            tables.push({table: table, content: new Array(cap)});
        }

        const attrib = th.getAttribute("tb-search");
        const idx = th.cellIndex;
        tables[tableIdx].content[idx] = attrib;
    }

    for (let i = 0; i < tables.length; i++) {
        const content = tables[i].content.map(c => createSearchInput(c));
        insertRow(tables[i].table, content);
    }
}



document.addEventListener("DOMContentLoaded", function () {
    createSearches();
})

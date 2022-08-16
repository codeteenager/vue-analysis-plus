const ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
const qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
const startTagOpen = new RegExp(("^<" + qnameCapture));
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

function parseHTML(html) {
    const ELEMENT_TYPE = 1;
    const TEXT_TYPE = 3;
    const stack = [];  //用于存放元素
    let currentParent; //指向的是栈中的最后一个
    let root;

    //截取字符串
    function advance(n) {
        html = html.substring(n);
    }

    //最终转换成抽象语法树
    function createAstElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }

    function start(tag, attrs) {
        let node = createAstElement(tag, attrs);//创造一个ast节点
        if (!root) { //看一下是否为空树
            root = node; //如果为空则当前是树的根节点
        }
        if (currentParent) {
            node.parent = currentParent;
            currentParent.children.push(node);
        }
        stack.push(node);
        currentParent = node; //currentParent为栈中最后一个
    }

    function chars(text) {
        text = text.replace(/\s/g, '');
        text && currentParent.children.push({ //将文本存放在当前指向的节点
            type: TEXT_TYPE,
            text,
            parent: currentParent
        });
    }

    function end(tag) {
        stack.pop();  //弹出最后一个
        currentParent = stack[stack.length - 1];
    }

    function parseStartTag() {
        const start = html.match(startTagOpen);
        if (start) {
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length);
            //如果不是开始标签的结束，就一直匹配下去
            let attr, end;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length);
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] || true });
            }

            if (end) {
                advance(end[0].length);
            }

            return match;
        }

        return false;

    }
    while (html) {
        let textEnd = html.indexOf('<'); //为0说明是开始标签或者结束标签
        if (textEnd == 0) {
            let startTagMatch = parseStartTag();
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;
            }
            let endTagMatch = html.match(endTag);
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                end(endTagMatch[1]);
                continue;
            }
            break;
        }
        if (textEnd > 0) {
            let text = html.substring(0, textEnd);
            if (text) {
                chars(text);
                advance(text.length);
            }
        }
    }
    console.log(root);
    return root;
}

export function compileToFunction(template) {
    let ast = parseHTML(template);
}
import { parseHTML } from "./parse";

function genProps(attrs) {
    let str = ''; //{name,value}
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];
        if (attr.name == "style") {
            let obj = {};
            //color:red => {color:'red'}
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':');
                obj[key] = value;
            });
            attr.value = obj;
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`;
    }
    return `{${str.slice(0, -1)}}`;
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

function gen(node) {
    if (node.type === 1) { //如果节点为元素
        return codegen(node);
    } else {
        //文本
        let text = node.text;
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`;
        } else {
            let tokens = [];
            let match;
            defaultTagRE.lastIndex = 0;
            let lastIndex = 0;
            while (match = defaultTagRE.exec(text)) {
                let index = match.index;
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)));
                }
                tokens.push(`_s(${match[1].trim()})`);
                lastIndex = index + match[0].length;
            }
            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)));
            }
            return `_v(${tokens.join('+')})`;
        }
    }
}

function genChildren(el) {
    let children = el.children;
    if (children) {
        return children.map(child => gen(child)).join(',');
    }
}

function codegen(ast) {
    let children = genChildren(ast);
    let code = `_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}${ast.children.length > 0 ? `,${children}` : ''})`;
    return code;
}

export function compileToFunction(template) {
    //将模板转换成ast语法树
    let ast = parseHTML(template);

    //生成render方法{render方法返回的结果就是虚拟dom}
    //模板引擎的实现原理就是with + new Function
    let code = codegen(ast);
    code = `with(this){return ${code}}`;
    let render = new Function(code);
    return render;
}
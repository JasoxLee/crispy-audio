const fs = require('fs');
class Util {
    constructor(){

    }
    static getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive 
    }
    
    static geteid(text){
        const start = text.lastIndexOf('_');
        const end = text.lastIndexOf('.');
        return text.slice(start+1,end)
    }

    static writeFile(path, data) {
        const p = path.split('/')
        p.forEach((e, idx) => {
            const _path = p.slice(0, idx + 1).join('/')
            
            if (!fs.existsSync(_path)) {
                console.log('create')
                if (e.indexOf('.') == -1) {
                    fs.mkdirSync(_path);
                } else {
                    fs.writeFileSync(_path, data)
                }
            }
        });
        console.log(path)
    }

}

exports.Util = Util;

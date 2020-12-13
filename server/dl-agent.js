

const axios = require('axios');
const iconv = require('iconv-lite');
const fs = require('fs');
const jsdom = require("jsdom");

const ProgressBar = require('progress')
const { JSDOM } = jsdom;
const bookList = require('./books');
const { Util } = require('./util');

class DLAgent {
    constructor() {
    }
    static async fetchEpisodeUrl(bid, eid) {
        console.log(`fetchEpisodeUrl[${bid} - ${eid}]: start...`)
        const strUrl = `https://m.tingshubao.com/player/tingchina.php?url=yousheng/${bid}/play_${bid}_${eid}.htm`;

        try {
            const response = await axios.request({
                url: strUrl,
                method: 'get'
            });
            if (response.status === 200) {
                
                console.log(`fetchEpisodeUrl[${bid} - ${eid}]:`)
                console.log(response.data)
                return response.data;

            } else {
                console.log(`fetchEpisodeUrl[${bid} - ${eid}]: not right`)
                return { error: true, message: '{fetchEpisodeUrl}: fetch content not right' }
            }

        } catch (error) {
            console.log(`fetchEpisodeUrl[${bid} - ${eid}]: error`)
            return { error: error, message: '{fetchEpisodeUrl} has error!!!' }
        }
    }
    static async fetchMP3(url, fpath, task) {
        const path = `../${fpath}`;
        const dlpath = `../${fpath}.download`;
        // const encodedURI = encodeURI(`${url}?key=${key}`);
        const encodedURI = encodeURI(url);
        const headers = {
            'Host': 't3344.tingchina.com',
            'Accept': '*/*',
            'Origin': 'http://localhost:8000',
            'Referer': 'http://localhost:8000/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
        }
        try {
            
            
            const response = await axios.request({
                responseType: 'stream',
                url: encodedURI,
                method: 'get',
                headers: headers
            })
            var contentType = response.headers['content-type'];
            console.log(`Start [status=${response.status}][type=${contentType}]: ${task.episode.id} - ${task.episode.name}`)
            if (response.status === 200) {
                const { data, headers } = response;
                const totalLength = headers['content-length']
                
                
                // const progressBar = new ProgressBar('-> downloading [:bar] :percent :etas', {
                //     width: 40,
                //     complete: '=',
                //     incomplete: ' ',
                //     renderThrottle: 1,
                //     total: parseInt(totalLength)
                // })
                var currentLength = 0;
                task.status = 1;
                task.fileSize = totalLength;
                task.manager.clientWrite(task.getStatus);
                data.on('data', (chunk) => {
                    
                    currentLength+= chunk.length;
                    task.currentSize = currentLength;
                    
                    task.manager.clientWrite(task.getStatus);

                })
                data.on('end', (chunk)=>{
                    fs.renameSync(dlpath,path);
                    task.status = 2;
                    task.manager.clientWrite(task.getStatus);
                    task.manager.removeTaskFromExecPool(task);
                    task.manager.fillExecPool();
                    task.manager.runExecPool();                    
                    console.log(`${task.episode.id} - ${task.episode.name}[data]: end`);
                })
                data.on('error', (chunk)=>{
                    console.log(`${task.episode.id} - ${task.episode.name}[data]: error`);
                    task.status = 3;
                    // remove error file
                    if(fs.existsSync(dlpath)) {
                        fs.unlinkSync(dlpath)
                    }

                    task.manager.clientWrite(task.getStatus);
                    task.manager.removeTaskFromExecPool(task);
                    task.manager.addTasks=[task];

                    
                })

                if(fs.existsSync(path)) {
                    fs.unlinkSync(path)
                }
                if(fs.existsSync(dlpath)) {
                    fs.unlinkSync(dlpath)
                }
                const writer = fs.createWriteStream(dlpath)
                const stream = data.pipe(writer);

                stream.on('finish', () => {
                    task.status = 2;
                    task.manager.clientWrite(task.getStatus);
                    task.manager.removeTaskFromExecPool(task);
                    task.manager.fillExecPool();
                    task.manager.runExecPool();

                });

            } else {
                task.status = 3;
                task.manager.clientWrite(task.getStatus);
                task.manager.removeTaskFromExecPool(task);
                task.manager.addTasks=[task];
                //task.manager.fillExecPool();
                //task.manager.runExecPool();
                return { error: true, message: '{fetchMP3}: fetch content not right' }
            }
        } catch (error) {
            console.log(`mp3[${task.episode.id} - ${task.episode.name}]`);
            console.log(error);
            task.status = 3;
            task.manager.clientWrite(task.getStatus);
            task.manager.removeTaskFromExecPool(task);
            task.manager.addTasks=[task];
            //task.manager.fillExecPool();
            //task.manager.runExecPool();
            return { error: error, message: '{fetchMP3} has error!!!' }
        }

    }
    static async fetchKey() {
        const book_id = Util.getRandomIntInclusive(28022, 28029)
        const episode_id = Util.getRandomIntInclusive(0, 9)
        const strUrl = `https://www.tingchina.com/play/h5_ajax.asp`;
        const _headers = {
            'Host': 'www.tingchina.com',
            'Accept': '*/*',
            'Origin': 'www.tingchina.com',
            'Referer': `https://www.tingchina.com/${book_category}/${book_id}/play_${book_id}_${episode_id}.htm`,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
        }

        try {
            const response = await axios.request({
                responseType: 'text',
                url: strUrl,
                method: 'get',
                headers: _headers
            });
            if (response.status === 200) {
                return response.data;
            } else {
                return { error: true, message: '{fetchKey}: fetch content not right' }
            }

        } catch (err) {
            return { error: error, message: '{fetchKey} has error!!!' }
        }
    }

    static async fetchEpisodeInfo(href) {
        //if(!episodeURL) return;
        const full_url = `https://www.tingchina.com/yousheng/${href}`;
        try {
            const response = await axios.get(full_url, { responseType: 'arraybuffer' })
            if (response.status === 200) {
                const type = response.headers["content-type"];

                // edcode the html content
                const html = iconv.decode(response.data, 'gb2312');
                const f = html.split(`var fileUrl= "`);
                // 
                var idx = f[1].indexOf('";');
                const furl = f[1].slice(0, idx);
                //
                const n = html.split(`var mp3Name="`);

                idx = n[1].indexOf('";');
                const fname = n[1].slice(0, idx);
                return { url: furl, name: fname }
            } else {
                return { error: true, message: '{fetchEpisodeInfo}: fetch content not right' }
            }
        } catch (error) {
            return { error: error, message: '{fetchEpisodeInfo} has error!!!' }
        }
    }

    static async fetchBookInfo(book) {
        // TODO 
        console.log('fetchBookInfo', book.name);
        const book_rul = `https://www.tingchina.com/${book.rdir}/disp_${book.id}.htm`;

        try {
            const response = await axios.get(book_rul, { responseType: 'arraybuffer' })
            
            if (response.status === 200) {
                const type = response.headers["content-type"];
                const html = iconv.decode(response.data, 'gb2312');

                const dom = new JSDOM(html);
                const document = dom.window.document;
                const list = document.querySelectorAll(".list a")

                // get all files in system
                const files_in_system = new Set();
                fs.readdirSync(`../${book.path}`).forEach(file => {
                    files_in_system.add(file);
                });

                // get all files on server
                const data_list = []
                list.forEach(a => {
                    data_list.push({
                        dld: files_in_system.has(a.textContent),
                        name: a.textContent,
                        id: Util.geteid(a.href),
                        href: a.href
                    })
                })

                return { book: book, list: data_list }
            } else {
                return { error: true, message: '{fetchEpisodeInfo}: fetch content not right' }
            }
        } catch (error) {
            return { error: error, message: '{fetchBookInfo} has error!!!' }
        }
    }
}



/**
 * 
 * @param {*} episodeURL 
 */









module.exports.DLAgent = DLAgent;
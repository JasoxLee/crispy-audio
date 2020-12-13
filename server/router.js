const express = require('express');
const router = express.Router();
const books = require('./books');
const { Book } = require('./book');

const axios = require('axios');
const ProgressBar = require('progress');
const iconv = require('iconv-lite');
const fs = require('fs');
const { Util } = require('./util');

const { DLTask } = require('./dl-task');
const { DLTaskManager } = require('./dl-task-manager');


const clients = new Map();
const { DLAgent } = require('./dl-agent');
const { Episode } = require('./episode');


const dlTaskManager = new DLTaskManager();
/**
 * get all books
 */
router.get('/fetchBookList', async (req, res) => {
    try {
        res.status(200).json(books)
    } catch (err) {
        res.status(400).json({
            err,
            message: '"/books" api has something error!'
        })
    }
})

router.get('/fetchEpisodeUrl', async (req, res) => {
    const { bid, eid } = req.query;
    try {
        const rs = await DLAgent.fetchEpisodeUrl(bid, eid);
        console.log(`fetchEpisodeUrl: ${rs}`);
        res.status(200).send('OK')//json(rs);
    } catch (err) {
        res.status(400).json({
            err,
            message: '"/fetchEpisodeUrl" api has something error!'
        })
    }
})

router.get('/fetchEpisodeInfo', async (req, res) => {
    const { href } = req.query;
    try {
        const rs = await DLAgent.fetchEpisodeInfo(href);
        
        res.status(200).json(rs)
    } catch (error) {
        res.status(400).json({
            err,
            message: '"/fetchEpisodeInfo" api has something error!'
        })
    }
    ;
})
/**
 * get an episode list of a book by book id
 */
router.get('/fetchBookInfo', async (req, res) => {
    const { id, name, rdir, category} = req.query;
    const book = new Book({ id, name, rdir, category });
    
    try {
        const rs = await DLAgent.fetchBookInfo(book);
        
        res.status(200).json(rs);
    } catch (error) {
        res.status(400).json({
            err,
            message: '"/fetchBookInfo" api has something error!'
        })
    }


})


router.post('/addTasks', async (req, res) => {
    var tasks = req.body;
    
    const tList = tasks.map(t => {
        const book = new Book({ ...t.book });
        const episode = new Episode({
            id: t.id,
            name: t.name,
            href: t.href,
            book
            
        })

        const task = new DLTask({episode, manager:dlTaskManager})
        return task;    
        
       
    })
    dlTaskManager.addTasks = tList;
    res.status(200).json({ message: 'ok' });
});
//28022 ~~ 28029
/**
 * get
 */

router.get('/fetchKey', async (req, res) => {
    const rs = await DLAgent.fetchKey(f);
    console.log('/fetchKey', rs);
    res.status(200).json(rs);
})

router.get('/status', async (req, res, next) => {
    
    console.log('status:');
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    dlTaskManager.addClient = res;
    res.writeHead(200, headers);
    //res.write(`data: ${JSON.stringify({connect:true})}\n\n`);
})

router.get('/sse', async (req, res, next) => {
    const id = req.query.id;
    console.log('sse: ', id);
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    };

    res.writeHead(200, headers);
    const newClient = {
        id: id,
        data: {
            id: id,
            counter: 0,
            isClosed: false,
        },
        res
    };
    res.write(`data: ${JSON.stringify(newClient.data)}\n\n`);

    clients.set(id, newClient);
    req.on('close', () => {
        console.log(`${id} Connection closed`);
        if (clients.delete(id)) {
            console.log(`${id} Connection has deleted`)
        };
    });

})
function sendEventsToAll() {
    console.log('action ... ')
    clients.forEach((c, k) => {
        console.log(k, c.data);
        c.data.counter++;
        if (c.data.counter > 5) {
            c.data.counter = -1;
            c.data.isClosed = true;
        }
        c.res.write(`data: ${JSON.stringify(c.data)}\n\n`
        )
    })
}

// create book directory
books.forEach(b => {
    const bk = new Book({...b})
    Util.writeFile(`../${bk.path}`)
});
// setInterval(sendEventsToAll, 1000);
module.exports = router;

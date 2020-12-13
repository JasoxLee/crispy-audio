const { toughCookie } = require("jsdom");



class DLTaskManager {

    constructor(options) {
        this.tasks = [];
        this.execThreshold = 10;
        this.execPool = new Map();
        this.client = null;
    }

    set addClient(res) {
        this.client = res;
    }

    set addTask(task) {
        this.tasks.push(task);
    }

    set addTasks(tasks) {
        this.tasks.push(...tasks);
        this.fillExecPool();
        this.runExecPool()
    }

    clientWrite(data){
        if(this.client){
            this.client.write(`data: ${JSON.stringify(data)}\n\n`);
        }
    }

    
    fillExecPool() {
        // need refill?
        while (this.tasks.length && this.execPool.size < this.execThreshold) {
            const task = this.tasks.shift();
            this.execPool.set(task.episode.id, task)
            
        }
    }
    removeTaskFromExecPool(task){
        if(this.execPool.has(task.episode.id)) {
            this.execPool.delete(task.episode.id);
        }
    }
    runExecPool() {
        this.execPool.forEach((task, id, execPool) => {
            switch (task.status) {
                case 0: // not start
                    task.start();
                    this.clientWrite(task.getStatus);
                    break;
                case 1: // working
                    // Doing Nothing
                    this.clientWrite(task.getStatus);
                    break;
                case 2: // finish
                    // remove from pool
                    execPool.delete(task.episode.id)
                    this.clientWrite(task.getStatus);

                    break;
                case 3: // error
                    task.status = 0;
                    task.start();
                    // remove from pool
                    //execPool.delete(task.episode.id);
                    // put it back to tasks queue
                    //this.tasks.push(task);
                    this.clientWrite(task.getStatus);
                    break;
            }

        }, this);
    }

    get status() {
        // TODO
        const status = this.tasks.map(t => t.getStatus);
        
        console.log(`execPool:${this.execPool.size}`)
        console.log(`tasks:${this.tasks.length}`)

        return status;

    }






}

function moveToExecPool(tasks, pool) {

}

// function 

exports.DLTaskManager = DLTaskManager;
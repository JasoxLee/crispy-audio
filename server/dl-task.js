
const { Episode } = require('./episode');
const { DLAgent } = require('./dl-agent');


// https://t3344.tingchina.com/yousheng/玄幻奇幻/灵剑尊/001.mp3?key=39fb8aac6da95b4b4c43d0a2a0f4c984_661048816
class DLTask {
    // Episode

    // task manage

    constructor(options) {
        this.rootServerUrl = "https://t3344.tingchina.com";
        this.episode = options.episode;
        this.manager = options.manager;
        this.status = 0; // 0 - not start // 1 - working // 2 - finish // 3 - error
        this.fileSize = 0;
        this.currentSize = 0;
    }

    set setkey(k) {
        this.key = k;
    }
    // set setFileSize(){

    // }
    get getProcessStatus() {
        return this.status;
    }

    get getStatus() {
        return {
            id: this.episode.id,
            status: this.status,
            fileSize: this.fileSize,
            currentSize: this.currentSize
        }
    }

    get fileURL() {
        return `${this.rootServerUrl}/${this.episode.path()}`;
    }

    get downloadURL() {
        return `${this.fileURL()}?${this.getKey()}`;
    }

    async start() {
        this.status = 1;
        const message = `${this.episode.book.id}-${this.episode.id}`;
        

        // get URL
        const data = await DLAgent.fetchEpisodeUrl(this.episode.book.id, this.episode.id)
        console.log(`task:start: ${message}`)
        console.log(data)
        if (data.error) {
            this.status = 3;
            console.log(`${message}: ${data.error}`)
        } else {
            await DLAgent.fetchMP3(data.url, this.episode.path, this);

        }


    }




}


exports.DLTask = DLTask;
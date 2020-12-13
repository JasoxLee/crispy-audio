

class Episode {
    constructor(options){
        this.id = options.id;
        this.name = options.name;
        this.href = options.href;
        this.book = options.book;

    }

    get path() {
        return `${this.book.path}/${this.name}`;
    }


}

exports.Episode = Episode;
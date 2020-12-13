

class Book {
    constructor(options){
        this.rdir =  options.rdir;
        this.id = options.id;
        this.name = options.name;
        this.category = options.category;
        this.href = options.href;
        
    }
    
    get path(){
        return `${this.rdir}/${this.category}/${this.name}`
    }

}

exports.Book = Book;
const generateID = () => Math.random().toString(32).substr(2) + '-'+ Date.now().toString(32) + '-' + '-' + Math.random().toString(36).substr(2) + Date.now().toString(36) ;

export  {
    generateID
};
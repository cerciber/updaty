const search = require('./search')

function miFuncion() {
    const query = 'Node.js tutorial';
    search.buscarEnGoogle(query);
}
  
module.exports = { miFuncion };
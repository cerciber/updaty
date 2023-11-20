const axios = require('axios');
const cheerio = require('cheerio');

async function searchOnGoogle(query) {
  try {
    const respuesta = await axios.get(`https://www.google.com/search?q=${query}`);
    const $ = cheerio.load(respuesta.data);
    const resultados = [];
    $('h3').each((index, elemento) => {
      resultados.push($(elemento).text());
    });
    console.log('Resultados de la búsqueda:');
    resultados.forEach((resultado, index) => {
      console.log(`${index + 1}. ${resultado}`);
    });
  } catch (error) {
    console.error('Error al realizar la búsqueda:', error.message);
  }
}

const query = '40000 dolares a pesos colombianos';
searchOnGoogle(query);
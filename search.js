const axios = require('axios');
const cheerio = require('cheerio');
const { convert } = require('html-to-text');

async function searchOnGoogle(query) {
  try {
    const resultados = [];

    // Obtener los enlaces de los resultados de búsqueda
    const enlaces = await obtenerEnlaces(query);

    // Obtener el contenido de cada enlace
    for (let i = 0; i < enlaces.length && i < 5; i++) {
      const enlace = enlaces[i];
      const respuesta = await axios.get(enlace);

      const $ = cheerio.load(respuesta.data);
      const contenidoPagina = $('body').html(); // Obtener todo el HTML del cuerpo de la página
      const textoLimpio = convert(contenidoPagina, { wordwrap: false });
      
      // console.log(textoLimpio)
      resultados.push(textoLimpio);
    }

    console.log('Contenido de las páginas de búsqueda:');
    resultados.forEach((contenido, index) => {
      console.log(`Contenido de la página ${index + 1}:\n${contenido}\n\n`);
    });
  } catch (error) {
    console.error('Error al realizar la búsqueda:', error.message);
  }
}

async function obtenerEnlaces(query) {
  const respuesta = await axios.get(`https://www.google.com/search?q=${query}`);
  const $ = cheerio.load(respuesta.data);
  const enlaces = [];

  // Extraer enlaces de los resultados de búsqueda
  $('a').each((index, elemento) => {
    const href = $(elemento).attr('href');
    if (href && href.startsWith('/url?q=')) {
        enlaces.push(limpiarUrl(href.substring(7)));
    }
  });
  return enlaces;
}

function limpiarUrl(url) {
    return decodeURIComponent(url.replace(/\&.*/, ''));
  }

const query = '40000 dolares a pesos colombianos';
searchOnGoogle(query);
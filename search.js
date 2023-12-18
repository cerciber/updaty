const axios = require('axios');
const cheerio = require('cheerio');
const { convert } = require('html-to-text');

const cahractersLimit = 10000

async function searchOnGoogle(query, numeroDeEnlaces) {
  console.log("Searching on google...")
  try {
    let resultados = [];

    // Obtener los enlaces de los resultados de búsqueda
    const enlaces = await obtenerEnlaces(query);
    let cont = 0
    for (const enlace of enlaces) {
      try {
        const respuesta = await axios.get(enlace);
        const $ = cheerio.load(respuesta.data);
        let contenidoPagina = $('main');
        let textoLimpio = ""
        contenidoPagina.each((index, element) => {
          textoLimpio = textoLimpio.concat(convert(contenidoPagina.html(), { wordwrap: false }))
        });
        const resultado = textoLimpio.substring(0, cahractersLimit);
        if (resultado.trim() !== '') {
          resultados.push(resultado)
          console.log("  - Information getted from: " + enlace)
          cont++
          if (cont >= numeroDeEnlaces) {
            break
          }
        } else {
          console.log("  - Can't get info from: " + enlace)
        }
      } catch (error) {
        console.log("  - Can't get info from: " + enlace)
      }
    }

    return {
      sucess: true,
      message: resultados
    }

  } catch (error) {
    return {
        sucess: false,
        message: 'Error connecting searching on Google'
    }
  }
}

async function obtenerEnlaces(query) {
  const respuesta = await axios.get(`https://www.google.com/search?q=${query}`);
  const $ = cheerio.load(respuesta.data);
  const enlaces = [];

  // Extraer enlaces de los resultados de búsqueda
  const a = $('a')
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

module.exports = { searchOnGoogle }
const axios = require("axios");
const cheerio = require("cheerio");
const { convert } = require("html-to-text");

async function searchOnGoogle(
  query,
  markups,
  numeroDeEnlaces,
  cahractersLimit,
  logs,
) {
  if (logs) {
    console.log("Searching on google...");
  }
  try {
    let resultados = [];

    // Obtener los enlaces de los resultados de búsqueda
    const enlaces = await obtenerEnlaces(query);
    let cont = 0;
    for (const enlace of enlaces) {
      try {
        const respuesta = await axios.get(enlace);
        const $ = cheerio.load(respuesta.data);
        let textoLimpio = "";
        let foundMarkup = "";
        for (const markup of markups) {
          let contenidoPagina = $(markup);
          textoLimpio = textoLimpio.concat(
            convert(contenidoPagina.html(), { wordwrap: false }),
          );
          if (textoLimpio.trim() !== "") {
            foundMarkup = markup;
            break;
          }
        }
        const resultado = textoLimpio.substring(0, cahractersLimit);
        if (resultado.trim() !== "") {
          resultados.push({
            result: resultado,
            url: enlace,
          });
          if (logs) {
            console.log(
              "  - Information getted by '" + foundMarkup + "' from: " + enlace,
            );
            // console.log("      - " + resultado)
          }
          cont++;
          if (cont >= numeroDeEnlaces) {
            break;
          }
        } else {
          // console.log("  - Can't get info from: " + enlace)
        }
      } catch (error) {
        // console.log("  - Can't get info from: " + enlace)
      }
    }

    return {
      sucess: true,
      message: resultados,
    };
  } catch (error) {
    return {
      sucess: false,
      message: "Error connecting searching on Google",
    };
  }
}

async function obtenerEnlaces(query) {
  const respuesta = await axios.get(`https://www.google.com/search?q=${query}`);
  const $ = cheerio.load(respuesta.data);
  const enlaces = [];
  enlaces.push(`https://www.google.com/search?q=${query}`);

  // Extraer enlaces de los resultados de búsqueda
  $("a").each((index, elemento) => {
    const href = $(elemento).attr("href");
    if (href && href.startsWith("/url?q=")) {
      const cleanURL = limpiarUrl(href.substring(7));
      if (!cleanURL.startsWith("https://maps.google.com")) {
        enlaces.push(cleanURL);
      }
    }
  });
  return enlaces;
}

function limpiarUrl(url) {
  return decodeURIComponent(url.replace(/&.*/, ""));
}

module.exports = { searchOnGoogle };

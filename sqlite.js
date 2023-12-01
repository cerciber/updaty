const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos (creará el archivo si no existe)
const db = new sqlite3.Database('mi_base_de_datos.db');

db.serialize(() => {
    // Crear una tabla (opcional)
    db.run('CREATE TABLE IF NOT EXISTS usuarios (id INT, nombre TEXT)');

    // Insertar datos en la tabla (opcional)
    db.run('INSERT INTO usuarios (id, nombre) VALUES (?, ?)', [1, 'Usuario Ejemplo']);

    // Consultar datos
    db.all('SELECT * FROM usuarios', (err, rows) => {
        if (err) {
            throw err;
        }

        // Procesar los resultados
        rows.forEach((row) => {
            console.log(row.id, row.nombre);
        });
    });
})

// Cerrar la conexión cuando hayas terminado
db.close();
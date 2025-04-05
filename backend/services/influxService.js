const fetch = require("node-fetch");
const csv = require("csvtojson"); // Instala esta librería con `npm install csvtojson`

const INFLUX_URL = "https://us-east-1-1.aws.cloud2.influxdata.com/api/v2/query?org=IoT_Projects";
const INFLUX_TOKEN = "tkXH4y-tEr9FFxkGvoJqeFM0V86vzQAkOUUKJPP7xtd_u7l3qG3iyePIOHBbBYEKLPria0qU4PGux4kuLvcsbQ==";
const INFLUX_BUCKET = "clima-iot";

/**
 * Realiza una consulta a InfluxDB para obtener datos de los sensores.
 * @returns {Promise<Object>} Datos de los sensores en formato JSON.
 */
async function getSensorData() {
    const query = `
    from(bucket: "${INFLUX_BUCKET}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._field == "humedad" or r._field == "tempDHT" or r._field == "tempBMP" or r._field == "presion")
      |> last() // Obtén el último valor de cada campo
  `;

    const response = await fetch(INFLUX_URL, {
        method: "POST",
        headers: {
            "Authorization": `Token ${INFLUX_TOKEN}`,
            "Content-Type": "application/json",
            "Accept": "application/csv", // Solicita CSV como respuesta
        },
        body: JSON.stringify({ query, type: "flux" }),
    });

    const responseText = await response.text();
    console.log("Respuesta de InfluxDB:", responseText);

    if (!response.ok) {
        throw new Error(`Error al consultar InfluxDB: ${responseText}`);
    }

    // Convertir CSV a JSON
    const jsonData = await csv().fromString(responseText);

    // Procesar los datos para estructurarlos como el JSON deseado
    const result = {};
    jsonData.forEach((row) => {
        const field = row["_field"]; // Nombre del campo (e.g., "humedad", "tempDHT")
        const value = parseFloat(row["_value"]); // Valor del campo
        result[field] = value; // Agregar al objeto result
    });

    return result;
}

module.exports = { getSensorData };
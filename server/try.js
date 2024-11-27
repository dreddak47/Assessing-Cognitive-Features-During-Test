require('dotenv').config();
const { createLogger, format, transports } = require('winston');
const DD_API_KEY = process.env.DD_API_KEY; // Ensure your API key is stored securely
const DD_APP_KEY = process.env.DD_APP_KEY;
const axios = require('axios');
const data=[1,2,3]
const id=1
// const httpTransportOptions = {
//     host: 'http-intake.logs.us5.datadoghq.com',
//     path: `/api/v2/logs?dd-api-key=${process.env.DD_API_KEY}&ddsource=nodejs&service=expression&ddtags=id:${id}`,
//     ssl: true
//   };

//   const logger = createLogger({
//     level: 'info',
//     exitOnError: false,
//     format: format.json(),
//     transports: [
//       new transports.Http(httpTransportOptions),
//     ],
//   });

//   module.exports = logger;
//   logger.info(data,{type: 'EXPRESSION',id:id });

  const getLogs = async (id, type) => {
    const query = `@ID:${id}`; // Query filter based on `id` and `type`
    const url = 'https://api.datadoghq.com/api/v2/logs/events/search';
  
    try {
      const response = await axios.post(
        url,
        {
          query,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'DD-API-KEY':DD_API_KEY,
            'DD-APPLICATION-KEY':DD_APP_KEY,
          },
        }
      );
  
      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error.message);
      throw error;
    }
  };
  
  // Usage
  getLogs(id, 'EXPRESSION')
    .then((logs) => {
      console.log('Retrieved Logs:', logs);
    })
    .catch((err) => {
      console.error(err);
    });
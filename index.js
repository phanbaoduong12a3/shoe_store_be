const express = require('express');
const { connectDB } = require("./config/mongoose");
const cros = require('cors');
require('dotenv').config();
const indexRouter = require('./routers');
const rateLimit = require("express-rate-limit");
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const { PORT } = process.env;

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})

const option = {
	definition : {
		openapi: '3.0.0',
		info: {
			title: "Chung shoe store API",
			version: "1.0.0",
			description: "Đây là tổng hợp tất cả API"
		},
		components: {
            securitySchemes: {
                bearerAuth: { 
                    type: 'http',
                    scheme: 'bearer',
                }
            }
        },
		server: [
			{
				url: "http://localhost:8080"
			}
		],
	},
	apis: ['./routers/*.js' , './models/*.js' ]
}

const app = express();
app.use(cros());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(limiter);

const specs = swaggerJsDoc(option);

connectDB();

app.use('/api/v1', indexRouter);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs))

app.listen(PORT, () => {
  console.log('Server listen', PORT || 8080);
})

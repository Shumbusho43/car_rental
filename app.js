const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const expressSslify = require('express-sslify');
const xssClean = require('xss-clean');
const expressRateLimit = require('express-rate-limit');
require('dotenv').config();
const port = process.env.PORT || 3000;
const {
    dbConnection
} = require('./models/connection');
const {
    userRouter
} = require('./routes/user.routes');
const {
    carRouter
} = require('./routes/car.routes');
// Create express server
const app = express();
// Database
dbConnection();
// Trust proxy
app.enable('trust proxy');
// CORS
app.use(cors());
// Public directory
app.use(express.static('public'));
// Read and parse body
app.use(express.json());
// Security headers
app.use(helmet());
// Prevent http param pollution
app.use(hpp());
// Enable https
app.use(cookieParser());
process.env.NODE_ENV === 'production' ? app.use(expressSslify.HTTPS({
        trustProtoHeader: true
    })) :

    // Prevent XSS attacks
    app.use(xssClean());
// Rate limit
const limiter = expressRateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100,
    message: "Too many requests, please try again later"
});
app.use(limiter);

// Routes
app.use('/api/v1/users', userRouter);
app.use("/api/v1/cars", carRouter);

//documentation
// documentation
const swaggerDocs = require("./swagger.json");
app.use(
    "/documentation",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, false, {
        docExpansion: "none",
    })
);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
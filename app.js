const express = require('express');
const cors = require('cors');
const hpp = require('hpp');
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
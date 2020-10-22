require('dotenv').config();
const express = require('express'),
mercadopago = require('mercadopago'),
exphbs  = require('express-handlebars'),
PORT = process.env.PORT || 5000,
app = express();

// Mercadopago config
mercadopago.configure({
    access_token: process.env.TOKEN,
    integrator_id: process.env.INTEGRATOR_ID
});

app.use(express.static('assets'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.get('/', (req, res) => res.render('home'));
app.get('/detail', (req, res) => res.render('detail', req.query));
app.get('/success', (req, res) => res.render('success', req.query));
app.get('/failure', (req, res) => res.render('failure'));
app.get('/pending', (req, res) => res.render('pending'));
app.use('/assets', express.static(__dirname + '/assets'));
app.listen(PORT);

// Webhooks
app.post('/notifications', (req, res) => {
    res.send({ success: true, data: req.body });
    console.log("Request body:", req.body);
});

// Payment route
app.post('/payment', (req, res, next) => {
    let preference = {
        items: [
            {
                id: 1234,
                title: req.query.title,
                unit_price: parseInt(req.query.price),
                quantity: parseInt(req.query.quantity),
                description: 'Dispositivo móvil de Tienda e-commerce',
                picture_url: 'https://eshop.asus.com/media/catalog/product/cache/21/image/9df78eab33525d08d6e5fb8d27136e95/z/e/zenfone5_5.png'
            }
        ],
        external_reference: 'danpoto99@gmail.com',
        payer: {
            name: 'Lalo',
            surname: 'Landa',
            email: 'test_user_63274575@testuser.com',
            phone: {
                area_code: '11',
                number: 22223333  
            },
            address: {
                street_name: 'False',
                street_number: 123,
                zip_code: '1111'
            }
        },
        payment_methods: {
            excluded_payment_methods: [
                {
                    id: 'amex'
                }
            ],
            excluded_payment_types: [
                {
                    id: 'atm'
                }
            ],
            installments: 6
        },
        back_urls: {
            success: 'https://dpotolicchio-mp-commerce-nodejs.herokuapp.com/success',
            pending: 'https://dpotolicchio-mp-commerce-nodejs.herokuapp.com/failure',
            failure: 'https://dpotolicchio-mp-commerce-nodejs.herokuapp.com/pending'
        },
        auto_return: 'approved',
        notification_url: 'https://dpotolicchio-mp-commerce-nodejs.herokuapp.com/notifications',
    };
    mercadopago.preferences.create(preference).then(response => res.redirect(response.body.init_point)).catch(err => next(err));
});
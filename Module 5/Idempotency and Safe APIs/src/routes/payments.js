'use strict';

const router = require('express').Router();
const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {

// 1. Get the idempotency key
const key = req.headers['idempotency-key'];

// 2. Check if the key is missing
if (!key) {
return res.status(400).json({
error: {
code: 'IDEMPOTENCY_KEY_REQUIRED',
message: 'Idempotency key is required'
}
});
}

// 3. Check if the key was already used
if (idempotency.has(key)) {
const savedResponse = idempotency.get(key);
return res.status(savedResponse.status).json(savedResponse.body);
}

// 4. Create a new charge
const amount = req.body && req.body.amount;

const charge = {
id: nextChargeId(),
amount,
status: 'charged'
};

// 5. Save the real charge
charges.push(charge);

// 6. Store the response with the key
const response = {
id: charge.id,
amount: charge.amount,
status: charge.status
};

idempotency.set(key, {
status: 201,
body: response
});

// 7. Send the response
return res.status(201).json(response);
});

module.exports = router;

const db = require('../db');

exports.getInvoice = (req, res) => {
    const orderId = req.params.orderId;
    const sql = `
        SELECT o.OrderID, o.OrderDate, o.PaymentMethod, 
               p.Name, p.Price, od.Quantity
        FROM orders o
        JOIN orderdetails od ON o.OrderID = od.OrderID
        JOIN product p ON od.ProductID = p.ProductID
        WHERE o.OrderID = ?
    `;

    db.query(sql, [orderId], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).send('Error retrieving invoice');
        }

        if (results.length > 0) {
            const invoice = {
                orderId: results[0].OrderID,
                orderDate: results[0].OrderDate,
                paymentMethod: results[0].PaymentMethod,
                items: results.map(item => ({
                    name: item.Name,
                    price: item.Price,
                    quantity: item.Quantity
                }))
            };
            res.render('invoice', { invoice });
        } else {
            res.status(404).send('Invoice not found');
        }
    });
};

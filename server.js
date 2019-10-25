var express = require('express');
var bodyParser = require('body-parser');
const { Pool , Client } = require('pg');


const connectionString = process.env.DATABASE_URL;                        
const pool = new Pool({
    connectionString: connectionString,
    ssl:true
  });
var app = express();

app.set('port', process.env.PORT || 5000);

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/update', function(req, res) {
    pool.connect(function (err, client, done) {
        // watch for any connect issues
        if (err) console.log(err);
        client.query(
            'UPDATE salesforce.Account SET product__c = $1 WHERE LOWER(name) = LOWER($2)',
            [req.body.product.trim(), req.body.name.trim()],
            function(err, result) {
                if (err != null || result.rowCount == 0) {
                  client.query('INSERT INTO salesforce.Account (Phone,Name, Description, product__c) VALUES ($1, $2, $3, $4)',
                  [req.body.phone.trim(), req.body.name.trim(), req.body.description.trim(), req.body.product.trim()],
                  function(err, result) {
                    done();
                    if (err) {
                        res.status(400).json({error: err.message});
                    }
                    else {
                        // this will still cause jquery to display 'Record updated!'
                        // eventhough it was inserted
                        res.json(result);
                    }
                  });
                }
                else {
                    done();
                    res.json(result);
                }
            }
        );
    });
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
}); 
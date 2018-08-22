const request = require('request');
const CryptoJS = require('crypto-js');
const express = require('express');

const app = express();


app.get('/', (req, res) => res.send('Hello! Welcome to Bitmex Interactive backend'));


var today = new Date();
a_month_later = (today.setMonth(today.getMonth() +1)),
  expires = Math.floor(a_month_later/1000) + '';

function buildQueryParams(path) {
  var verb = 'GET',
    param = verb + path + expires,
    sha_256 =  CryptoJS.HmacSHA256(param, 'LW9kekCFhTS4YBfDAD3_2wYE2KJCtbxKoRfWD4lC6Qp0D-7y');
  return sha_256.toString(CryptoJS.enc.Hex);
}

function buildRequestHeader (path, body) {
  var options = {
    url: 'https://www.bitmex.com' + path,
    headers: {
      'Accept': 'application/json',
      'Content-Type' : 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'api-key': 'sZgXy66JnKODhlZm8pWLQWhR',
      'api-signature': buildQueryParams(path),
      'api-expires': expires
    }
  };
  if (body) {
    options.qs = body
  }
  return options;
}

app.get('/balance', (req, resp) => {
  request(buildRequestHeader('/api/v1/user/margin?currency=XBt'), function(err,res, body) {
    if (!err && res.statusCode == 200) {
      var accountBalance = JSON.parse(body) || {};
      resp.send({ balance: accountBalance.amount || 0})
    } else {
      resp.status(500).send("Please validate the user secret and key for Balance endpoint")
    }
  });
});

app.get('/withdrawals', (req, resp) => {
  request(buildRequestHeader('/api/v1/user/walletHistory'), function(err,res, body) {
    if (!err && res.statusCode == 200) {
      var accountTransactions = JSON.parse(body) || [];
      var withdrawals = accountTransactions.filter( function (transaction) { return transaction.transactType == "Withdrawal" });
      resp.send(withdrawals)
    } else {
      resp.status(500).send("Please validate the user secret and key for withdrawals endpoint")
    }
  });
});

app.get('/deposits', (req,resp) => {
  request(buildRequestHeader('/api/v1/user/walletHistory'), function(err,res, body) {
    if (!err && res.statusCode == 200) {
      var accountTransactions = JSON.parse(body) || [];
      var deposits = accountTransactions.find( function (transaction) { return transaction.transactType == "Deposit" });
      resp.send(deposits)
    } else {
      console.log("Please re-check your API key for deposits!", err);
      resp.status(500).send("Please validate the user secret and key for deposit endpoint")
    }
  });
});


app.get('/market-price', (req,resp) => {
  request(buildRequestHeader('/api/v1/instrument?symbol=XBT&count=1&reverse=false'), function(err,res, body) {
    if (!err && res.statusCode == 200) {
      var contract = JSON.parse(body) || [];
      var marketPrice = contract[0].markPrice;
      resp.send({exchangePrice: marketPrice});
    } else {
      resp.status(500).send("Please validate the user secret and key for market-price endpoint")
    }
  });
});



app.listen(3000, () => console.log('Bitmex app listening on port 3000!'));




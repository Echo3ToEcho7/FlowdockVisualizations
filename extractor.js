var
  _,
  rest,
  fs,
  flowurl,
  Promise,
  getAllData,
  username,
  password,
  dataDir,
  flow;

_        = require('lodash');
fs       = require('fs');
rest     = require('restler');
Promise  = require('bluebird');

flowurl  = 'https://api.flowdock.com/flows/rally-software';
flow     = '/' + (process.argv[4] || 'tamnation');
username = process.argv[2];
password = process.argv[3];
dataDir  = 'web/data/';

getAllData = function () {
  var
    allData,
    getNext,
    limit,
    defer;

  allData = [];
  limit = 100;
  defer = Promise.defer();

  getNext = function (id) {
    var d = Promise.defer();

    id = id || '0';

    rest.get(flowurl + flow + '/messages?event=message,comment&sort=asc&limit=' + limit + '&since_id=' + id, {
      username: username,
      password: password
    }).on('complete', function (data) {
      var first = _(data).sortBy('sent').first();
      var last = _(data).sortBy('sent').last();

      console.log('Grabbed another', data.length, new Date(first.sent), first.id, last.id, id);

      if (data.length === limit) {
        getNext(last.id).then(function (res) { d.resolve(data.concat(res)); });
      } else {
        d.resolve(data);
      }
    });

    return d.promise;
  };

  getNext().then(function (res) { defer.resolve(res); });

  return defer.promise;
};

getAllData().then(function (data) {
  fs.writeFileSync(dataDir + 'messages.json', JSON.stringify(data, null, '\t'));
});

rest.get(flowurl + flow + '/users', {
  username: username,
  password: password
}).on('complete', function (data) {
  fs.writeFileSync(dataDir + 'users.json', JSON.stringify(data, null, '\t'));
});

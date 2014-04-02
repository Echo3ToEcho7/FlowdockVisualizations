var
  FDREST = 'https://api.flowdock.com',
  FDSTREAM = 'https://stream.flowdock.com';


var Flow = function Flow(id, name, doc, $q, $rootScope) {
  var self = this;

  this.id = id;
  this.name = name;
  this.doc = doc;
  this.db = new PouchDB('fdvis_' + id);
  this.$q = $q;
  this.$rootScope = $rootScope;
  //this.lastUpdated = null;
};

Object.defineProperty(Flow.prototype, 'lastUpdated', {
  get: function () {
    var d = this.$q.defer();
    this.db.get('lastUpdated').then(
      function (val) { console.log('resolving'); d.resolve(val.lastUpdated); },
      function (err) { d.resolve(null); }
    );
    return d.promise;
  },
  set: function (value) {
    var db = this.db;
    
    console.log('updating value');
    db.get('lastUpdated').then(function (doc) {
      console.log('updated');
      db.put({lastUpdated: value}, 'lastUpdated', doc._rev);
    }, function (err) {
      console.log('created');
      db.put({lastUpdated: value}, 'lastUpdated');
    });
  }
});

Flow.prototype.update = function update(doc) {
  var d = this.$q.defer();
  var db = this.db;
  var rs = this.$rootScope;
  var self = this;

  db.get(doc.id).then(function (old) {
    if (old && old._rev) {
      db.put(doc, doc.id, old._rev).then(function () { 
        this.lastUpdated = new Date();
        rs.$emit('fdvis$flow$updated', self);
        d.resolve(doc);
      });
    } else {
      d.reject(new Error('Document does not extist'));
    }
  });

  return d.promise;
};

Flow.prototype.create = function create(doc) {
  var d = this.$q.defer();
  var db = this.db;
  var rs = this.$rootScope;
  var self = this;

  if (_.isArray(doc)) {
    _.each(doc, function (d) { d._id = d.id + ''; });
    db.bulkDocs({
      docs: doc
    }).then(function () {
      self.lastUpdated = new Date();

      if (_.any(doc, function (d) { return d.event === 'message'; })) {
        rs.$emit('fdvis$new$messages', self);
      }
      if (_.any(doc, function (d) { return d.event === 'comment'; })) {
        rs.$emit('fdvis$new$comments', self);
      }

      rs.$emit('fdvis$flow$updated', self);

      d.resolve(doc);
    }, function (err) { console.error(err); d.reject(err); });
  } else {
    doc._id = doc.id + '';
    db.put(doc, doc._id).then(function () {
      this.lastUpdated = new Date();
      
      if (doc.event === 'message') {
        rs.emit('fdvis$new$message', this);
      }
      if (doc.event === 'comment') {
        rs.emit('fdvis$new$comment', this);
      }

      d.resolve(doc);
    });
  }

  return d.promise;
};

Flow.prototype.get = function get(id) {
  var d = this.$q.defer();
  var self = this;

  this.db.get(id).then(function (doc) {
    self.$rootScope.$apply(function () {
      d.resolve(doc);
    });
  });

  return d.promise;
};

var filterMessages = function (db, $q, $rootScope, event) {
  var d = $q.defer();

  db.query(function (doc, emit) {
    if (event) {
      if (doc.event === event) emit(doc);
    } else {
      emit(doc);
    }
  }).then(function (res) {
    d.resolve(_.map(res.rows, function (r) { return r.key; }));
  });

  return d.promise;
};

Flow.prototype.messages = function () {
  return filterMessages(this.db, this.$q, this.$rootScope, 'message');
};

Flow.prototype.comments = function () {
  return filterMessages(this.db, this.$q, this.$rootScope, 'comment');
};

Flow.prototype.all = function () {
  return filterMessages(this.db, this.$q, this.$rootScope);
};

var mod = angular.module('data', [])
.service('dataFlows', function ($rootScope, $q, $http) {
  var main = new PouchDB('flowvis--main');
  var users = new PouchDB('flowvis--users');
  var cache = {};
  var activeFID = null;

  var downloadAllMessages = function (flowurl) {
    var
      allData,
      getNext,
      limit,
      defer;

    allData = [];
    limit = 100;
    defer = $q.defer();

    getNext = function (id) {
      var d = $q.defer();

      id = id || '0';

      $http.get(flowurl + '/messages?event=message,comment&sort=asc&limit=' + limit + '&since_id=' + id)
        .success(function (data) {
          var first = _(data).sortBy('sent').first();
          var last = _(data).sortBy('sent').last();

          //console.log('Grabbed another', data.length, new Date(first.sent), first.id, last.id, id);
          defer.notify(data);

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

  var download = function (path, db) {
    var d = $q.defer();

    db.destroy().then(function () {
      $http.get(path).success(function (data) {
        _.each(data, function (d) {
          d._id = d.id + '';
        });

        db.bulkDocs({
          docs: data
        }).then(function () { d.resolve(data); }, function (err) { d.reject(err); });
      });
    });

    return d.promise;
  };
  
  return {
    setActiveFlowID: function (fid) {
      activeFID = fid;
    },

    getActiveFlowID: function () {
      return activeFID;
    },

    getActiveFlow: function () {
      console.log('activeFID', activeFID);
      return this.getFlow(activeFID);
    },

    getFlow: function (name) {
      var d = $q.defer();

      main.query(function (doc, emit) {
        if ((doc.name === name) || (doc.id === name)) emit(doc);
      }).then(function (res) {
        var
          n,
          doc;

        if (res.total_rows === 1) {
          n = res.rows[0].id;
          doc = res.rows[0].key;
          
          if (!cache.hasOwnProperty(n)) {
            cache[n] = new Flow(doc.id, name, doc, $q, $rootScope);
          }
          d.resolve(cache[n]);
        } else {
          d.resolve(null);
        }
      }, function (err) { d.reject (err); });

      return d.promise;
    },

    getAllFlows: function () {
      var d = $q.defer();

      main.query(function (doc, emit) { emit(doc); }).then(function (res) {
        var ret;

        ret = _.map(res.rows, function (row) {
          var n, doc;
          n = row.id;
          doc = row.key;
          
          if (!cache.hasOwnProperty(n)) {
            cache[n] = new Flow(doc.id, name, doc, $q, $rootScope);
          }

          return cache[n];
        });

        d.resolve(ret);
      });

      return d.promise;
    },

    getUser: function (id) {
      var d = $q.defer();
      users.get(id).then(function (user) { d.resolve(user); });
      return d.promise;
    },

    getAllUsers: function () {
      var d = $q.defer();

      users.query(function (doc, emit) {
        emit(doc);
      }).then(function (res) {
        d.resolve(_.map(res.rows, function (u) { return u.key; }));
      });

      return d.promise;
    },

    listFlows: function () {
      var d = $q.defer();

      main.query(function (doc, emit) {
        emit({ id: doc.id, name: doc.name });
      }).then(function (res) {
        d.resolve(_.map(res.rows, function (r) { return r.key; }));
      });

      return d.promise;
    },

    downloadFlows: function () {
      return download(FDREST + '/flows', main);
    },

    downloadUsers: function () {
      return download(FDREST + '/users', users);
    },

    downloadMessages: function (flow) {
      var d = $q.defer();

      downloadAllMessages(flow.doc.url).then(function (messages) {
        flow.db.destroy();
        flow.create(messages).then(function () { d.resolve(messages); }, function (err) { console.error(err); });
      });

      return d.promise;
    }
  };
});


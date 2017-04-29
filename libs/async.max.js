/*global setTimeout: false, console: false */
(function () {
    var async = {};

    // global on the server, window in the browser
    var root = this;

    var previous_async = root.async;

    async.noConflict = () => {
        root.async = previous_async;
        return async;
    };

    //// cross-browser compatiblity functions ////

    var _forEach = (arr, iterator) => {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = (arr, iterator) => {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _forEach(arr, (x, i, a) => {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = (arr, iterator, memo) => {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _forEach(arr, (x, i, a) => {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = obj => {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        async.nextTick = fn => {
            setTimeout(fn, 0);
        };
    }
    else {
        async.nextTick = process.nextTick;
    }

    async.forEach = (arr, iterator, callback) => {
        callback = callback || (() => {});
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _forEach(arr, x => {
            iterator(x, err => {
                if (err) {
                    callback(err);
                    callback = () => {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback(null);
                    }
                }
            });
        });
    };

    async.forEachSeries = (arr, iterator, callback) => {
        callback = callback || (() => {});
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = () => {
            iterator(arr[completed], err => {
                if (err) {
                    callback(err);
                    callback = () => {};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback(null);
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };

    async.forEachLimit = (arr, limit, iterator, callback) => {
        callback = callback || (() => {});
        if (!arr.length || limit <= 0) {
            return callback();
        }
        var completed = 0;
        var started = 0;
        var running = 0;

        (function replenish () {
            if (completed === arr.length) {
                return callback();
            }

            while (running < limit && started < arr.length) {
                started += 1;
                running += 1;
                iterator(arr[started - 1], err => {
                    if (err) {
                        callback(err);
                        callback = () => {};
                    }
                    else {
                        completed += 1;
                        running -= 1;
                        if (completed === arr.length) {
                            callback();
                        }
                        else {
                            replenish();
                        }
                    }
                });
            }
        })();
    };


    var doParallel = fn => function () {
        var args = Array.prototype.slice.call(arguments);
        return fn(...[async.forEach].concat(args));
    };
    var doSeries = fn => function () {
        var args = Array.prototype.slice.call(arguments);
        return fn(...[async.forEachSeries].concat(args));
    };


    var _asyncMap = (eachfn, arr, iterator, callback) => {
        var results = [];
        arr = _map(arr, (x, i) => ({
            index: i,
            value: x
        }));
        eachfn(arr, (x, callback) => {
            iterator(x.value, (err, v) => {
                results[x.index] = v;
                callback(err);
            });
        }, err => {
            callback(err, results);
        });
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);


    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = (arr, memo, iterator, callback) => {
        async.forEachSeries(arr, (x, callback) => {
            iterator(memo, x, (err, v) => {
                memo = v;
                callback(err);
            });
        }, err => {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = (arr, memo, iterator, callback) => {
        var reversed = _map(arr, x => x).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = (eachfn, arr, iterator, callback) => {
        var results = [];
        arr = _map(arr, (x, i) => ({
            index: i,
            value: x
        }));
        eachfn(arr, (x, callback) => {
            iterator(x.value, v => {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, err => {
            callback(_map(results.sort((a, b) => a.index - b.index), x => x.value));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = (eachfn, arr, iterator, callback) => {
        var results = [];
        arr = _map(arr, (x, i) => ({
            index: i,
            value: x
        }));
        eachfn(arr, (x, callback) => {
            iterator(x.value, v => {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, err => {
            callback(_map(results.sort((a, b) => a.index - b.index), x => x.value));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = (eachfn, arr, iterator, main_callback) => {
        eachfn(arr, (x, callback) => {
            iterator(x, result => {
                if (result) {
                    main_callback(x);
                    main_callback = () => {};
                }
                else {
                    callback();
                }
            });
        }, err => {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = (arr, iterator, main_callback) => {
        async.forEach(arr, (x, callback) => {
            iterator(x, v => {
                if (v) {
                    main_callback(true);
                    main_callback = () => {};
                }
                callback();
            });
        }, err => {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = (arr, iterator, main_callback) => {
        async.forEach(arr, (x, callback) => {
            iterator(x, v => {
                if (!v) {
                    main_callback(false);
                    main_callback = () => {};
                }
                callback();
            });
        }, err => {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = (arr, iterator, callback) => {
        async.map(arr, (x, callback) => {
            iterator(x, (err, criteria) => {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria});
                }
            });
        }, (err, results) => {
            if (err) {
                return callback(err);
            }
            else {
                var fn = (left, right) => {
                    var a = left.criteria;
                    var b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), x => x.value));
            }
        });
    };

    async.auto = (tasks, callback) => {
        callback = callback || (() => {});
        var keys = _keys(tasks);
        if (!keys.length) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        var addListener = fn => {
            listeners.unshift(fn);
        };
        var removeListener = fn => {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = () => {
            _forEach(listeners.slice(0), fn => {
                fn();
            });
        };

        addListener(() => {
            if (_keys(results).length === keys.length) {
                callback(null, results);
                callback = () => {};
            }
        });

        _forEach(keys, k => {
            var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];
            var taskCallback = function (err) {
                if (err) {
                    callback(err);
                    // stop subsequent errors hitting callback multiple times
                    callback = () => {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    taskComplete();
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = () => _reduce(requires, (a, x) => a && results.hasOwnProperty(x), true) && !results.hasOwnProperty(k);
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = () => {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.waterfall = (tasks, callback) => {
        callback = callback || (() => {});
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = iterator => function (err) {
            if (err) {
                callback(err);
                callback = () => {};
            }
            else {
                var args = Array.prototype.slice.call(arguments, 1);
                var next = iterator.next();
                if (next) {
                    args.push(wrapIterator(next));
                }
                else {
                    args.push(callback);
                }
                async.nextTick(() => {
                    iterator(...args);
                });
            }
        };
        wrapIterator(async.iterator(tasks))();
    };

    async.parallel = (tasks, callback) => {
        callback = callback || (() => {});
        if (tasks.constructor === Array) {
            async.map(tasks, (fn, callback) => {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.forEach(_keys(tasks), (k, callback) => {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, err => {
                callback(err, results);
            });
        }
    };

    async.series = (tasks, callback) => {
        callback = callback || (() => {});
        if (tasks.constructor === Array) {
            async.mapSeries(tasks, (fn, callback) => {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.forEachSeries(_keys(tasks), (k, callback) => {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, err => {
                callback(err, results);
            });
        }
    };

    async.iterator = tasks => {
        var makeCallback = index => {
            var fn = function(...args) {
                if (tasks.length) {
                    tasks[index].apply(null, args);
                }
                return fn.next();
            };
            fn.next = () => (index < tasks.length - 1) ? makeCallback(index + 1): null;
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn(...args.concat(Array.prototype.slice.call(arguments)));
        };
    };

    var _concat = (eachfn, arr, fn, callback) => {
        var r = [];
        eachfn(arr, (x, cb) => {
            fn(x, (err, y) => {
                r = r.concat(y || []);
                cb(err);
            });
        }, err => {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = (test, iterator, callback) => {
        if (test()) {
            iterator(err => {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.until = (test, iterator, callback) => {
        if (!test()) {
            iterator(err => {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.queue = (worker, concurrency) => {
        var workers = 0;
        var q = {
            tasks: [],
            concurrency,
            saturated: null,
            empty: null,
            drain: null,
            push(data, callback) {
                if(data.constructor !== Array) {
                    data = [data];
                }
                _forEach(data, task => {
                    q.tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    if (q.saturated && q.tasks.length == concurrency) {
                        q.saturated();
                    }
                    async.nextTick(q.process);
                });
            },
            process() {
                if (workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if(q.empty && q.tasks.length == 0) q.empty();
                    workers += 1;
                    worker(task.data, function(...args) {
                        workers -= 1;
                        if (task.callback) {
                            task.callback(...args);
                        }
                        if(q.drain && q.tasks.length + workers == 0) q.drain();
                        q.process();
                    });
                }
            },
            length() {
                return q.tasks.length;
            },
            running() {
                return workers;
            }
        };
        return q;
    };

    var _console_fn = name => function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        fn(...args.concat([function (err) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (typeof console !== 'undefined') {
                if (err) {
                    if (console.error) {
                        console.error(err);
                    }
                }
                else if (console[name]) {
                    _forEach(args, x => {
                        console[name](x);
                    });
                }
            }
        }]));
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = (fn, hasher) => {
        var memo = {};
        var queues = {};
        hasher = hasher || (x => x);
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher(...args);
            if (key in memo) {
                callback(...memo[key]);
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn(...args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = fn => function(...args) {
      return (fn.unmemoized || fn).apply(null, args);
    };

    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define('async', [], () => async);
    }
    // Node.js
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }
}());

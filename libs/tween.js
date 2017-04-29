/**
 * @author sole / http://soledadpenades.com
 * @author mr.doob / http://mrdoob.com
 * @author Robert Eisele / http://www.xarg.org
 * @author Philippe / http://philippe.elsass.me
 * @author Robert Penner / http://www.robertpenner.com/easing_terms_of_use.html
 * @author Paul Lewis / http://www.aerotwist.com/
 * @author lechecacharro
 * @author Josh Faul / http://jocafa.com/
 * @author egraether / http://egraether.com/
 */

var TWEEN = TWEEN || ( (() => {

	var _tweens = [];

	return {

		REVISION: '6',

		getAll() {

			return _tweens;

		},

		removeAll() {

			_tweens = [];

		},

		add(tween) {

			_tweens.push( tween );

		},

		remove(tween) {

			var i = _tweens.indexOf( tween );

			if ( i !== -1 ) {

				_tweens.splice( i, 1 );

			}

		},

		update(time) {

			var i = 0;
			var num_tweens = _tweens.length;
			var time = time !== undefined ? time : Date.now();

			while ( i < num_tweens ) {

				if ( _tweens[ i ].update( time ) ) {

					i ++;

				} else {

					_tweens.splice( i, 1 );
					num_tweens --;

				}

			}

		}

	};

}) )();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _duration = 1000;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTween = null;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;

	this.to = function ( properties, duration ) {

		if ( duration !== null ) {

			_duration = duration;

		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function ( time ) {

		TWEEN.add( this );

		_startTime = time !== undefined ? time : Date.now();
		_startTime += _delayTime;

		for ( var property in _valuesEnd ) {

			// This prevents the engine from interpolating null values
			if ( _object[ property ] === null ) {

				continue;

			}

			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {

				if ( _valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

		}

		return this;

	};

	this.stop = function () {

		TWEEN.remove( this );
		return this;

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function ( interpolation ) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function ( chainedTween ) {

		_chainedTween = chainedTween;
		return this;

	};

	this.onUpdate = function ( onUpdateCallback ) {

		_onUpdateCallback = onUpdateCallback;
		return this;

	};

	this.onComplete = function ( onCompleteCallback ) {

		_onCompleteCallback = onCompleteCallback;
		return this;

	};

	this.update = time => {

		if ( time < _startTime ) {

			return true;

		}

		var elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( var property in _valuesStart ) {

			var start = _valuesStart[ property ];
			var end = _valuesEnd[ property ];

			if ( end instanceof Array ) {

				_object[ property ] = _interpolationFunction( end, value );

			} else {

				_object[ property ] = start + ( end - start ) * value;

			}

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed == 1 ) {

			if ( _onCompleteCallback !== null ) {

				_onCompleteCallback.call( _object );

			}

			if ( _chainedTween !== null ) {

				_chainedTween.start();

			}

			return false;

		}

		return true;

	};

};

TWEEN.Easing = {

	Linear: {

		None(k) {

			return k;

		}

	},

	Quadratic: {

		In(k) {

			return k * k;

		},

		Out(k) {

			return k * ( 2 - k );

		},

		InOut(k) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In(k) {

			return k * k * k;

		},

		Out(k) {

			return --k * k * k + 1;

		},

		InOut(k) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In(k) {

			return k * k * k * k;

		},

		Out(k) {

			return 1 - --k * k * k * k;

		},

		InOut(k) {

			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In(k) {

			return k * k * k * k * k;

		},

		Out(k) {

			return --k * k * k * k * k + 1;

		},

		InOut(k) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In(k) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out(k) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut(k) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In(k) {

			return k === 0 ? 0 : 1024 ** (k - 1);

		},

		Out(k) {

			return k === 1 ? 1 : 1 - 2 ** (- 10 * k);

		},

		InOut(k) {

			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * (1024 ** (k - 1));
			return 0.5 * ( - (2 ** (- 10 * (k - 1))) + 2 );

		}

	},

	Circular: {

		In(k) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out(k) {

			return Math.sqrt( 1 - --k * k );

		},

		InOut(k) {

			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In(k) {
            var s;
            var a = 0.1;
            var p = 0.4;
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
            return - ( a * (2 ** (10 * (k -= 1))) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
        },

		Out(k) {
            var s;
            var a = 0.1;
            var p = 0.4;
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
            return a * (2 ** (- 10 * k)) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1;
        },

		InOut(k) {
            var s;
            var a = 0.1;
            var p = 0.4;
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
            if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * (2 ** (10 * (k -= 1))) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
            return a * (2 ** (-10 * (k -= 1))) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
        }

	},

	Back: {

		In(k) {

			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );

		},

		Out(k) {

			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut(k) {

			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In(k) {

			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

		},

		Out(k) {

			if ( k < ( 1 / 2.75 ) ) {

				return 7.5625 * k * k;

			} else if ( k < ( 2 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

			} else if ( k < ( 2.5 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

			} else {

				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

			}

		},

		InOut(k) {

			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear(v, k) {
        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor( f );
        var fn = TWEEN.Interpolation.Utils.Linear;

        if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
        if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

        return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );
    },

	Bezier(v, k) {
        var b = 0;
        var n = v.length - 1;
        var pw = Math.pow;
        var bn = TWEEN.Interpolation.Utils.Bernstein;
        var i;

        for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

        return b;
    },

	CatmullRom(v, k) {
        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor( f );
        var fn = TWEEN.Interpolation.Utils.CatmullRom;

        if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}
    },

	Utils: {

		Linear(p0, p1, t) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein(n, i) {

			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( (() => {

			var a = [ 1 ];

			return n => {
                var s = 1;
                var i;
                if ( a[ n ] ) return a[ n ];
                for ( i = n; i > 1; i-- ) s *= i;
                return a[ n ] = s;
            };

		}) )(),

		CatmullRom(p0, p1, p2, p3, t) {
            var v0 = ( p2 - p0 ) * 0.5;
            var v1 = ( p3 - p1 ) * 0.5;
            var t2 = t * t;
            var t3 = t * t2;
            return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;
        }

	}

};

/*
 * Pixastic Lib - Edge detection 2 - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 * 
 * Contribution by Oliver Hunt (http://nerget.com/, http://nerget.com/canvas/edgeDetection.js). Thanks Oliver!
 * Contribued some more params: noiv, Cologne, 2012
 */

Pixastic.Actions.edges3 = {
	process(params) {

		if (Pixastic.Client.hasCanvasImageData()) {

			var data = Pixastic.prepareData(params);
			var dataCopy = Pixastic.prepareData(params, true);

			var rect = params.options.rect;
			var w = rect.width;
			var h = rect.height;

			var w4 = w * 4;
			var pixel = w4 + 4; // Start at (1,1)
			var hm1 = h - 1;
			var wm1 = w - 1;

			var tL = params.options.tLower || 100;
			var tU = params.options.tUpper || 170;

			var cU = params.options.cUpp || [255, 255, 255, 255];
			var cL = params.options.cLow || [  0,   0,   0, 255];

			for (var y = 1; y < hm1; ++y) {
                // Prepare initial cached values for current row
                var centerRow = pixel - 4;
                var priorRow = centerRow - w4;
                var nextRow = centerRow + w4;

                var r1 = - dataCopy[priorRow]   - dataCopy[centerRow]   - dataCopy[nextRow];
                var g1 = - dataCopy[++priorRow] - dataCopy[++centerRow] - dataCopy[++nextRow];
                var b1 = - dataCopy[++priorRow] - dataCopy[++centerRow] - dataCopy[++nextRow];

                var rp = dataCopy[priorRow += 2];
                var gp = dataCopy[++priorRow];
                var bp = dataCopy[++priorRow];

                var rc = dataCopy[centerRow += 2];
                var gc = dataCopy[++centerRow];
                var bc = dataCopy[++centerRow];

                var rn = dataCopy[nextRow += 2];
                var gn = dataCopy[++nextRow];
                var bn = dataCopy[++nextRow];

                var r2 = - rp - rc - rn;
                var g2 = - gp - gc - gn;
                var b2 = - bp - bc - bn;

                var x;
                var r;
                var g;
                var b;
                var p;

                // Main convolution loop
                for (x = 1; x < wm1; ++x) {

					centerRow = pixel + 4;
					priorRow = centerRow - w4;
					nextRow = centerRow + w4;
					
					r = 127 + r1 - rp - (rc * -8) - rn;
					g = 127 + g1 - gp - (gc * -8) - gn;
					b = 127 + b1 - bp - (bc * -8) - bn;
					
					r1 = r2;
					g1 = g2;
					b1 = b2;
					
					rp = dataCopy[  priorRow];
					gp = dataCopy[++priorRow];
					bp = dataCopy[++priorRow];
					
					rc = dataCopy[  centerRow];
					gc = dataCopy[++centerRow];
					bc = dataCopy[++centerRow];
					
					rn = dataCopy[  nextRow];
					gn = dataCopy[++nextRow];
					bn = dataCopy[++nextRow];
					
					r += (r2 = - rp - rc - rn);
					g += (g2 = - gp - gc - gn);
					b += (b2 = - bp - bc - bn);

					p = (r+g+b)/3;
					p = (p > tU) ? cU : (p < tL) ? cU : cL;

					data[pixel]   = p[0];
					data[++pixel] = p[1];
					data[++pixel] = p[2];
					data[++pixel] = p[3];

					pixel+=1;

				}
                pixel += 8;
            }
			return true;
		}
	},
	checkSupport() {
		// return Pixastic.Client.hasCanvasImageData();
		return true;
	}
};
